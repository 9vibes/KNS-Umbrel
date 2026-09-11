FROM node:24.14.0-bookworm-slim
ARG UPSTREAM_COMMIT=c7ef01827d7f12407180bc77e3955736c00cd749
LABEL org.opencontainers.image.source="https://github.com/9vibes/KNS-Umbrel"       org.opencontainers.image.title="God's Eye View (KUNAS)"       org.opencontainers.image.licenses="MIT"
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates python3 gosu && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN git init . && git remote add origin https://github.com/bilawalsidhu/gods-eye-view.git && git fetch --depth 1 origin ${UPSTREAM_COMMIT} && git checkout --detach FETCH_HEAD && test "$(git rev-parse HEAD)" = "${UPSTREAM_COMMIT}" && rm -rf .git
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN npm ci && npm test && npm run build
COPY umbrel-admission.mjs admission.test.mjs patch-runtime.py ./
RUN node --test admission.test.mjs && python3 patch-runtime.py && ln -s /data/cache .gev-cache && chown -R node:node /app
COPY entrypoint.sh /usr/local/bin/gev-entrypoint
COPY smoke.mjs /app/umbrel-smoke.mjs
RUN chmod 755 /usr/local/bin/gev-entrypoint
ENV GEV_UMBREL=1 HOST=0.0.0.0 PORT=4173
EXPOSE 4173
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s CMD node -e "fetch('http://127.0.0.1:4173/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
ENTRYPOINT ["/usr/local/bin/gev-entrypoint"]
