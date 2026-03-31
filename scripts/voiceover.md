# AIMMS Demo Video — Voiceover Scripts

Voice ID: `tM6ZW48ZoSKdJKuhjatr`
Model: `eleven_monolingual_v1`
Note: "AIMHEI" spelled as "Aim-High" for correct pronunciation
Note: Avoid ellipses (...) — use dashes (—) and periods for natural pauses

## Segment Format

Each `###` block below is an individual ElevenLabs generation clip.
Header format: `### {id} [{type} | speed:{value}]`

Output location: `public/audio/segments/{id}.mp3`

After generating, combine per-scene clips in an audio editor (Audacity,
Adobe Audition, etc.) to produce the full scene audio files expected by
the Remotion composition (`public/audio/scene1_intro.mp3`, etc.)

Alternate takes are marked with a `b` suffix (e.g. `s1-03b`).
Generate both, listen, and keep the one that sounds most natural.

## Voice Settings by Type

| Type    | Stability | Similarity Boost | Style | Use For                            |
|---------|-----------|------------------|-------|------------------------------------|
| intro   | 0.85      | 0.75             | 0.10  | Title card, opening statements     |
| feature | 0.82      | 0.75             | 0.15  | Feature explanations, transitions  |
| demo    | 0.78      | 0.75             | 0.20  | Active demonstrations, step lists  |
| closing | 0.86      | 0.75             | 0.12  | Final close, sign-off              |

---

## Scene 0: Cold Open (ASTEC Building)
Scene duration: 660 frames (22.0s) — combine s0-01 through s0-03 into scene0_astec.mp3

### s0-01 [intro | speed:0.88 | voice:e9qTHBSHe2EUZDipYDHG]
The Health Sciences Innovation Building — home to ASTEC.

### s0-02 [intro | speed:0.88 | voice:e9qTHBSHe2EUZDipYDHG]
ASTEC — the Arizona Simulation Technology and Education Center. Advancing healthcare education through simulation, innovation, and technology.

### s0-03 [intro | speed:0.88 | voice:e9qTHBSHe2EUZDipYDHG]
State-of-the-art simulation. Interprofessional training. AI-driven innovation — preparing safer, smarter healthcare professionals.

---

## Scene 1: Intro

### s1-01 [intro | speed:0.88]
Introducing AIMMS — the AI Medical Mentoring System.

### s1-02 [intro | speed:0.88]
Built by the Arizona Simulation Technology and Education Center.

### s1-03 [intro | speed:0.88]
End-to-end case authoring. Patient simulation. AI-driven evaluation.

### s1-03b [intro | speed:0.88]
Case authoring. Patient simulation. AI-driven evaluation — all in one platform.

---

## Scene 2: Medical Case Creator

### s2-01 [feature | speed:0.85]
It starts with the Medical Case Creator.

### s2-02 [demo | speed:0.85]
Faculty browse the ASTEC Case Library — structured clinical scenarios, organized by specialty.

### s2-03 [demo | speed:0.85]
Select a template. AI fills every field — automatically.

### s2-04 [demo | speed:0.85]
Realistic patient data, generated in seconds.

### s2-05 [feature | speed:0.85]
The case is published — and ready for the Virtual Patient.

### s2-05b [feature | speed:0.85]
Published — and ready for the Virtual Patient.

---

## Scene 3: Faculty Assignment

### s3-01 [feature | speed:0.85]
Next, faculty assign cases through the Dashboard.

### s3-02 [demo | speed:0.85]
The three-panel layout shows classes, students, and cases — side by side.

### s3-03 [demo | speed:0.85]
Select a class. Choose students. Pick a case.

### s3-04 [demo | speed:0.85]
Set a due date — and assign.

### s3-05 [feature | speed:0.85]
All in one streamlined view. Assignments reach students instantly.

---

## Scene 4: Virtual Patient

Visual reference: `src/scenes/Scene4_VirtualPatient.tsx` (timeline comment block at top of file).

**After editing these lines:**

1. `npm run voiceover -- --scene 4` — generates `public/audio/segments/s4-*.mp3` (requires `ELEVENLABS_API_KEY`).
2. `npm run voiceover:stitch-4` — concatenates `s4-01` → `s4-11` into `public/audio/scene4_vp.mp3` (requires `ffmpeg`).

Alternate takes: `S4_07_ID=s4-07b S4_08_ID=s4-08b S4_11_ID=s4-11b npm run voiceover:stitch-4`

Re-check lip-sync beats after a new master: vitals ~9.3s (“Real-time” → ~f323), submit ~56.5s (~f1740 from f45 offset).

### s4-01 [feature | speed:0.83]
Students enter the Virtual Patient — an immersive clinical encounter.

### s4-02 [demo | speed:0.83]
A 3D patient model — then live vital signs in real time.

### s4-03 [demo | speed:0.83]
The student interviews the patient — symptoms, history, and context in one flowing conversation.

### s4-04 [demo | speed:0.83]
Then, the physical exam.

### s4-05 [demo | speed:0.83]
Stethoscope. Palpation. Percussion — each tool surfaces a focused finding.

### s4-06 [demo | speed:0.83]
Every finding ties to real media from a curated patient library — audio, imaging, and tags mapped to the case.

### s4-07 [demo | speed:0.83]
Heart sounds, lung audio, and examination images — sequenced and mapped to this patient.

### s4-07b [demo | speed:0.83]
Heart sounds. Lung audio. Examination images — all mapped to the case.

### s4-08 [feature | speed:0.83]
Clinical reasoning: a ranked differential takes shape — then the workup orders the tests that support it.

### s4-08b [feature | speed:0.83]
The differential is ranked — and the supporting labs and imaging are ordered in one structured view.

### s4-09 [demo | speed:0.83]
Assessment and plan — documented in a formal note. Treatment steps build line by line — with consult or referral when escalation is needed.

### s4-10 [demo | speed:0.83]
The encounter pulls back into a single record — vitals, history, exam, media, differential, and plan — complete and ready to review.

### s4-11 [demo | speed:0.83]
Submit — the session is locked and saved. Evaluation is queued — faculty review and scoring are next.

### s4-11b [demo | speed:0.83]
Submit. Session captured and secured — ready for evaluation.

---

## Scene 5: AIMHEI Reports

### s5-01 [feature | speed:0.85]
After the encounter, Aim-High analyzes the full transcript.

### s5-02 [feature | speed:0.85]
Clinical skills. Terminology. Empathy — all evaluated.

### s5-03 [demo | speed:0.85]
A detailed report card shows scores and competency breakdowns.

### s5-04 [demo | speed:0.85]
Faculty review the rubric — adjust where needed — and finalize the evaluation.

---

## Scene 6: Flow Recap & Close

### s6-01 [feature | speed:0.85]
That's the complete pipeline.

### s6-02 [feature | speed:0.85]
Author. Assign. Simulate. Evaluate. Report.

### s6-03 [feature | speed:0.85]
Each step connects seamlessly — data-driven, and built to scale medical education.

### s6-04 [closing | speed:0.85]
The AI Medical Mentoring System — transforming how we train the next generation.

### s6-04b [closing | speed:0.85]
The AI Medical Mentoring System. Transforming how we train the next generation.
