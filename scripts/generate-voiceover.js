#!/usr/bin/env node
/**
 * Generate voiceover audio files from scripts/voiceover.md using ElevenLabs API
 * 
 * Usage:
 *   npm run voiceover           # Generate all scenes
 *   npm run voiceover -- 3      # Generate only scene 3
 * 
 * Requires: ELEVENLABS_API_KEY in .env file or environment variable
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Load .env file if it exists
function loadEnv() {
  const envPath = join(process.cwd(), '.env');
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const VOICE_ID = 'tM6ZW48ZoSKdJKuhjatr';
const MODEL = 'eleven_monolingual_v1';
const VOICE_SETTINGS = {
  stability: 0.85,
  similarity_boost: 0.75,
  style: 0.0,
};

// Filename suffixes for each scene
const SCENE_FILENAMES = {
  1: 'scene1_intro.mp3',
  2: 'scene2_mcc.mp3',
  3: 'scene3_assignment.mp3',
  4: 'scene4_vp.mp3',
  5: 'scene5_aimhei.mp3',
  6: 'scene6_recap.mp3',
};

function parseVoiceoverScript() {
  const scriptPath = join(process.cwd(), 'scripts', 'voiceover.md');
  const content = readFileSync(scriptPath, 'utf-8');
  
  const scenes = [];
  const sceneRegex = /^## Scene (\d+):.*?\(speed ([\d.]+),.*?\)\r?\n\r?\n([\s\S]*?)(?=\r?\n## Scene |\s*$)/gm;
  
  let match;
  while ((match = sceneRegex.exec(content)) !== null) {
    const sceneNumber = parseInt(match[1], 10);
    scenes.push({
      number: sceneNumber,
      filename: SCENE_FILENAMES[sceneNumber],
      speed: parseFloat(match[2]),
      text: match[3].trim(),
    });
  }
  
  return scenes;
}

async function generateAudio(scene) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    console.error('❌ ELEVENLABS_API_KEY environment variable not set');
    console.error('   PowerShell: $env:ELEVENLABS_API_KEY="your_key_here"');
    console.error('   Or put ELEVENLABS_API_KEY=your_key_here in .env');
    process.exit(1);
  }
  
  console.log(`🎙️  Generating Scene ${scene.number} (speed ${scene.speed})...`);
  
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: scene.text,
          model_id: MODEL,
          voice_settings: {
            ...VOICE_SETTINGS,
            speed: scene.speed,
          },
        }),
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} ${error}`);
    }
    
    const audioBuffer = Buffer.from(await response.arrayBuffer());
    
    // Ensure output directory exists
    const outputDir = join(process.cwd(), 'public', 'audio');
    mkdirSync(outputDir, { recursive: true });
    
    // Write audio file
    const outputPath = join(outputDir, scene.filename);
    writeFileSync(outputPath, audioBuffer);
    
    console.log(`✅ Scene ${scene.number} saved to public/audio/${scene.filename}`);
  } catch (error) {
    console.error(`❌ Failed to generate Scene ${scene.number}:`, error);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
  const sceneArg = args.find((arg) => /^\d+$/.test(arg));
  const scenes = parseVoiceoverScript();
  
  if (sceneArg) {
    const sceneNumber = parseInt(sceneArg, 10);
    const scene = scenes.find(s => s.number === sceneNumber);
    
    if (!scene) {
      console.error(`❌ Scene ${sceneNumber} not found in voiceover.md`);
      process.exit(1);
    }
    
    await generateAudio(scene);
  } else {
    console.log(`🎬 Generating voiceover for ${scenes.length} scenes...`);
    
    for (const scene of scenes) {
      await generateAudio(scene);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n✨ All done! Generated ${scenes.length} voiceover files.`);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
