FROM ghcr.io/anomalyco/opencode:1.18.29@sha256:ecc3bf96ee55dad226d9cde50d79aaa8a1215c47860c0fcdc71570461bf438b8

USER root

RUN set -eux; \
    if command -v apk >/dev/null 2>&1; then \
      apk add --no-cache git openssh-client ca-certificates; \
    elif command -v apt-get >/dev/null 2>&1; then \
      apt-get update; \
      apt-get install -y --no-install-recommends git openssh-client ca-certificates; \
      rm -rf /var/lib/apt/lists/*; \
    elif command -v microdnf >/dev/null 2>&1; then \
      microdnf install -y git openssh-clients ca-certificates; \
      microdnf clean all; \
    elif command -v dnf >/dev/null 2>&1; then \
      dnf install -y git openssh-clients ca-certificates; \
      dnf clean all; \
    else \
      echo "No supported package manager found to install git" >&2; \
      exit 1; \
    fi; \
    git --version

USER 1000:1000
