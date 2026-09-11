#!/bin/sh
set -eu
umask 077
mkdir -p /data/config /data/cache
# Fixed mount roots only; never recursively walk user-controlled directories.
chown node:node /data /data/config /data/cache
chmod 700 /data/config
exec gosu node node node_modules/vite/bin/vite.js --host 0.0.0.0 --port 4173 --strictPort
