"""Small Umbrel adapter; generation stays in the pinned upstream YuE2 package."""
import json
import os
from pathlib import Path
import re
import secrets
import subprocess
import sys
import threading
import uuid
from datetime import datetime, timezone
from flask import Flask, abort, jsonify, render_template, request, send_file

ROOT = Path(os.environ.get('YUE_DATA_DIR', '/data'))
JOBS = ROOT / 'songs'
JOBS.mkdir(parents=True, exist_ok=True)
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 65536
TOKEN = secrets.token_urlsafe(32)
LOCK = threading.Lock()
FILES = {'audio.flac', 'score.abc', 'request.json', 'config.json', 'result.json', 'semantic.npy', 'latent.npy', 'generation.log'}


def write_state(directory, state):
    temporary = directory / 'status.tmp'
    temporary.write_text(json.dumps(state), encoding='utf-8')
    temporary.replace(directory / 'status.json')


# A container restart terminates its generation subprocess, but retains the song.
for status_path in JOBS.glob('*/status.json'):
    state = json.loads(status_path.read_text())
    if state['status'] == 'running':
        state.update(status='interrupted', message='Generation stopped when the app restarted. Start a new song to retry.')
        write_state(status_path.parent, state)


def job_path(job_id):
    if not re.fullmatch(r'[0-9a-f]{32}', job_id):
        abort(404)
    directory = JOBS / job_id
    if not (directory / 'status.json').is_file():
        abort(404)
    return directory


def validate(data):
    if not isinstance(data, dict):
        raise ValueError('Expected a song request.')
    clean = {}
    for key, limit in [('style', 2000), ('lyrics', 12000)]:
        value = data.get(key)
        if not isinstance(value, str) or not value.strip() or len(value) > limit:
            raise ValueError(f'{key.capitalize()} is required (maximum {limit} characters).')
        clean[key] = value.strip()
    seed = data.get('seed', 42)
    if type(seed) is not int or not 0 <= seed <= 2147483647:
        raise ValueError('Seed must be a whole number from 0 to 2147483647.')
    clean.update(seed=seed, cot='full')
    return clean


def run_job(directory, state):
    try:
        with (directory / 'generation.log').open('w') as log:
            result = subprocess.run([sys.executable, str(Path(__file__).with_name('worker.py')), str(directory)],
                                    stdout=log, stderr=subprocess.STDOUT, timeout=21600, check=False)
        if result.returncode != 0 or not (directory / 'audio.flac').is_file():
            state.update(status='failed', message='Generation failed. Open the generation log for details; check free GPU memory before retrying.')
        else:
            info = json.loads((directory / 'result.json').read_text())
            clipped = any(info.get('truncated', {}).values())
            state.update(status='complete', message='Song saved. Generation reached its length limit; the ending may be cut short.' if clipped else 'Song saved.')
    except subprocess.TimeoutExpired:
        state.update(status='failed', message='Generation exceeded six hours and was stopped. Your files and log are retained.')
    except Exception:
        app.logger.exception('Generation worker failed')
        state.update(status='failed', message='Could not run the generation worker. Check the app logs.')
    finally:
        try:
            write_state(directory, state)
        finally:
            LOCK.release()


@app.after_request
def headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Cache-Control'] = 'no-store'
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self'; media-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'self'"
    return response


@app.get('/')
def index():
    return render_template('index.html', csrf=TOKEN)


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.get('/api/songs')
def songs():
    records = []
    for p in sorted(JOBS.glob('*/status.json'), key=lambda p: p.stat().st_mtime, reverse=True):
        state = json.loads(p.read_text())
        state['files'] = [name for name in sorted(FILES) if (p.parent / name).is_file()]
        records.append(state)
    return jsonify(records)


@app.post('/api/songs')
def create():
    if not secrets.compare_digest(request.headers.get('X-CSRF-Token', ''), TOKEN):
        abort(403)
    try:
        data = validate(request.get_json(silent=True))
    except ValueError as exc:
        return {'error': str(exc)}, 400
    if not LOCK.acquire(blocking=False):
        return {'error': 'A song is already generating. Wait for it to finish.'}, 409
    try:
        job_id = uuid.uuid4().hex
        directory = JOBS / job_id
        directory.mkdir()
        (directory / 'input.json').write_text(json.dumps(data), encoding='utf-8')
        state = {'id': job_id, 'created': datetime.now(timezone.utc).isoformat(), 'style': data['style'],
                 'status': 'running', 'message': 'Generating. First use downloads the models and may take considerably longer.'}
        write_state(directory, state)
        threading.Thread(target=run_job, args=(directory, state), daemon=True).start()
    except Exception:
        LOCK.release()
        raise
    return state, 202


@app.get('/songs/<job_id>/<filename>')
def download(job_id, filename):
    if filename not in FILES:
        abort(404)
    path = job_path(job_id) / filename
    if not path.is_file():
        abort(404)
    return send_file(path, as_attachment=filename != 'audio.flac', conditional=True)
