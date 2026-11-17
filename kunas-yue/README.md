# YuE2 GPU for Umbrel

Packaging adapter for [multimodal-art-projection/YuE](https://github.com/multimodal-art-projection/YuE).
Upstream generation code remains in that repository. This folder supplies the
small Umbrel web interface and container packaging.

## Requirements

- Linux AMD64, NVIDIA GPU with BF16 support (24 GB VRAM recommended).
- NVIDIA Container Toolkit and a host driver compatible with CUDA 12.6.
- Enough free disk for the CUDA image, model downloads, and generated artifacts.
- Free GPU memory: other AI apps such as ComfyUI, InvokeAI, and Ollama can compete
  for it. This package selects GPU 0; it does not combine the memory of two GPUs.

## Use

Enter a musical style, lyrics (with optional `[Verse]` / `[Chorus]` labels), and
seed, then select **Create song**. The app runs one generation at a time. Models
are downloaded from Hugging Face on the first request, not during app startup.
The page may be closed during generation. Restarting the app interrupts the job
and marks it as interrupted on next startup; start a new song to retry.

Completed songs provide FLAC playback/download, the ABC score, request/config,
model identities and result metadata, and intermediate arrays. A length-limit
warning is shown when upstream reports truncation. Failed jobs retain a log.
No paid API or external song-generation service is used.

The container uses low-VRAM mode and releases GPU memory when each generation
process exits. Downloads are cached; no automatic deletion of songs occurs.

## Persistence and access

- `${APP_DATA_DIR}/data/models`: Hugging Face model cache.
- `${APP_DATA_DIR}/data/songs`: per-song artifacts and generation logs.
- `${APP_DATA_DIR}/data/cache`: runtime cache.
- Umbrel app proxy protects the UI. No raw backend port is published.
- Only the GPU runtime and app data volume are required; no privileged mode or
  Docker socket is mounted. The web service and model worker run as UID 1000.

## Pinned upstream

- Code: `1116bea76032bee5668e5f097294d082fa0b84f0` (YuE2 0.1.6).
- Song model: `m-a-p/YuE2-3B` at `8f24312f187763b9854adeec87e437e2b03bbff1`.
- VAE: `m-a-p/YuE2-Vae` at `152733a19ad43aa67e367f9b5503ef8075bb5126`.
- PyTorch 2.10.0, CUDA 12.6; no vLLM or custom CUDA compilation required.

The upstream code is Apache-2.0. Model weights have separate terms: see
[MODEL_LICENSE](https://github.com/multimodal-art-projection/YuE/blob/1116bea76032bee5668e5f097294d082fa0b84f0/MODEL_LICENSE).

## Validation scope

Adapter tests cover input validation, request protection, one-job admission,
failure recovery, saved outputs, truncation warnings, and download paths.
CI builds Linux AMD64, verifies dependencies/imports, starts the HTTP server,
and checks persistent volume writes across restart without downloading models.
CI has no NVIDIA GPU, so full music generation must be verified on the target
GPU host. Container startup is not proof of successful GPU inference.
