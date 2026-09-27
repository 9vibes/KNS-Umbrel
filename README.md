# KUNAS Umbrel Store

Community Umbrel app store for KUNAS apps.

## Add this store to Umbrel

Use this URL in umbrelOS:

```text
https://github.com/9vibes/KNS-Umbrel
```

## Apps

- **Qobuz Sync** (`kunas-qobuz-sync`)  
  Sync purchased Qobuz music to `Downloads/QobuzSync`.  
  App source: [`9vibes/QobuzSync`](https://github.com/9vibes/QobuzSync)

- **Kokoro GPU** (`kunas-kokoro-fastapi`)  
  GPU-enabled Kokoro FastAPI text-to-speech server for Umbrel/Open WebUI.

- **ComfyUI GPU** (`kunas-comfyui`)
  Node-based AI image, video, and audio workflows with NVIDIA GPU acceleration.

- **InvokeAI GPU** (`kunas-invokeai`)
  Professional creative AI image generation with NVIDIA GPU acceleration and persistent models/outputs.

- **OpenCode Git** (`kunas-opencode-git`)
  OpenCode AI coding agent with Git and GitHub CLI installed inside the container, plus first-run local Ollama config for `qwen3.6:35b`.

- **KUNAS/Labs 1.2.2** (`kunas-steamlab`)
  Monitor up to four concurrent OBS feeds with independent keys, recording, bitrate,
  and face catalogs. Requires an x86-64 NVIDIA host with CUDA 12.4 support; no CPU fallback.
  Signal Directory is an inline tab beside Faces in each stream's tool panel; the sidebar is removed.
  Version 1.2.0 adds Multi-view and default-on automatic video recording, preserving
  the 1.1.0 four-stream schema, credentials, history, storage, proxy, ports, and app ID.
  Multi-view shows only connected, non-archived feeds in two desktop columns
  (2x2 with four feeds) or one mobile column, with independent tabs
  below each video; offline/history access stays in Single view. View changes do
  not affect server feeds. **Upgrade warning: `AUTO_RECORD` defaults to `true`,
  including already-live feeds after an update/restart, even if previously stopped
  manually.** For manual-only operation, stop encoders before updating, configure
  and apply the operator setting `AUTO_RECORD=false`, then reconnect encoders.
  Stop survives a temporary media API outage, not a backend process restart. A
  genuine publisher reconnect starts a new file unless `AUTO_RECORD=false`.
  Low-disk recovery requires reserve plus headroom for five continuous seconds,
  even across reconnects; recorder errors latch until manual Start or a genuine reconnect.
  Face analysis remains opt-in. Four recordings share storage and the low-disk
  reserve, not separate quotas; monitor capacity and manage storage deliberately.
  Recordings are never automatically deleted.
  App source: [`9vibes/SteamLab`](https://github.com/9vibes/SteamLab). [Setup and safety notes](kunas-steamlab/README.md).

- **EVENCOMMS 0.4.0** (`kunas-evencomms`)
  Early-release Even glasses/operator conversations with local English CPU transcription
  and optional human-approved Ollama replies. Retains OpenAI API Research,
  1x-4x digital zoom/pan and low-latency HLS monitoring; adds experimental ChatGPT
  account Research through official Codex 0.157.1. Its isolated bridge starts idle
  with synthetic local probes, not real account login/inference. Account use requires
  explicit provider choice, device login, model selection and Send over configured
  HTTPS; eligible ChatGPT plan allowance and privacy controls apply, not API
  `store: false`. API mode stays the default, with no automatic provider/model/API
  fallback. Limits are two signed-in operators and eight requests per login.
  OAuth tokens stay in RAM; only explicit Send submits reviewed text/history/stills.
  Bounded OAuth 401 recovery is allowed; the relay prevents extra agent turns.
  No recording, transcoding or automatic replies to glasses. x86-64 only.
  **Plaintext RTMP remains on TCP 21936: trusted LAN/VPN only, never
  router-forward.** Update in place, never uninstall; back up data/models, password
  seed and the new private `codex-auth` service-token directory.
  Both release images are digest-pinned and their complete anonymous downloads
  were checksum-verified. CI, isolated-container checks, CPU transcription and
  upgrades from 0.1.0/0.2.1/0.3.0 passed. Real-account, physical G2/phone, Safari
  and actual Umbrel-host acceptance remain unverified.
  App source: [`9vibes/EVENCOMMS`](https://github.com/9vibes/EVENCOMMS).
  [Setup, configuration and release caveats](kunas-evencomms/README.md).

## Repository purpose

This repo contains only Umbrel app-store metadata and installable app packages.
Application source code lives in each app's own repo.
