# EVENCOMMS 0.3.0 For Umbrel

Local communication between an Even glasses wearer and a browser operator, with
short-chunk English CPU transcription and optional human-approved Ollama replies.
The full-width **STREAM** tab provides authenticated low-latency HLS preview of
one RTMP feed with 1x-4x digital zoom/pan. **RESEARCH** adds opt-in OpenAI chat with
reviewed still-frame attachments, separate from local Ollama. There is no recording,
transcoding or continuous stream analysis. CPU speech recognition and existing
wearer/operator controls are unchanged; STREAM does not require a GPU.
This is an **early release**: physical G2/phone behavior, hardware installation,
performance and endurance have not been verified. The screenshots contain
synthetic conversations, not evidence of hardware testing.

## Release Status

- Source: [EVENCOMMS v0.3.0](https://github.com/9vibes/EVENCOMMS/tree/v0.3.0),
  commit `a4d1b9c2ecc9265e3d52ed22e8b38fcdf09a2b7a`. This updates the 0.2.1 store
  baseline `e476902`; the failed 0.2.0 candidate was never an image/store release.
- Both app services pin `ghcr.io/9vibes/evencomms:0.3.0` to
  `sha256:2e81e2c04292e4d48f38fa3c568eb2742d0afbe8a0e468db6c4c62e1d5f3e6c3`.
  Anonymous manifest/configuration/layer downloads and SHA256 verification passed.
  nginx and MediaMTX retain their existing digest pins.
- All five versioned icon/gallery URLs were verified. Gallery images use synthetic
  content only. Research is shown disconnected with a local draft capture, without
  keys, fabricated successful provider connections or implied billing.
- Platform: `linux/amd64` only. Raspberry Pi and other ARM hosts are not
  supported. Speech recognition uses CPU/int8, not GPU; no NVIDIA runtime is needed.
- [The 0.3.0 release pipeline passed](https://github.com/9vibes/EVENCOMMS/actions/runs/36263065746):
  410 unit/browser tests, real LL-HLS streaming/zoom/frame capture in both stacks,
  fresh CPU speech recognition, managed configuration, and upgrades from 0.1.0 and
  0.2.1 retaining messages, wearer credentials, model cache and existing stream keys.
  Research provider tests use HTTPX mocks/browser stubs, not a live OpenAI account;
  they do not establish real model compatibility, API billing or provider retention.
- Managed-config tests enter nginx directly; they do not run Umbrel's supplied
  app proxy. Actual host installation, port availability and physical G2/phone
  acceptance still require deployment checks.
- Adding this package to the store does not automatically install it on a Stone
  or any other Umbrel host. No installation on a Stone is claimed.

## Upgrade From 0.1.0 Or 0.2.1

**This upgrade opens a new plaintext RTMP listener on `0.0.0.0:21936` by default.**
It is new for 0.1.0 installations and remains published for 0.2.1 installations.
Use only a trusted LAN or encrypted VPN, preferably binding `RTMP_BIND` to the
host's LAN/VPN IP. Restrict it with Docker-aware firewall rules and **never
router-forward TCP 21936**. HTTPS on the console does not encrypt RTMP keys/media.

1. Stop encoders and the app. Back up all of `${APP_DATA_DIR}/data`, including
   `evencomms.sqlite3`, any `-wal`/`-shm` sidecars and `models`, preserving ownership
   and permissions. This includes conversations, pairings, existing stream keys
   and model cache. Preserve the Umbrel app/password seed in your deployment
   backup, the existing app ID and data directory. Do not uninstall or
   delete/reinitialize the database.
2. Check TCP `21936` on the actual host with `ss -ltn` and
   `docker ps --format '{{.Names}} {{.Ports}}'`. It differs from SteamLab's `21935`
   but is not guaranteed free. If needed, change `RTMP_PORT` for both the server's
   advertised URL and MediaMTX's host mapping before recreating the app.
   `STREAM_ENABLED=false` still publishes the port; the media authentication
   callback denies access. It is not a substitute for firewalling or stopping
   MediaMTX, nor a way to disconnect an already accepted publisher.
3. Refresh the KUNAS store and update **in place** through
   Umbrel and recreate the full stack, including `data_init`, `server`, `web` and
   `mediamtx`, not only the backend. The initializer automatically installs the
   image's configs, overwriting its managed nginx/MediaMTX files; no manual
   template copying is needed. Version 0.3.0 sets `hlsVariant: lowLatency` and
   `hlsPartDuration: 200ms`, and raises nginx's body ceiling to `9m` for Research.
   Ordinary JSON/audio backend bounds remain unchanged.
4. The SQLite migration preserves conversations, wearer pairings and existing
   stream keys; upgrading from 0.1.0 generates missing distinct persistent
   publisher and server-only reader secrets. The existing
   `/data` mapping, model cache, generated admin password, app ID and web port
   `28097` stay unchanged. Operator tokens are process-local: sign in again after
   restart. Paired wearers can reconnect without pairing again if their local
   token and server conversation are retained. New Research sign-in keys and
   history are ephemeral, not database state, and are not migrated or restored
   from persistent-data backups.
5. Check login, wearer reconnect, conversation history, a cached-model transcription
   and STREAM playback through the real Umbrel URL. Apply the deployment checks
   below before operational use. Check zoom/pan, capture draft review and Research
   separately; connecting a real key or sending to OpenAI is optional and billable
   requests require explicit Send.

## Installation And First Pairing

1. Add `https://github.com/9vibes/KNS-Umbrel` in Umbrel's community app store
   settings, or refresh the store if it is already installed.
2. Install **EVENCOMMS** (`kunas-evencomms`) on a compatible x86-64 Umbrel host.
   Open it from Umbrel, normally at `http://umbrel.local:28097` (use your actual
   device domain). Port `28097` belongs to the Umbrel app proxy, targeting
   `kunas-evencomms_web_1:8080`, never the raw backend at `8000`. Review the RTMP
   warning and check port availability above before installing.
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

Behind nginx, clients share the backend's default **five attempts per minute for
each of login and pairing**, including successful attempts. Wait a minute after
a burst; this is not a separate allowance per browser/IP. Status polling and
playback do not consume that budget. Do not enable blanket forwarded-IP trust.

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

Set these in Umbrel's app environment settings where supported, then apply and
recreate the affected services. Settings target `server` except `RTMP_BIND`
(`mediamtx`) and `RTMP_PORT` (both `server` and `mediamtx`).

`RTMP_BIND` and `RTMP_PORT` must reach the **Compose interpolation environment**;
adding variables only inside a running container cannot change published ports.
Umbrel versions differ in how manifest environment fields are applied. If your
UI only injects container variables, use that version's supported deployment
environment mechanism. Recreate the affected services and inspect the resolved
Compose config and actual host port publication; do not assume a UI value changed
the binding. Keep the server's `RTMP_PORT` and published host port identical.

| Setting | Default | Meaning |
| --- | --- | --- |
| `STREAM_ENABLED` | `true` | Enable authenticated STREAM; false denies media authentication/playback, but leaves RTMP published. |
| `PUBLIC_HOST` | `umbrel.local` in settings | Encoder-reachable hostname/IP without scheme, port or path. If unset/empty, Compose uses `DEVICE_DOMAIN_NAME`, then `umbrel.local`; the nonempty UI default overrides that fallback. Set your actual reachable host. |
| `RTMP_BIND` | `0.0.0.0` | MediaMTX host bind; prefer an explicit LAN/VPN IP. Requires Compose interpolation and recreation. |
| `RTMP_PORT` | `21936` | Available host TCP ingest port, also advertised by the server. Requires Compose interpolation and recreation. |
| `COOKIE_SECURE` | `false` | Set `true` for Secure playback cookies behind trusted HTTPS; false is only for isolated HTTP use. |
| `ALLOWED_ORIGINS` | Empty in settings | Compose substitutes `http://${DEVICE_DOMAIN_NAME:-umbrel.local}:28097`; a nonempty value replaces that list. |
| `STT_ENABLED` | `true` | Choose `true` or `false`; false enables text-only operation. |
| `STT_MODEL` | `base.en` | Faster Whisper model name or container-local model directory. |
| `STT_TIMEOUT` | `90` | Transcription request deadline in seconds, including cold model work. |
| `OLLAMA_URL` | Empty | Disables suggestions; otherwise an existing reachable local Ollama base URL, without `/api/chat`. |
| `OLLAMA_MODEL` | `llama3.2:3b` | Must already be installed on that Ollama server; never pulled by this app. Explicitly empty also disables suggestions. |
| `OLLAMA_TIMEOUT` | `30` | Suggestion request deadline in seconds. |
| `OPENAI_API_KEY` | Empty | Advanced optional server environment secret shared across operators. Prefer current-sign-in Key Connect over HTTPS; deliberately not a plain manifest form field. |
| `OPENAI_TIMEOUT` | `90` | Optional nonsecret Research provider timeout in seconds; use 1..110. |
| `OPENAI_MAX_OUTPUT_TOKENS` | `2048` | Optional nonsecret Research output cap, integer 256..8192; API usage is billable. |
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

### Research And Privacy

RESEARCH is an opt-in cloud workflow, **not an Ollama replacement**. Open the
Research tab and use **Key Connect** for the current operator sign-in over trusted
HTTPS. An OpenAI API key is required; a ChatGPT subscription is not API credit.
The key is scoped to that operator token and kept only in server RAM, never
browser `localStorage` or `sessionStorage`. Logout, token expiry, disconnect or a
server restart clears it; the API does not return it.

For advanced deployments, inject `OPENAI_API_KEY` using the deployment's protected
server environment mechanism, then recreate `server`. It is empty by default and
is deliberately absent from the plain manifest form. This key is **shared across
operators**, including its API budget; environment/deployment administrators can
access it. A disconnected sign-in key falls back to the server key if configured.
Remove the environment key and recreate the server to disable that shared access.
Never put keys in frontend variables, committed files, screenshots or logs, and
do not share resolved Compose output containing secrets.

The model dropdown fetches the actual account's OpenAI `/models` list. Listed
availability is not proof of Responses API or image capability. Explicitly select
a compatible vision/image model when attaching captures; the app does not silently
substitute another model. Connecting/listing models contacts OpenAI to check
availability but does not submit chat content.

1. In the Research preview, zoom/pan to the area of interest and capture a decoded
   frame. The JPEG contains only the currently visible video crop, not page UI or
   playback controls. Capture is local: it only adds a draft attachment.
2. Review removable thumbnails and timestamps, then write the prompt. Limits are
   **3 images per turn, 6 images per chat and 20 messages**. Each JPEG is at most
   1 MiB decoded and 1280 pixels per side. Use **New chat** when the chat is full;
   history is not silently dropped to fit a request.
3. Only explicit **Send to OpenAI** submits the prompt, selected stills and displayed
   Research history, including prior attached images. No continuous video/audio,
   stream credentials or unsent wearer drafts are automatically sent. No web-search
   or other external tools are enabled, and replies never automatically go to glasses.

OpenAI API usage is billable and provider data-retention rules apply. Requests set
`store: false`; this is **not a zero-retention guarantee**. Cancelling browser
waiting does not guarantee the provider stops processing or billing. There is no
automatic billable retry. Consider consent and footage sensitivity before Send.

Research history and captures remain in browser RAM across app-tab changes, not
in the app database or browser storage. Reload, **New chat** and sign-out clear
them. A bounded server retry cache can briefly hold results. These ephemeral keys,
images and history are not part of persistent-data backup or migration.

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
forward WebSocket Upgrade, and allow Research bodies up to the `9m` nginx ceiling.
Ordinary JSON/audio backend limits remain unchanged, including audio bodies of
480000 bytes plus framing. Set proxy timeouts above `STT_TIMEOUT`, `OLLAMA_TIMEOUT`
and `OPENAI_TIMEOUT`. Restrict direct HTTP
access with network/firewall controls; do not expose plaintext port `28097` to
the public Internet. HTTP exposes passwords, bearer tokens and conversation text.
Set `COOKIE_SECURE=true` for HTTPS playback cookies; this does not encrypt RTMP.

**Explicitly allow the public HTTPS origin even for same-origin HTTPS/WSS access.**
The image runs Uvicorn with `--no-proxy-headers`; backend HTTP/WS does not infer
the browser's HTTPS origin from forwarded headers. Do not enable blanket
forwarded-header trust to bypass origin configuration. Origin checks do not
replace authentication; proxy clients can share a source address for throttling.
Avoid proxy logs containing credentials, request bodies, transcripts or replies.
Tor browser access does not establish phone/Even Hub reachability, anonymous
inference, or Tor routing for model downloads, Ollama or OpenAI traffic.

## STREAM And Network Isolation

Only nginx `web` joins both the default Umbrel app-proxy network and the private
application bridge. `server` and `mediamtx` join only the private bridge;
`data_init` has no network. The private bridge is not `internal: true`, allowing
LAN/VPN RTMP and backend model downloads/Ollama/OpenAI access. Do not attach untrusted
containers: MediaMTX's control API relies on network isolation.

Backend `8000`, HLS `8888` and media API `9997` have no host publication. Nginx
blocks exact `/internal` and all `/internal/` paths for every method, including
MediaMTX's private authentication callback. Never bypass it by pointing a public
proxy at the backend. The official nginx and MediaMTX image digests match the
source staging package. Both wait for backend health after initialization; there
is no dependency cycle or invented shell healthcheck for the minimal media image.

1. Sign in and open **STREAM**, then explicitly **Reveal credentials** under
   Encoder configuration. In OBS choose Service: Custom, copy the displayed
   RTMP server (`rtmp://<PUBLIC_HOST>:<RTMP_PORT>/live`) and the entire stream key
   (`stream?user=publisher&pass=<secret>`). Keep the query string and leave OBS's
   separate authentication off. Do not use the console's web port.
2. Use H.264 video, AAC audio and a one-second keyframe interval. There is no
   transcoding to repair unsupported codecs. Only one publisher is accepted;
   stop the old encoder before switching sources.
3. Confirm actual video/audio playback, not just online status. Authenticated
   same-origin HLS uses a short-lived HttpOnly, SameSite=Strict playback cookie
   and server-only reader credentials, not URL tokens. Expect seconds of latency;
   playback starts muted and may require manual Play.
4. Leaving STREAM stops browser playback/polling, not the encoder. Logout revokes
   linked playback sessions. The short HLS window stays in memory; no recording
   or stored video is provided.

The player offers **1x-4x digital zoom**, pan and reset, not optical zoom or extra
camera detail. Zoom does not change the source feed. Research capture uses that
current video viewport; it does not send the stream continuously.

MediaMTX now serves LL-HLS (`lowLatency`, `200ms` parts). The HLS.js player uses a
1-second live target, 3-second maximum-latency setting and up to 1.05x catch-up.
A local synthetic server-timestamp measurement improved from **2.05s to 1.23s**.
This is not camera-to-screen latency and is not a target-device performance
guarantee. Less buffering can mean more stalls on jittery networks. Native Safari
HLS uses its own playback behavior; validate LL-HLS over HTTPS on the actual
Safari/phone and network rather than assuming the HLS.js settings apply there.

Publishing and reader secrets are distinct from each other and from the admin
password. They persist in SQLite and backups. Restarting, hiding credentials,
logging out, deleting a conversation or changing the admin password does not
rotate them. There is no implemented key-rotation control. If compromised, stop
MediaMTX and block ingest pending a reviewed recovery procedure; do not delete
the database as a shortcut. Protect OBS profiles, clipboards and backups; never
share real keys in logs, screenshots or issue reports.

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

The init and server services retain `${APP_DATA_DIR}/data` at `/data`. Sent
conversations, wearer pairing state and stream secrets persist in
`evencomms.sqlite3` and its SQLite sidecars; speech
models and download caches live under `models`. The app does not persist raw
audio. Explicit AI suggestion requests send bounded recent text to the configured
Ollama server. This is not end-to-end encryption from the EVENCOMMS server.
Research is separate: only explicit Send submits reviewed prompts, selected
images and Research history to OpenAI. Its sign-in keys and history are ephemeral,
not SQLite data. An advanced shared environment key belongs to deployment secret
configuration, not the app's database backup.

Stop the app before a filesystem backup. Back up the entire `data` directory,
including the database, any `-wal`/`-shm` sidecars and model caches, then restart.
Caches may be omitted only if you accept downloading models again before offline
use. Preserve UID/GID `10001:10001`, permissions and ownership when restoring,
including existing cached files. Restore while the app is stopped.

The one-shot root `data_init` service runs
`python -m backend.init_data --config-dir /config` without network access and with
a read-only root filesystem. Its data and config bind mounts are read-write.
It prepares fixed `/data` and `/data/models` roots and known SQLite files, and
installs the bundled `/app/infra/nginx.conf` and `/app/infra/mediamtx.yml` into
`${APP_DATA_DIR}/config`. It does **not** run
recursive `chown` or repair ownership of nested cached files. A restore with
wrongly owned caches therefore needs deliberate ownership repair before startup.

The generated config directory contains no secrets and is **image-managed**:
do not hand-edit its two managed files, because the next initialization overwrites
them. They are copied literally, preserving nginx `$` variables, with no platform
template expansion, `envsubst`, manual copying or extra store template files.
Directory mode `0755` and file mode `0644` allow nginx UID 101 to read them.
Nginx and MediaMTX each mount the entire config directory read-only, not individual
files, avoiding missing-file bind-mount races. Unrelated config files are untouched;
the directory can be regenerated from the release image and is not a substitute
for backing up persistent `data`.

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

## Required Deployment Checks

- Release verification status is recorded above. Before operational use, test a clean
  install and stopped-data upgrades from 0.1.0/0.2.1 on the intended Umbrel
  host/version. Release publication checks are recorded above.
- Confirm healthy server/web and running MediaMTX, generated config permissions,
  the actual RTMP host bind/port and no publication of `8000`, `8888` or `9997`.
  Through the browser-facing URL, verify `/internal`, `/internal/` and
  `/internal/media/auth` return 404 for GET, POST, PUT, DELETE and OPTIONS.
- Verify valid encoder credentials publish, a wrong key fails, a second publisher
  cannot replace the first, and unauthenticated clients cannot access settings,
  status or HLS. Verify playback, cookie renewal, logout, re-entering STREAM,
  encoder reconnect and media restart recovery, including Secure cookies on TLS.
- Verify existing conversations/pairings/stream keys/models and the generated password survive
  upgrade; operators log in again and paired wearers reconnect. Check WebSockets
  and explicit origins through nginx and the actual Umbrel/TLS proxies.
- Check digital zoom/pan/reset, real video-only cropped captures and removable
  draft thumbnails through the deployed URL. Validate Safari HTTPS and jitter
  behavior. Mocked provider tests are not live OpenAI acceptance: any optional
  live check needs an authorized API key, compatible selected model and explicit
  billable Send. Verify logout/disconnect and history-clearing behavior without
  exposing secrets or treating an environment-key fallback as disconnected.
- Before operational use, verify real speech, cold/warm model behavior, gesture
  ordering, correction pause/resume, deletion, TLS/origins/package permissions
  and an operator-approved AI reply on the intended hardware. `/health` and static
  YAML checks are not evidence of end-to-end media or hardware acceptance.
