#!/bin/sh
set -eu
mkdir -p /data/models /data/cache /data/songs
chown 1000:1000 /data /data/models /data/cache /data/songs
exec gosu yue "$@"
