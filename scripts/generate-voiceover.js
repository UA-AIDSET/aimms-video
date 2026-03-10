#!/usr/bin/env node
/**
 * Generate voiceover audio segments from scripts/voiceover.md using ElevenLabs API
 *
 * Each ### block in voiceover.md is an individual generation clip.
 * Output: public/audio/segments/{id}.mp3
 *
 * After generating, combine per-scene clips in an audio editor to produce
 * the full scene audio files used by the Remotion composition.
 *
 * Usage:
 *   npm run voiceover                       # Generate all segments
 *   npm run voiceover -- --scene 1          # All segments in Scene 1
 *   npm run voiceover -- s1-01              # One specific segment
 *   npm run voiceover -- s4-07 s4-07b       # Multiple specific segments
 *   npm run voiceover -- --list             # List all segments without generating
 *
 * Requires: ELEVENLABS_API_KEY in .env or environment variable
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// ── .env loader ───────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = join(process.cwd(), '.env');
  if (existsSync(envPath)) {
    readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key   = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

// ── Constants ─────────────────────────────────────────────────────────────────
const VOICE_ID        = 'tM6ZW48ZoSKdJKuhjatr';
const MODEL           = 'eleven_monolingual_v1';
const SIMILARITY_BOOST = 0.75;

/**
 * Per-type voice settings.
 * stability  — higher = more consistent, lower = more expressive
 * style      — 0.0 is neutral; 0.10–0.20 adds subtle character
 */
const VOICE_SETTINGS_BY_TYPE = {
  intro:   { stability: 0.85, style: 0.10 },
  feature: { stability: 0.82, style: 0.15 },
  demo:    { stability: 0.78, style: 0.20 },
  closing: { stability: 0.86, style: 0.12 },
};

const SCENE_NAMES = {
  1: 'Intro',
  2: 'Medical Case Creator',
  3: 'Faculty Assignment',
  4: 'Virtual Patient',
  5: 'AIMHEI Reports',
  6: 'Flow Recap & Close',
};

// ── Parser ────────────────────────────────────────────────────────────────────
/**
 * Parse voiceover.md into an array of segment objects.
 *
 * Header format:  ### s1-01 [intro | speed:0.88]
 * Text: everything after the header line until the next ### / ## / --- / EOF
 */
function parseSegments() {
  const scriptPath = join(process.cwd(), 'scripts', 'voiceover.md');

  if (!existsSync(scriptPath)) {
    console.error('❌ scripts/voiceover.md not found');
    process.exit(1);
  }

  const content  = readFileSync(scriptPath, 'utf-8');
  const segments = [];

  // Regex captures:  1=id  2=scene#  3=segment#(+letter)  4=type  5=speed  6=body text
  const blockRegex =
    /^### (s(\d+)-(\d+[a-z]?))\s+\[(\w+)\s*\|\s*speed:([\d.]+)\]([\s\S]*?)(?=\n###|\n##|\n---|\s*$)/gm;

  let match;
  while ((match = blockRegex.exec(content)) !== null) {
    const id    = match[1];                // e.g. "s4-07b"
    const scene = parseInt(match[2], 10);  // e.g. 4
    const type  = match[4].toLowerCase(); // e.g. "demo"
    const speed = parseFloat(match[5]);   // e.g. 0.83
    const text  = match[6].trim();        // narration text

    if (!text) continue; // skip empty blocks

    const settings = VOICE_SETTINGS_BY_TYPE[type] ?? VOICE_SETTINGS_BY_TYPE.feature;

    segments.push({ id, scene, type, speed, text, settings });
  }

  if (segments.length === 0) {
    console.error('❌ No segments found in voiceover.md — check the ### header format.');
    process.exit(1);
  }

  return segments;
}

// ── API call ──────────────────────────────────────────────────────────────────
async function generateSegment(seg) {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    console.error('❌ ELEVENLABS_API_KEY is not set.');
    console.error('   Add it to .env:  ELEVENLABS_API_KEY=your_key_here');
    process.exit(1);
  }

  const tag = `[${seg.type} | spd:${seg.speed} | stab:${seg.settings.stability} | sty:${seg.settings.style}]`;
  console.log(`\n🎙️  ${seg.id}  ${tag}`);
  console.log(`   "${seg.text.slice(0, 72)}${seg.text.length > 72 ? '…' : ''}"`);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key':   apiKey,
        'Content-Type': 'application/json',
        'Accept':       'audio/mpeg',
      },
      body: JSON.stringify({
        text:     seg.text,
        model_id: MODEL,
        voice_settings: {
          stability:        seg.settings.stability,
          similarity_boost: SIMILARITY_BOOST,
          style:            seg.settings.style,
          speed:            seg.speed,
        },
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs API error ${response.status}: ${err}`);
  }

  const outputDir  = join(process.cwd(), 'public', 'audio', 'segments');
  mkdirSync(outputDir, { recursive: true });

  const outputPath = join(outputDir, `${seg.id}.mp3`);
  writeFileSync(outputPath, Buffer.from(await response.arrayBuffer()));

  console.log(`   ✅  → public/audio/segments/${seg.id}.mp3`);
}

// ── List helper ───────────────────────────────────────────────────────────────
function listSegments(segments) {
  let currentScene = null;
  for (const seg of segments) {
    if (seg.scene !== currentScene) {
      currentScene = seg.scene;
      console.log(`\n  Scene ${seg.scene}: ${SCENE_NAMES[seg.scene] ?? ''}`);
    }
    const isAlt = seg.id.endsWith('b');
    const alt   = isAlt ? '  ← alternate take' : '';
    console.log(`    ${seg.id.padEnd(8)} [${seg.type.padEnd(7)} | speed:${seg.speed}]${alt}`);
  }
  console.log(`\n  Total: ${segments.length} segments\n`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const rawArgs = process.argv.slice(2);

  // --list flag
  if (rawArgs.includes('--list')) {
    const all = parseSegments();
    console.log('\n📋 All segments in voiceover.md:\n');
    listSegments(all);
    return;
  }

  // --scene N flag
  const sceneIdx  = rawArgs.indexOf('--scene');
  const sceneNum  = sceneIdx !== -1 ? parseInt(rawArgs[sceneIdx + 1], 10) : null;

  // Positional segment IDs (anything not starting with -- and not a plain number)
  const targetIds = rawArgs
    .filter((a) => !a.startsWith('--') && !/^\d+$/.test(a))
    .map((a) => a.toLowerCase());

  const allSegments = parseSegments();
  let queue;

  if (targetIds.length > 0) {
    // Specific segment IDs
    queue = allSegments.filter((s) => targetIds.includes(s.id));
    const missing = targetIds.filter((id) => !allSegments.find((s) => s.id === id));
    if (missing.length) {
      console.error(`❌ Unknown segment IDs: ${missing.join(', ')}`);
      console.error('   Run `npm run voiceover -- --list` to see all valid IDs.');
      process.exit(1);
    }
    console.log(`\n🎬 Generating ${queue.length} segment(s): ${targetIds.join(', ')}`);

  } else if (sceneNum !== null) {
    // All segments for one scene
    queue = allSegments.filter((s) => s.scene === sceneNum);
    if (!queue.length) {
      console.error(`❌ No segments found for scene ${sceneNum}`);
      process.exit(1);
    }
    console.log(`\n🎬 Generating ${queue.length} segment(s) for Scene ${sceneNum}: ${SCENE_NAMES[sceneNum] ?? ''}`);

  } else {
    // All segments
    queue = allSegments;
    console.log(`\n🎬 Generating all ${queue.length} segments across ${Object.keys(SCENE_NAMES).length} scenes`);
  }

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < queue.length; i++) {
    const seg = queue[i];
    try {
      await generateSegment(seg);
      passed++;
    } catch (err) {
      console.error(`   ❌  ${seg.id} failed: ${err.message}`);
      failed++;
    }
    // Small delay between calls to avoid rate limiting
    if (i < queue.length - 1) {
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`✨ Done.  ${passed} generated${failed ? `  |  ${failed} failed` : ''}.`);
  console.log(`   Segments saved to:  public/audio/segments/`);
  console.log(`\n   Next steps:`);
  console.log(`   1. Listen to each clip and compare alternate takes (e.g. s4-07 vs s4-07b)`);
  console.log(`   2. Combine chosen clips per scene in your audio editor`);
  console.log(`   3. Export as:  public/audio/scene{N}_{name}.mp3`);
  console.log(`${'─'.repeat(60)}\n`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
