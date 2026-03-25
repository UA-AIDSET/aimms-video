#!/usr/bin/env bash
# Concatenate ElevenLabs segment MP3s into public/audio/scene0_astec.mp3
# Requires: ffmpeg (brew install ffmpeg)
#
# Usage:
#   npm run voiceover:stitch-0
#   bash scripts/stitch-scene0-voiceover.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SEG="${ROOT}/public/audio/segments"
OUT="${ROOT}/public/audio/scene0_astec.mp3"

IDS=(s0-01 s0-02 s0-03)

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "❌ ffmpeg not found. Install:  brew install ffmpeg"
  exit 1
fi

MISSING=()
for id in "${IDS[@]}"; do
  f="${SEG}/${id}.mp3"
  if [[ ! -f "$f" ]]; then
    MISSING+=("$f")
  fi
done

if [[ ${#MISSING[@]} -gt 0 ]]; then
  echo "❌ Missing segment file(s). Generate first:"
  echo "   npm run voiceover -- --scene 0"
  echo ""
  for m in "${MISSING[@]}"; do
    echo "   - $m"
  done
  exit 1
fi

CONCAT_LIST="${SEG}/.scene0-concat.txt"
{
  for id in "${IDS[@]}"; do
    printf "file '%s'\n" "${id}.mp3"
  done
} > "$CONCAT_LIST"

echo "🔗 Stitching Scene 0 voiceover → ${OUT}"
echo "   Order: ${IDS[*]}"
ffmpeg -y -hide_banner -loglevel warning -f concat -safe 0 -i "$CONCAT_LIST" -c copy "$OUT"
rm -f "$CONCAT_LIST"

echo "✅  Wrote $(basename "$OUT") ($(du -h "$OUT" | cut -f1))"
echo "   Re-open Remotion and verify sync with ASTEC building reveal."
