#!/usr/bin/env bash
# Concatenate ElevenLabs segment MP3s into public/audio/scene4_vp.mp3
# Requires: ffmpeg (brew install ffmpeg)
#
# Usage:
#   npm run voiceover:stitch-4
#   bash scripts/stitch-scene4-voiceover.sh
#
# Alternate takes (optional env — default is primary take):
#   S4_07_ID=s4-07b S4_08_ID=s4-08b S4_11_ID=s4-11b npm run voiceover:stitch-4

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SEG="${ROOT}/public/audio/segments"
OUT="${ROOT}/public/audio/scene4_vp.mp3"

S4_07_ID="${S4_07_ID:-s4-07}"
S4_08_ID="${S4_08_ID:-s4-08}"
S4_11_ID="${S4_11_ID:-s4-11}"

IDS=(
  s4-01 s4-02 s4-03 s4-04 s4-05 s4-06
  "${S4_07_ID}"
  "${S4_08_ID}"
  s4-09 s4-10
  "${S4_11_ID}"
)

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
  echo "   npm run voiceover -- --scene 4"
  echo ""
  for m in "${MISSING[@]}"; do
    echo "   - $m"
  done
  exit 1
fi

CONCAT_LIST="${SEG}/.scene4-concat.txt"
{
  for id in "${IDS[@]}"; do
    # Paths relative to SEG so ffmpeg concat-safe works
    printf "file '%s'\n" "${id}.mp3"
  done
} > "$CONCAT_LIST"

echo "🔗 Stitching Scene 4 voiceover → ${OUT}"
echo "   Order: ${IDS[*]}"
ffmpeg -y -hide_banner -loglevel warning -f concat -safe 0 -i "$CONCAT_LIST" -c copy "$OUT"
rm -f "$CONCAT_LIST"

echo "✅  Wrote $(basename "$OUT") ($(du -h "$OUT" | cut -f1))"
echo "   Re-open Remotion and verify sync (vitals ~f323, submit ~f1740 from f45 offset)."
