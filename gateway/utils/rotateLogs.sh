#!/bin/bash
# Rotation des logs Traefik
LOGS_DIR="/logs"
MAX_SIZE_MB=100

find "$LOGS_DIR" -name "*.log" -size +"${MAX_SIZE_MB}M" -exec gzip {} \;
find "$LOGS_DIR" -name "*.log.gz" -mtime +30 -delete
