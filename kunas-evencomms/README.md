# EVENCOMMS 0.4.6 For Umbrel

This release removes the redundant device-code explanation from Research.
Code login and streaming behavior are unchanged.

Research streams replies as Codex generates them and uses code login only.
The operator reply preview matches the companion's green-on-black glasses display.
The unused wearer-client link and redundant Research panels are removed.
Failed streams keep the draft and frames; only complete replies enter chat history.

Update in place and reconnect ChatGPT afterwards. App identity, ports, password,
data, models, stream credentials and the private bridge token are preserved.
The separately installed phone companion does not need reinstallation.
Linux AMD64 only; no new services, permissions or automatic provider fallback.

## Release Status

- Source: [v0.4.6](https://github.com/9vibes/EVENCOMMS/tree/v0.4.6), revision `0da7279d9cc71eead32d4324665ec3037d3ded77`.
- [Release checks](https://github.com/9vibes/EVENCOMMS/actions/runs/36491666993) passed,
  including Linux native-runtime checks and persistent-data upgrades through 0.4.5.
- App/init: `ghcr.io/9vibes/evencomms:0.4.6@sha256:f86ccc038ef657549f7ee2b73d8bcaed1bbad0136fed6cddd726e70365376512`.
- Codex bridge: `ghcr.io/9vibes/evencomms:0.4.6-codex@sha256:9004f2246aacdc547d8d57c94f0bcecb0f6da1832d643def50c3a6f8c157388e`.
- Public registry manifests, image configuration, revision labels and layer access
  verified anonymously. Synthetic tests do not establish live account availability
  or physical glasses acceptance. Existing gallery images show an earlier UI.

## Previous 0.4.2 Verification (Historical)

- Source revision: `13e1b49cce70894dcd574fac953e6501a0934ab1`, published as
  [v0.4.2](https://github.com/9vibes/EVENCOMMS/tree/v0.4.2).
  Store baseline: `master` at `dd948e478998987ae4809818e69c119e7f760fb3` (0.4.1).
- App/init `ghcr.io/9vibes/evencomms:0.4.2` is pinned to
  `sha256:929b7d98c0626325878aee764ebd5767d76b5d3b4656b1e8b475f362cd1e74e2`.
  Bridge `ghcr.io/9vibes/evencomms:0.4.2-codex` is pinned to
  `sha256:c75b14649e967ef83b9b8ca482fa917bac157b91d3b13f2d7ece96372ca5ade0`.
  Complete anonymous manifest, configuration and layer downloads were checksum-
  verified against the release artifacts in the existing public GHCR package.
  nginx and MediaMTX retain their digest pins; all
  other deployment fields, raw interpolations, manifest settings, app identity,
  generated password and ports remain unchanged. No new flags, services,
  directories, networks, resource limits or secret rotation are required.
- All five `v0.4.2` icon/gallery URLs returned HTTP 200 with nonempty content.
  They target the unchanged synthetic 0.3.0 assets, not regenerated Codex frames:
  Research shows disconnected **API** mode with a local draft capture, not Codex
  login, a real account, fabricated AI answers or proof of hardware testing.
- Platform: `linux/amd64` only. Raspberry Pi and other ARM hosts are not
  supported. Speech recognition uses CPU/int8, not GPU; no NVIDIA runtime is needed.
- Passed automated coverage: **1437 unique tests**, comprising **1396 backend**
  (including 16 native cases: one login and 15 full-chat), **27 frontend** and
  **14 browser**. Main CI passed 1380 backend cases with 16 skipped without the
  native executable; its dedicated Codex job passed the login case and all 15
  full-chat cases with the pinned binary, without skips or double-counting.
- Native full-chat coverage traverses backend and bridge APIs, production
  `Session`/`Generation`, the actual pinned binary and real relay with synthetic
  loopback OAuth issuer/SSE fixtures only. It covers both models, JPEG history,
  metadata/deltas, classified failures and native routing discovery, including
  routing changes after refresh. No real account or user's host was tested.
- [Main CI](https://github.com/9vibes/EVENCOMMS/actions/runs/36324848439) and the
  [tagged release workflow](https://github.com/9vibes/EVENCOMMS/actions/runs/36325388237)
  passed. Both final image IDs were verified and published without rebuilding;
  their OCI source/revision/version metadata matches the release artifacts.
  CPU transcription, final-image playback/zoom/capture, isolation and authenticated
  running-service `/ready` passed, including the bridge's no-network synthetic proof.
- Upgrade gates from 0.1.0, 0.2.1, 0.3.0, 0.4.0 and **0.4.1** passed.
  Both 0.4.0/0.4.1 checks ran the old initializer first, then verified that the new
  one preserves private token bytes, ownership and modes. This is not live-account
  migration evidence.
- Real account/device-code login, live text/image inference, model entitlement,
  tenant-specific routing, allowance/billing and provider retention remain
  unverified. Physical G2/phones, native Safari and the actual Umbrel host/TLS path
  also require acceptance testing. Synthetic CI containers do not establish
  target-device performance, end-to-end deployment readiness or an Umbrel installation.
- Managed-config tests enter nginx directly; they do not run Umbrel's supplied
  app proxy. Actual host installation, port availability and physical G2/phone
  acceptance still require deployment checks.
- Adding this package to the store does not automatically install it on a Stone
  or any other Umbrel host. No installation on a Stone is claimed.

## Upgrade From 0.1.0 Through 0.4.2

Keep existing operator settings and deployment
overrides, including explicitly empty values; do not replace a customized
installation with the source staging stack. For forks, test against a stopped-data
copy rather than assuming an untested migration is compatible. Do not rename the
app or uninstall to upgrade.

**This package publishes plaintext RTMP on `0.0.0.0:21936` by default.**
It is new for 0.1.0 installations and remains published for 0.2.1 through 0.4.2.
Use only a trusted LAN or encrypted VPN, preferably binding `RTMP_BIND` to the
host's LAN/VPN IP. Restrict it with Docker-aware firewall rules and **never
router-forward TCP 21936**. HTTPS on the console does not encrypt RTMP keys/media.

1. Stop encoders and the app. Back up all of `${APP_DATA_DIR}/data`, including
   `evencomms.sqlite3`, any `-wal`/`-shm` sidecars and `models`, preserving ownership
   and permissions. This includes conversations, pairings, existing stream keys
   and model cache. Also back up `${APP_DATA_DIR}/codex-auth` privately if already
   present, preserving `10001:10002` ownership, directory mode `0750` and token
   mode `0440`; include it in every subsequent backup after 0.4.0 initializes it.
   Preserve the Umbrel app/password seed and existing settings in your deployment
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
   Umbrel and recreate the full stack, including `data_init`, `server`, `web`,
   `mediamtx` and `codex-bridge`, using both release images, not only the
   backend. The initializer automatically installs the image's configs,
   overwriting its managed nginx/MediaMTX files; no manual
   template copying is needed. The 0.3.0 `hlsVariant: lowLatency`,
   `hlsPartDuration: 200ms` and nginx `9m` Research ceiling are retained.
   Ordinary JSON/audio backend bounds remain unchanged. Init also provisions the
   private service token once. A 0.4.0/0.4.1 upgrade retains its existing token bytes,
   ownership and modes without rotation; no new directory or secret setup is needed.
   Older installs provision it automatically. No account credential is required.
4. The SQLite migration preserves conversations, wearer pairings and existing
   stream keys; upgrading from 0.1.0 generates missing distinct persistent
   publisher and server-only reader secrets. The existing
   `/data` mapping, model cache, generated admin password, app ID and web port
   `28097` stay unchanged. Operator tokens are process-local: sign in again after
   restart. Paired wearers can reconnect without pairing again if their local
   token and server conversation are retained. New Research sign-in keys and
   history are ephemeral, not database state, and are not migrated or restored
   from persistent-data backups. Codex OAuth logins are also RAM-only and lost on
   restart; the persistent local bridge token is not an OpenAI account credential.
5. Check login, wearer reconnect, conversation history, a cached-model transcription
   and STREAM playback through the real Umbrel URL. Apply the deployment checks
   below before operational use. Check zoom/pan, capture draft review and Research
   separately. The idle bridge must pass its private readiness gate without a real
   account, but its health never gates ordinary app startup. API keys and Codex
   device login are optional; inference requests always require explicit Send.

## Installation And First Pairing

1. Add `https://github.com/9vibes/KNS-Umbrel` in Umbrel's community app store
   settings, or refresh the store if it is already installed.
2. Install **EVENCOMMS** (`kunas-evencomms`) on a compatible x86-64 Umbrel host.
   Open it from Umbrel, normally at `http://umbrel.local:28097` (use your actual
   device domain). Port `28097` belongs to the Umbrel app proxy, targeting
   `kunas-evencomms_web_1:8080`, never the raw backend at `8000`. Review the RTMP
   warning and check port availability above before installing.
   Since 0.4.1, **Get Codex login code** works here after confirmation before each
   login request, only on a trusted LAN/VPN. HTTPS is strongly recommended: HTTP
   exposes operator sessions, codes and chat. Keep `COOKIE_SECURE=false` while
   using HTTP or STREAM playback breaks. Installing the bridge does not provision TLS.
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
requires it. Rebuild/repack when the backend origin changes. Installed clients at
`http://127.0.0.1:<port>` are covered by `ALLOW_EVEN_LOCALHOST=true`. For other
origins, add the **actual packaged client origin** to `ALLOWED_ORIGINS`; inspect
the client diagnostics rather than assuming it equals the backend URL. Do not ship
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
| `ALLOW_EVEN_LOCALHOST` | `true` | Permit the installed Even HTTP origin at `127.0.0.1` with a valid explicit port for CORS and wearer WebSockets. Set false to require exact origins. |
| `STT_ENABLED` | `true` | Choose `true` or `false`; false enables text-only operation. |
| `STT_MODEL` | `base.en` | Faster Whisper model name or container-local model directory. |
| `STT_TIMEOUT` | `90` | Transcription request deadline in seconds, including cold model work. |
| `OLLAMA_URL` | Empty | Disables suggestions; otherwise an existing reachable local Ollama base URL, without `/api/chat`. |
| `OLLAMA_MODEL` | `llama3.2:3b` | Must already be installed on that Ollama server; never pulled by this app. Explicitly empty also disables suggestions. |
| `OLLAMA_TIMEOUT` | `30` | Suggestion request deadline in seconds. |
| `OPENAI_API_KEY` | Empty | Advanced optional server environment secret shared across operators. Retained for legacy API endpoints; not used by the code-login Research UI. |
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

### Research Code Login And Streaming

Open Research and choose **Get Codex login code**. On the normal HTTP Umbrel
console, confirm that you trust the network. Complete sign-in on OpenAI's HTTPS
device page, then select a model and choose **Send via Codex**. The reply appears
progressively. Account connection and model selection do not submit your draft.

Capture adds a reviewed video still to your local draft. Only Send submits the
conversation and selected stills. Limits are 3 images per turn, 6 per chat and
20 messages. No continuous video/audio, stream credentials or automatic wearer
replies. Interrupted replies preserve the question and frames for manual retry.
New chat ignores late streaming updates and clears local history.

An eligible ChatGPT account is required; plan allowance and account data controls
apply. There is no paid API or model fallback. Two signed-in operators and eight
fresh requests per login bound bridge memory. OAuth credentials stay in isolated
RAM; disconnect, logout, expiry or restart clears the runtime. Local browser
history clears on reload or New chat, while submitted temporary threads remain
until runtime cleanup. The response budget is bounded by OPENAI_TIMEOUT and the
bridge's 85-second deadline. OPENAI_MAX_OUTPUT_TOKENS is a legacy API-only setting.

The legacy API endpoints remain for compatibility, but the Research UI has no
API-key login or provider selector. See the [current guide](https://github.com/9vibes/EVENCOMMS/blob/v0.4.5/docs/codex.md).

### Exact Origins And TLS

The store enables `ALLOW_EVEN_LOCALHOST=true` for the observed installed Even
origin `http://127.0.0.1:<port>`. This covers valid explicit ports without a
wildcard and applies to both pairing requests and wearer WebSockets. It does
not prove that an origin belongs to Even; any app served at that address is
trusted by this policy. Authentication is still required. Set false to retain
only exact origin matching, then include the observed origin in the list below.


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
and `OPENAI_TIMEOUT`, allowing device-login polling and Codex response waiting.
TLS is strongly recommended for privacy, not a Codex login prerequisite since 0.4.1;
the bridge installs no certificates or automatic TLS proxy. Restrict direct HTTP
access with network/firewall controls; do not expose plaintext port `28097` to
the public Internet. HTTP exposes passwords, bearer tokens, device codes and chat.
Set `COOKIE_SECURE=true` only for HTTPS playback cookies; leave it false on HTTP
so playback cookies can be sent. This does not encrypt RTMP.

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
application bridge. `mediamtx` joins only `private`; `server` joins `private` plus
the existing **internal** `codex_link` network. Only backend and bridge join
`codex_link`; only the bridge joins the separate non-internal `codex_egress` for
outgoing authentication/inference. This is not an OpenAI-only egress firewall.
`data_init` has no network. The private bridge is not `internal: true`, allowing
LAN/VPN RTMP and backend model downloads/Ollama/OpenAI access. Do not attach untrusted
containers: MediaMTX's control API relies on network isolation.

Backend `8000`, Codex `8001`, HLS `8888` and media API `9997` have no host publication. Nginx
blocks exact `/internal` and all `/internal/` paths for every method, including
MediaMTX's private authentication callback. Never bypass it by pointing a public
proxy at the backend. The official nginx and MediaMTX image digests match the
source staging package. Both wait for backend health after initialization; there
is no dependency cycle or invented shell healthcheck for the minimal media image.

Both `server` and `codex-bridge` depend only on successful initialization, never on
each other's health. The bridge runs as `10002:10002` with init/reaping, read-only
root, 256 MiB `/tmp` tmpfs (`noexec,nosuid,nodev`), all capabilities dropped,
`no-new-privileges`, a 1 GiB memory and total memory-plus-swap limit, one CPU,
128 PIDs and disabled core dumps. Logs retain the existing three-file/10 MB
rotation. It mounts only the private service credential read-only, never `/data`,
shared `/config`, host homes, personal Codex caches or the Docker socket.

Bridge `/health` is liveness, not proof of safe generation. The private,
service-token-authenticated `GET /ready` must report `binary_verified: true`,
`generation_enabled: true` and `active_sessions: 0` after the synthetic startup
proof. It returns no credentials/prompts and does not initiate real login or
inference. Independent pinned-binary verification runs off the event loop with a
10-second deadline, followed by a 75-second generation proof; the Compose health
start period stays 90 seconds. If generation proof fails or times out, a verified
binary can still issue login codes, but Send remains blocked until the full proof
passes. Check privately without publishing `8001`, exposing the token or treating
readiness as live account entitlement. Failure does not disable the ordinary app;
never bypass the probe to obtain a green status.

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
images and displayed Research history to the explicitly chosen API/Codex provider.
Its sign-in keys, OAuth credentials and history are ephemeral, not SQLite data.
An advanced shared environment key belongs to deployment secret
configuration, not the app's database backup.

Stop the app before a filesystem backup. Back up the entire `data` directory,
including the database, any `-wal`/`-shm` sidecars and model caches, plus the separate
private `codex-auth` directory, existing settings and Umbrel password seed, then restart.
Caches may be omitted only if you accept downloading models again before offline
use. For `data` and models, preserve UID/GID `10001:10001`, permissions and
ownership, including existing cached files. The private token uses the distinct
ownership/modes below. Restore while the app is stopped.

The one-shot root `data_init` service runs
`python -m backend.init_data --config-dir /config --codex-auth-dir /codex-auth`
without network access and with a read-only root filesystem. Its data, config and
private codex-auth bind mounts are read-write.
It prepares fixed `/data` and `/data/models` roots and known SQLite files, and
installs the bundled `/app/infra/nginx.conf` and `/app/infra/mediamtx.yml` into
`${APP_DATA_DIR}/config`. It does **not** run
recursive `chown` or repair ownership of nested cached files. A restore with
wrongly owned caches therefore needs deliberate ownership repair before startup.

Init creates a random **64-character hexadecimal** service token once at
`${APP_DATA_DIR}/codex-auth/token`, outside both `/data` and shared `/config`.
The private directory is owned by `10001:10002` with mode `0750`; the token has
the same ownership and mode `0440`. A valid existing 0.4.0/0.4.1 token keeps its bytes,
ownership and permissions in 0.4.2; do not regenerate or rotate it for this update.
Restore this private folder with those ownership/modes; never include real account
credentials in it or a backup. It is a local service secret, **not an OpenAI account
credential**, and is independent of `APP_PASSWORD`.

Only init mounts that folder writable at `/codex-auth`; backend and bridge mount
it read-only at `/run/codex-auth`, each with
`CODEX_BRIDGE_TOKEN_FILE=/run/codex-auth/token`. Only the backend receives
`CODEX_BRIDGE_URL=http://codex-bridge:8001`. Nobody else mounts the folder: nginx,
MediaMTX and app_proxy cannot read it. Neither init nor bridge receives
`APP_PASSWORD`/`ADMIN_PASSWORD`. Do not add `CODEX_BRIDGE_TOKEN` alongside the file
setting, put secrets into manifest form fields or copy the token into shared config.

The generated config directory contains no secrets and is **image-managed**:
do not hand-edit its two managed files, because the next initialization overwrites
them. They are copied literally, preserving nginx `$` variables, with no platform
template expansion, `envsubst`, manual copying or extra store template files.
Directory mode `0755` and file mode `0644` allow nginx UID 101 to read them.
Nginx and MediaMTX each mount the entire config directory read-only, not individual
files, avoiding missing-file bind-mount races. Unrelated config files are untouched;
the directory can be regenerated from the release image and is not a substitute
for backing up persistent `data` and the separate private `codex-auth` folder.

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

- Confirm installed images match the exact tested AMD64 app/init and bridge
  digests recorded in Release Status. Check the linked release workflow and public
  registry provenance before promotion. Do not
  substitute moving tags or source staging images.
- Test a clean install and stopped-data upgrades from 0.1.0/0.2.1/0.3.0/0.4.0/0.4.1/**0.4.2** on the
  intended Umbrel host/version, including existing environment overrides and
  explicitly empty `OLLAMA_MODEL`. Forks/custom installations need their own checks.
- Confirm healthy server/web and running MediaMTX, generated config permissions,
  the actual RTMP host bind/port and no publication of `8000`, `8001`, `8888` or `9997`.
  Through the browser-facing URL, verify `/internal`, `/internal/` and
  `/internal/media/auth` return 404 for GET, POST, PUT, DELETE and OPTIONS.
- Verify valid encoder credentials publish, a wrong key fails, a second publisher
  cannot replace the first, and unauthenticated clients cannot access settings,
  status or HLS. Verify playback, cookie renewal, logout, re-entering STREAM,
  encoder reconnect and media restart recovery, including Secure cookies on TLS.
- Verify existing conversations/pairings/stream keys/models and the generated password survive
  upgrade; operators log in again and paired wearers reconnect. Check WebSockets
  and explicit origins through nginx and the actual Umbrel/TLS proxies.
- Check the private token's ownership/modes and unchanged bytes across restart and
  upgrade, without logging it. Verify init is its only writable consumer and only
  backend/bridge can read it. Test the bridge's private `/ready` proof fields and
  zero idle account sessions under its actual container controls; stop/fail the
  bridge and confirm the ordinary app still starts and functions independently.
- Check digital zoom/pan/reset, real video-only cropped captures and removable
  draft thumbnails through the deployed URL. Validate Safari HTTPS and jitter
  behavior. Mocked provider tests are not live OpenAI acceptance: any optional
  live check needs an authorized API key, compatible selected model and explicit
  billable Send. Verify logout/disconnect and history-clearing behavior without
  exposing secrets or treating an environment-key fallback as disconnected.
- Codex real-account/device login, text/image inference, entitlement, tenant routing,
  allowance/billing and retention are separate, still-unverified acceptance checks.
  Any live check needs an authorized eligible account, preferably trusted HTTPS
  (HTTP only on a trusted LAN/VPN with per-login confirmation), explicit model choice
  and Send. Verify no API/model/provider fallback, bounded 401 recovery,
  disconnect/expiry cleanup and no hidden agent continuations or automatic frames.
- Before operational use, verify real speech, cold/warm model behavior, gesture
  ordering, correction pause/resume, deletion, TLS/origins/package permissions
  and an operator-approved AI reply on the intended hardware. `/health` and static
  YAML checks are not evidence of end-to-end media or hardware acceptance.
