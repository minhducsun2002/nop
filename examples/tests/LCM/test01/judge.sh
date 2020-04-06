#!/usr/bin/env bash
OUTPUT="$1"
ANSWER="$2"
set -e
diff -wqts "$OUTPUT" "$ANSWER"