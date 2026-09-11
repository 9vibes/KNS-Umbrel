# God's Eye View — KUNAS package

Upstream MIT source: https://github.com/bilawalsidhu/gods-eye-view
Pinned revision: `c7ef01827d7f12407180bc77e3955736c00cd749` (0.1.1).
Image: `ghcr.io/9vibes/kunas-gods-eye-view:0.1.1-umbrel.1` (amd64/arm64).

Add https://github.com/9vibes/KNS-Umbrel as an Umbrel community store.
Installation is a separate, explicit user action.

## Runtime and security boundary

Upstream `vite preview` omits custom API middleware: this image intentionally
runs Vite serve, including Cesium assets and live provider proxies. Node 24.14.
No host backend ports are published. Umbrel app_proxy authentication MUST stay
on; this is a personal authenticated app, not a public multi-user service.
The upstream loopback-only settings gate remains the default; the package's
explicit GEV_UMBREL=1 enables a separate same-origin gate behind Umbrel login.
It rejects missing/cross origins on writes, cross-site fetch metadata, invalid
authorities and non-JSON writes. Never reuse this image as a public server.

Settings load/save `/data/config/.env`, atomically replaced with mode 0600.
The config directory has mode 0700. A directory mount is required because
upstream writes via rename (a file bind or symlink would fail). Caches live in
`/data/cache`. Startup repairs only fixed directory roots then drops to node.
Source remains in the image; upgrades do not overwrite persisted keys.
Google/Cesium browser keys remain client-visible by upstream design.
Protect backups; credentials are not encrypted at rest.

Optional paid provider keys are configured through POWER UP. No keys bundled.
Microphone/voice requires trusted HTTPS, not ordinary remote LAN HTTP.
Public upstream feeds and paid provider functionality can fail or rate-limit;
CI tests keyless runtime, not paid services or a host installation.

## Verification

CI runs upstream unit tests and production asset build, package admission tests,
then Docker runtime smoke tests (UI, Cesium/model assets, setup API, rejected
writes, credential permissions and persistence across an actual restart).
It publishes both architectures using the existing store GHCR convention.
`assets/1.png` is a still from upstream's hero demo (MIT); icon is upstream logo.
