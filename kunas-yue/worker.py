"""One generation per process so GPU memory is released between songs."""
import json
import os
from pathlib import Path
import sys


def main():
    import torch
    from yue2 import YuE2Pipeline
    if not torch.cuda.is_available() or not torch.cuda.is_bf16_supported():
        raise RuntimeError('YuE2 requires an available NVIDIA GPU with BF16 support. Check NVIDIA Container Toolkit and the host driver.')
    directory = Path(sys.argv[1])
    data = json.loads((directory / 'input.json').read_text())
    with YuE2Pipeline.from_pretrained(
        'm-a-p/YuE2-3B', vae='m-a-p/YuE2-Vae',
        revision='8f24312f187763b9854adeec87e437e2b03bbff1',
        vae_revision='152733a19ad43aa67e367f9b5503ef8075bb5126',
        device='cuda:0', memory_budget_gib=float(os.environ.get('YUE_MEMORY_GIB', '24')),
        low_vram=True,
    ) as pipeline:
        result = pipeline(**data)
        result.save_artifacts(directory)


if __name__ == '__main__':
    main()
