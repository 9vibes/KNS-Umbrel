FROM python:3.12-slim-bookworm
ARG UPSTREAM_COMMIT=1116bea76032bee5668e5f097294d082fa0b84f0
LABEL org.opencontainers.image.source="https://github.com/9vibes/KNS-Umbrel" \
      org.opencontainers.image.title="YuE2 GPU (KUNAS)" \
      org.opencontainers.image.licenses="Apache-2.0"
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates libsndfile1 libgomp1 gosu && rm -rf /var/lib/apt/lists/*
WORKDIR /opt/yue
RUN git init . && git remote add origin https://github.com/multimodal-art-projection/YuE.git \
    && git fetch --depth 1 origin ${UPSTREAM_COMMIT} && git checkout --detach FETCH_HEAD \
    && test "$(git rev-parse HEAD)" = "${UPSTREAM_COMMIT}" && rm -rf .git
RUN pip install --no-cache-dir torch==2.10.0 --index-url https://download.pytorch.org/whl/cu126 \
    && pip install --no-cache-dir . Flask==3.1.3 gunicorn==27.0.1 \
    && pip check
WORKDIR /app
COPY server.py worker.py test_server.py ./
COPY templates ./templates
COPY static ./static
RUN YUE_DATA_DIR=/tmp/yue-test python -m unittest -v test_server && rm -rf /tmp/yue-test \
    && python -c "import torch, yue2; assert torch.version.cuda == '12.6'" \
    && groupadd --gid 1000 yue && useradd --uid 1000 --gid 1000 --create-home yue
COPY entrypoint.sh /usr/local/bin/yue-entrypoint
RUN chmod 755 /usr/local/bin/yue-entrypoint
ENV PYTHONUNBUFFERED=1 HF_HOME=/data/models XDG_CACHE_HOME=/data/cache YUE_DATA_DIR=/data HF_HUB_DISABLE_TELEMETRY=1 DO_NOT_TRACK=1
EXPOSE 7860
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:7860/health', timeout=3)"
ENTRYPOINT ["/usr/local/bin/yue-entrypoint"]
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--workers", "1", "--threads", "4", "--timeout", "120", "--access-logfile", "-", "server:app"]
