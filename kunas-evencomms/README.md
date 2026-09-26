# EVENCOMMS 0.1.0 For Umbrel

Local communication between an Even glasses wearer and a browser operator, with
short-chunk English CPU transcription and optional human-approved Ollama replies.
This is an **early release**: physical G2/phone behavior, hardware installation,
performance and endurance have not been verified. The screenshots contain
synthetic conversations, not evidence of hardware testing.

## Release Status

- Source: [9vibes/EVENCOMMS v0.1.0](https://github.com/9vibes/EVENCOMMS/tree/v0.1.0), commit `3706137`.
- Both app services pin `ghcr.io/9vibes/evencomms:0.1.0` to
  `sha256:491e90e678e0b90ba72c50a262900a42a8738213cd654377a714b27a05befc84`.
  Anonymous download of the manifest, configuration and every layer was verified
  with SHA256 checks. No registry login is needed to pull this release.
- Initial platform: `linux/amd64` only. Raspberry Pi and other ARM hosts are not
  supported. Speech recognition uses CPU/int8, not GPU; no NVIDIA runtime is needed.
- [Release checks](https://github.com/9vibes/EVENCOMMS/actions/runs/36224561598)
  passed unit/browser tests, real CPU transcription from synthetic speech, cold
  model download, model-cache reuse, database persistence, authentication and
  WebSocket checks with same-host and explicitly allowed rewritten-host origins.
  The tested container runs non-root with a read-only root filesystem.
- Docker Compose CLI validation passed with a structural substitute for Umbrel's
  supplied proxy service. Actual Umbrel installation and physical G2/phone testing
  remain unverified; this is not a hardware acceptance result.
- Adding this package to the store does not automatically install it on a Stone
  or any other Umbrel host. No installation on a Stone is claimed.

## Installation And First Pairing

1. Add `https://github.com/9vibes/KNS-Umbrel` in Umbrel's community app store
   settings, or refresh the store if it is already installed.
2. Install **EVENCOMMS** (`kunas-evencomms`) on a compatible x86-64 Umbrel host.
   Open it from Umbrel, normally at `http://umbrel.local:28097` (use your actual
   device domain). Port `28097` belongs to the Umbrel app proxy; this package does
   not directly publish container port `8000`.
3. Sign in to the operator console using the generated application password
   shown by Umbrel. No username or shared default password is required.
4. Select **Pair a wearer** to generate a single-use code valid for five minutes.
   In another browser client, open
   `http://umbrel.local:28097/glasses.html?simulate=1`, enter the code and pair.
   Use the same reachable origin as the operator or configure origins below.
5. Select the wearer's conversation in the operator console. Send a typed question
   from the simulator, then write and send an operator reply. Browser simulation
   does not validate glasses gestures, real microphone capture or phone behavior.

The generated password is passed as `ADMIN_PASSWORD` from Umbrel's nonempty
`APP_PASSWORD`; Compose refuses to start without it. EVENCOMMS handles operator
login and wearer token authentication itself, so `PROXY_AUTH_ADD` is `false`.
Operator tokens expire after eight hours and are lost on server restart; log in
again. Wearer pairing persists until its conversation is deleted.

## Phone And Glasses

Use the Even phone companion app **2.2.10 or later**, Even Hub SDK **0.0.16 or
later**, and compatible G2 firmware that supports hold/release events. Keep the
phone and Umbrel on the same trusted LAN for initial testing. The phone must
resolve and reach the configured backend address; `localhost` on the phone is not
the Umbrel host.

For development, use the official Even Hub developer workflow and its development
QR to load the phone-reachable `/glasses.html` URL. Do not use `?simulate=1` for
physical glasses testing. Use trusted HTTPS for phone deployment and private
conversations; the ordinary HTTP LAN URL is not a secure production setup.

For a packaged client, use the complete tagged source checkout, not this store
directory. From the source's `frontend` directory:

```sh
npm ci
npm run build
EVENCOMMS_ORIGIN=https://comms.example.net npm run pack
```

Replace the example with your reachable HTTPS backend origin before packaging.
`EVENCOMMS_ORIGIN` is a build/package setting, not a server environment setting.
Verify the generated package's network permissions explicitly allow that HTTPS
origin and the corresponding WebSocket destination if the packaging schema
requires it. Rebuild/repack when the backend origin changes. Add the **actual
packaged client origin** to server `ALLOWED_ORIGINS`; inspect the SDK/client Origin
or packaging output rather than assuming it equals the backend URL. Do not ship
an example-origin package or wildcard network permissions.

Implemented wearer controls, still requiring physical acceptance testing:

- Single tap finalizes preceding speech, deletes the draft's last word and pauses
  capture for correction. Use **Start listening** to speak a replacement.
- Hold freezes capture; release finalizes preceding speech and sends once.
  Failed transcription requires explicit retry or discard, not a partial send.
- Double tap exits under the Even convention. It is not Send; no alternate root
  gesture is required.
- Swipe navigates longer text; the contextual menu offers pause/resume.

Transcription uses short chunks, not guaranteed live word-by-word partial text.
Drafts remain private to the wearer until sent. AI suggestions never auto-send:
the human operator requests, reviews/edits and explicitly sends a reply.

## Configuration

Set these in Umbrel's app environment settings, then apply/recreate the app's
server. Every exposed setting targets the `server` service.

| Setting | Default | Meaning |
| --- | --- | --- |
| `ALLOWED_ORIGINS` | Empty in settings | Compose substitutes `http://${DEVICE_DOMAIN_NAME:-umbrel.local}:28097`; a nonempty value replaces that list. |
| `STT_ENABLED` | `true` | Choose `true` or `false`; false enables text-only operation. |
| `STT_MODEL` | `base.en` | Faster Whisper model name or container-local model directory. |
| `STT_TIMEOUT` | `90` | Transcription request deadline in seconds, including cold model work. |
| `OLLAMA_URL` | Empty | Disables suggestions; otherwise an existing reachable local Ollama base URL, without `/api/chat`. |
| `OLLAMA_MODEL` | `llama3.2:3b` | Must already be installed on that Ollama server; never pulled by this app. Explicitly empty also disables suggestions. |
| `OLLAMA_TIMEOUT` | `30` | Suggestion request deadline in seconds. |
| `MAX_SESSIONS` | `100` | Maximum stored conversations. |
| `MAX_MESSAGES_PER_SESSION` | `1000` | Maximum stored messages per conversation. |

Timeouts must be positive and finite; limits must be positive integers. Limits
are not timed retention policies or measured hardware capacity. Compose fixes
`DATABASE_PATH=/data/evencomms.sqlite3` and `MODEL_CACHE=/data/models`.

An Ollama URL must be reachable **from the container**. For example,
`http://192.168.1.50:11434` can address a trusted LAN server listening on that
interface with appropriate firewall rules. `localhost` points at EVENCOMMS's own
container, not the host or an Umbrel Ollama app. A Docker service name works only
on a shared network. This package does not install Ollama, join its private
network, configure a host gateway or download `llama3.2:3b`. Manual replies work
without Ollama and remain available after suggestion failures.

### Exact Origins And TLS

Origins are comma-separated `http://` or `https://` scheme + host + optional port,
with no paths, query strings, credentials or wildcards. Use HTTPS origins, not
`wss://` URLs, for secure WebSockets. Supply the entire desired list when
overriding the default, including the original domain if still used.

Examples to adapt in Umbrel's `ALLOWED_ORIGINS` setting:

```dotenv
# Default domain plus access by LAN IP:
ALLOWED_ORIGINS=http://umbrel.local:28097,http://192.168.1.50:28097

# Custom DNS over HTTP on the Umbrel proxy port:
ALLOWED_ORIGINS=http://stone.home.arpa:28097

# Trusted TLS proxy, plus an illustrative packaged-client origin:
ALLOWED_ORIGINS=https://comms.example.net,https://actual-client.example.net
```

Replace all example hosts/IPs with actual origins. The packaged client origin
above is illustrative, not a known Even Hub origin. Include it only after
identifying the real client origin. If HTTPS uses a non-default port, include
that port (for example `https://comms.example.net:8443`).

Terminate TLS at a trusted reverse proxy with a certificate trusted by the phone
and browsers. Proxy to the Umbrel host's port `28097`, preserve Host and paths,
forward WebSocket Upgrade, and allow audio bodies of 480000 bytes plus framing.
Set proxy timeouts above `STT_TIMEOUT` and `OLLAMA_TIMEOUT`. Restrict direct HTTP
access with network/firewall controls; do not expose plaintext port `28097` to
the public Internet. HTTP exposes passwords, bearer tokens and conversation text.

**Explicitly allow the public HTTPS origin even for same-origin HTTPS/WSS access.**
The image runs Uvicorn with `--no-proxy-headers`; backend HTTP/WS does not infer
the browser's HTTPS origin from forwarded headers. Do not enable blanket
forwarded-header trust to bypass origin configuration. Origin checks do not
replace authentication; proxy clients can share a source address for throttling.
Avoid proxy logs containing credentials, request bodies, transcripts or replies.
Tor browser access does not establish phone/Even Hub reachability, anonymous
inference, or Tor routing for model downloads or Ollama traffic.

## Models And Resource Use

First transcription downloads the selected speech model and requires Internet
access. Cache it before offline use; `/data/models` persists across restarts.
A cold download/load can exceed the default 90-second deadline and return `504`.
The worker thread continues until completion, keeping the single STT slot busy;
wait, then explicitly retry the failed chunk. Concurrent work can return `429`,
and disabled/unavailable STT can return `503`. Do not assume a timeout sent the
question. Pending audio/retry buffers are memory-only and are lost on reload/exit.

`/health` is liveness only, not proof that models, storage or Ollama are ready.
CPU latency, RAM needs and thermal behavior depend on the target hardware/model;
there is no hard RAM minimum or speed promise based on this package. Long-running
endurance and GPU operation are not validated. Start with short utterances and
measure on your host before relying on real-time communication.

## Persistence And Backups

Both app services mount `${APP_DATA_DIR}/data` at `/data`. Sent conversations and
wearer pairing state persist in `evencomms.sqlite3` and its SQLite sidecars; speech
models and download caches live under `models`. The app does not persist raw
audio. Explicit AI suggestion requests send bounded recent text to the configured
Ollama server. This is not end-to-end encryption from the EVENCOMMS server.

Stop the app before a filesystem backup. Back up the entire `data` directory,
including the database, any `-wal`/`-shm` sidecars and model caches, then restart.
Caches may be omitted only if you accept downloading models again before offline
use. Preserve UID/GID `10001:10001`, permissions and ownership when restoring,
including existing cached files. Restore while the app is stopped.

The one-shot root `data_init` service runs `python -m backend.init_data` without
network access and with a read-only root filesystem. It prepares only fixed
`/data` and `/data/models` roots and known SQLite files; it does **not** run
recursive `chown` or repair ownership of nested cached files. A restore with
wrongly owned caches therefore needs deliberate ownership repair before startup.
The server runs as `10001:10001`, with a read-only root, a size-bounded `/tmp`
tmpfs, all capabilities dropped and no privilege escalation. JSON-file logs are
bounded to three 10 MB files per service. The image's single-worker command and
healthcheck are retained; do not scale replicas or add workers because operator
tokens, pairing codes, sockets and the STT slot are process-local.

Wearer drafts/tokens use browser `localStorage`; operator tokens use
`sessionStorage`. Protect browser profiles and phone access. **Clear device**
removes local wearer state but does not delete the server conversation or revoke
a copied token. Deleting a conversation in the operator console removes its
messages and revokes its wearer token, but cannot reliably clear an offline
client. Deletion is logical, not forensic erasure: SQLite/WAL remnants, snapshots,
backups, browser storage and swap may retain data. Manage encryption and backup
retention separately; keep app data and backups private.

Before operational use, verify real speech, cold/warm model behavior, pairing and
reconnect, gesture ordering, correction pause/resume, deletion, TLS/origins/package
permissions, and an operator-approved AI reply on the intended hardware.
