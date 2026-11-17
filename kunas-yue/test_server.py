import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

os.environ['YUE_DATA_DIR'] = tempfile.mkdtemp()
import server


class ServerTests(unittest.TestCase):
    def setUp(self):
        self.client = server.app.test_client()
        self.data = {'style': 'Piano pop', 'lyrics': '[Verse]\nA new day', 'seed': 42}
        self.headers = {'X-CSRF-Token': server.TOKEN}

    def test_health_and_form(self):
        self.assertEqual(self.client.get('/health').status_code, 200)
        self.assertIn(b'Create song', self.client.get('/').data)

    def test_csrf_and_validation(self):
        self.assertEqual(self.client.post('/api/songs', json=self.data).status_code, 403)
        for invalid in [{}, {'style':'x','lyrics':'x','seed':True}, {'style':'x','lyrics':'x','seed':-1}]:
            self.assertEqual(self.client.post('/api/songs', json=invalid, headers=self.headers).status_code, 400)

    def test_single_job_failure_and_retry(self):
        with patch('server.threading.Thread'):
            result = self.client.post('/api/songs', json=self.data, headers=self.headers)
            self.assertEqual(result.status_code, 202)
            state = result.json
            directory = server.JOBS / state['id']
            self.assertEqual(json.loads((directory/'input.json').read_text())['lyrics'], self.data['lyrics'])
            self.assertEqual(self.client.post('/api/songs', json=self.data, headers=self.headers).status_code, 409)
        with patch('server.subprocess.run') as run:
            run.return_value.returncode = 1
            server.run_job(directory, state)
        self.assertFalse(server.LOCK.locked())
        self.assertEqual(json.loads((directory/'status.json').read_text())['status'], 'failed')
        self.assertEqual(self.client.get(f'/songs/{state["id"]}/input.json').status_code, 404)
        self.assertEqual(self.client.get(f'/songs/{state["id"]}/generation.log').status_code, 200)

    def test_success_and_truncation(self):
        with patch('server.threading.Thread'):
            state = self.client.post('/api/songs', json=self.data, headers=self.headers).json
        directory = server.JOBS / state['id']
        (directory/'audio.flac').write_bytes(b'test audio')
        (directory/'result.json').write_text(json.dumps({'truncated':{'semantic':True}}))
        with patch('server.subprocess.run') as run:
            run.return_value.returncode = 0
            server.run_job(directory, state)
        saved = json.loads((directory/'status.json').read_text())
        self.assertEqual(saved['status'], 'complete')
        self.assertIn('cut short', saved['message'])
        self.assertEqual(self.client.get(f'/songs/{state["id"]}/audio.flac').data, b'test audio')

    def test_path_traversal(self):
        self.assertEqual(self.client.get('/songs/invalid/audio.flac').status_code, 404)
        self.assertEqual(self.client.get('/songs/' + 'a'*32 + '/status.json').status_code, 404)


if __name__ == '__main__':
    unittest.main()
