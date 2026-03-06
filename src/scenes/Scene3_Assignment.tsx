import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../layouts/SceneShell";
import { ParticleField } from "../three/ParticleField";
import { AnimatedGrid } from "../three/AnimatedGrid";
import { GlowOrb } from "../three/GlowOrb";
import { DataStream } from "../three/DataStream";
import { CameraRig } from "../three/CameraRig";
import { GlassPanel } from "../components/GlassPanel";
import { PulsingDot } from "../components/PulsingDot";
import { colors, fonts } from "../theme";

/* ── Data ── */
const classes = [
  { name: "MED 501 — Clinical Skills", code: "MED501", students: 24, active: 18 },
  { name: "MED 602 — Diagnostics", code: "MED602", students: 18, active: 12 },
  { name: "MED 410 — Foundations", code: "MED410", students: 32, active: 24 },
];

const students = [
  { name: "A. Johnson", assigned: 2 },
  { name: "B. Chen", assigned: 1 },
  { name: "C. Reyes", assigned: 3 },
  { name: "D. Patel", assigned: 0 },
  { name: "E. Williams", assigned: 1 },
  { name: "F. Garcia", assigned: 2 },
  { name: "G. Kim", assigned: 1 },
  { name: "H. Brown", assigned: 0 },
];

const assignmentCases = [
  { title: "Pneumonia — Adult", sections: 8, tag: "Respiratory", assigned: 12 },
  { title: "Heart Failure — Elderly", sections: 8, tag: "Cardiology", assigned: 8 },
  { title: "Appendicitis — Peds", sections: 8, tag: "Surgery", assigned: 4 },
];

/* ── Existing assignments for the class (shown before "Assign Cases" is clicked) ── */
const existingAssignments = [
  { caseName: "Heart Failure — Elderly", student: "A. Johnson", due: "Feb 15", status: "Completed" },
  { caseName: "Heart Failure — Elderly", student: "B. Chen", due: "Feb 15", status: "Completed" },
  { caseName: "Heart Failure — Elderly", student: "C. Reyes", due: "Feb 15", status: "In Progress" },
  { caseName: "Appendicitis — Peds", student: "D. Patel", due: "Mar 1", status: "Completed" },
  { caseName: "Appendicitis — Peds", student: "E. Williams", due: "Mar 1", status: "In Progress" },
  { caseName: "Appendicitis — Peds", student: "F. Garcia", due: "Mar 1", status: "Not Started" },
  { caseName: "Heart Failure — Elderly", student: "G. Kim", due: "Feb 15", status: "Completed" },
  { caseName: "Heart Failure — Elderly", student: "H. Brown", due: "Feb 15", status: "In Progress" },
];

/**
 * Scene 3: Faculty Assignment — ~500 frames
 * Single persistent three-panel layout (like the real Faculty Dashboard).
 * Left: class list, Middle: student selection, Right: case selection + config.
 * Content within panels animates over time.
 *
 * 65-120:   Panels appear, class list populates
 * 120-180:  Class selected, students populate middle, cases appear right
 * 180-280:  Case selected, students get checked off
 * 280-380:  Config appears, "Assign" button activates
 * 380-485:  Success flash, status updates in panels
 */
export const Scene3_Assignment: React.FC = () => {
  const frame = useCurrentFrame();
  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  // Overall three-panel opacity
  const panelOpacity = interpolate(frame, [65, 80, 470, 490], [0, 1, 1, 0], clamp);

  // Class selection
  const classHighlight = interpolate(frame, [105, 130], [0, 1], clamp);

  // Existing assignments table content (shown initially)
  const existingTableContent = interpolate(frame, [95, 115], [0, 1], clamp);

  // "Assign Cases" button click moment (~180)
  const assignButtonClick = interpolate(frame, [175, 185], [0, 1], clamp);

  // After button click: existing assignments fade out, student grid fades in
  const existingFadeOut = interpolate(frame, [180, 200], [1, 0], clamp);
  const studentGridIn = interpolate(frame, [200, 225], [0, 1], clamp);

  // Right panel: initially shows summary, switches to case selection after click
  const rightContent = interpolate(frame, [95, 115], [0, 1], clamp);
  const rightCaseMode = interpolate(frame, [200, 225], [0, 1], clamp);

  // Case selection highlight
  const caseSelect = interpolate(frame, [240, 265], [0, 1], clamp);

  // Student checkmarks (staggered, after case is selected)
  const studentChecks = students.map((_, i) =>
    interpolate(frame, [270 + i * 8, 282 + i * 8], [0, 1], clamp),
  );

  // Config panel appearance
  const configAppear = interpolate(frame, [330, 355], [0, 1], clamp);

  // Assign button ready
  const assignReady = interpolate(frame, [360, 380], [0, 1], clamp);

  // Success state
  const successFlash = interpolate(frame, [400, 415, 440, 455], [0, 1, 1, 0], clamp);
  const postAssign = interpolate(frame, [415, 435], [0, 1], clamp);

  /* ── 3D (ambient) ── */
  const threeContent = (
    <>
      <AnimatedGrid color={colors.azurite} opacity={0.08} />
      <ParticleField count={50} color={colors.oasis} speed={0.002} opacity={0.18} />
      <GlowOrb position={[0, 0, -3]} color={colors.azurite} radius={3} baseOpacity={0.08} />
      <DataStream direction="right" position={[-4, 0, -2]} color={colors.oasis} opacity={0.15} length={8} speed={0.04} />
      <CameraRig
        positions={[
          { frame: 0, position: [0, 0, 10] },
          { frame: 250, position: [0, 0, 9] },
          { frame: 500, position: [0, 0, 9] },
        ]}
      />
    </>
  );

  return (
    <SceneShell
      interstitial={{ step: 2, title: "Assign", subtitle: "Faculty to Student" }}
      sectionLabel="Assignment Pipeline"
      threeContent={threeContent}
    >

      {/* ════════════════════════════════════════════════════════
          Persistent Three-Panel Layout (65–490)
         ════════════════════════════════════════════════════════ */}
      {panelOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            padding: "80px 30px 30px",
            opacity: panelOpacity,
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: fonts.heading, fontSize: 24, fontWeight: 700, color: colors.white }}>
              Faculty Dashboard — MED 501
            </div>
            <div style={{
              fontFamily: fonts.body, fontSize: 16, fontWeight: 600,
              color: assignButtonClick > 0.5 ? colors.white : colors.oasis,
              background: assignButtonClick > 0.5 ? colors.oasis : `${colors.oasis}20`,
              padding: "6px 18px", borderRadius: 8,
              opacity: interpolate(frame, [90, 105], [0.5, 1], clamp),
              boxShadow: assignButtonClick > 0.3 && assignButtonClick < 0.7 ? `0 0 20px ${colors.oasis}50` : `0 0 10px ${colors.oasis}20`,
              transform: `scale(${assignButtonClick > 0.3 && assignButtonClick < 0.7 ? 1.05 : 1})`,
            }}>
              {postAssign > 0.5 ? "8 Assigned" : "Assign Cases"}
            </div>
          </div>

          {/* Three panels */}
          <div style={{ display: "flex", gap: 12, flex: 1 }}>
            {/* ── Left Panel: Class List ── */}
            <GlassPanel enterFrame={70} exitFrame={490} style={{ width: 260, padding: "14px 16px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.oasis, marginBottom: 10, letterSpacing: 1 }}>
                Classes
              </div>
              {classes.map((cls, i) => {
                const isActive = i === 0;
                const clsOpacity = interpolate(frame, [75 + i * 10, 90 + i * 10], [0, 1], clamp);
                return (
                  <div
                    key={cls.code}
                    style={{
                      padding: "10px 12px",
                      marginBottom: 6,
                      borderRadius: 6,
                      opacity: clsOpacity,
                      background: isActive ? `${colors.oasis}12` : "transparent",
                      borderLeft: isActive
                        ? `3px solid rgba(55,141,189,${interpolate(classHighlight, [0, 1], [0.3, 0.9])})`
                        : "3px solid transparent",
                    }}
                  >
                    <div style={{ fontFamily: fonts.body, fontSize: 15, fontWeight: isActive ? 600 : 400, color: isActive ? colors.white : `${colors.white}70` }}>
                      {cls.name}
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 3 }}>
                      <span style={{ fontFamily: fonts.mono, fontSize: 13, color: `${colors.white}60` }}>
                        {cls.students} students
                      </span>
                      <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.oasis }}>
                        {cls.active} active
                      </span>
                    </div>
                  </div>
                );
              })}
              {/* Class stats at bottom */}
              <div style={{ marginTop: "auto", paddingTop: 10, borderTop: `1px solid ${colors.white}08` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontFamily: fonts.mono, fontSize: 13, color: `${colors.white}60` }}>Total Students</span>
                  <span style={{ fontFamily: fonts.mono, fontSize: 15, fontWeight: 700, color: colors.oasis }}>74</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: fonts.mono, fontSize: 13, color: `${colors.white}60` }}>Active Cases</span>
                  <span style={{ fontFamily: fonts.mono, fontSize: 15, fontWeight: 700, color: colors.vitalsNormal }}>54</span>
                </div>
              </div>
            </GlassPanel>

            {/* ── Middle Panel: Existing Assignments → Student Selection ── */}
            <GlassPanel enterFrame={80} exitFrame={490} style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", position: "relative" }}>
              {/* ── View 1: Existing Assignments Table (before Assign Cases click) ── */}
              {existingFadeOut > 0 && (
                <div style={{ opacity: existingFadeOut, display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.oasis, letterSpacing: 1 }}>
                      Current Assignments
                    </div>
                    <div style={{
                      fontFamily: fonts.mono, fontSize: 13, color: `${colors.white}60`,
                      background: `${colors.white}08`, padding: "3px 10px", borderRadius: 4,
                    }}>
                      {existingAssignments.length} active
                    </div>
                  </div>

                  {/* Table header */}
                  <div style={{
                    display: "grid", gridTemplateColumns: "1fr 100px 70px 90px", gap: 8,
                    paddingBottom: 8, marginBottom: 4,
                    borderBottom: `1px solid ${colors.oasis}20`,
                  }}>
                    {["Case", "Student", "Due", "Status"].map((h) => (
                      <span key={h} style={{ fontFamily: fonts.mono, fontSize: 12, fontWeight: 700, color: colors.oasis, letterSpacing: 1, textTransform: "uppercase" as const }}>{h}</span>
                    ))}
                  </div>

                  {/* Table rows */}
                  {existingAssignments.map((a, i) => {
                    const rowOp = interpolate(frame, [100 + i * 6, 112 + i * 6], [0, 1], clamp);
                    const statusColor = a.status === "Completed" ? colors.vitalsNormal : a.status === "In Progress" ? colors.oasis : `${colors.white}50`;
                    return (
                      <div key={`${a.caseName}-${a.student}`} style={{
                        display: "grid", gridTemplateColumns: "1fr 100px 70px 90px", gap: 8,
                        padding: "7px 0", opacity: rowOp * existingTableContent,
                        borderBottom: i < existingAssignments.length - 1 ? `1px solid ${colors.white}06` : "none",
                      }}>
                        <span style={{ fontFamily: fonts.body, fontSize: 14, color: colors.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.caseName}</span>
                        <span style={{ fontFamily: fonts.body, fontSize: 14, color: `${colors.white}70` }}>{a.student}</span>
                        <span style={{ fontFamily: fonts.mono, fontSize: 13, color: `${colors.white}60` }}>{a.due}</span>
                        <span style={{ fontFamily: fonts.mono, fontSize: 12, fontWeight: 600, color: statusColor }}>{a.status}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── View 2: Student Selection Grid (after Assign Cases click) ── */}
              {studentGridIn > 0 && (
                <div style={{ opacity: studentGridIn, display: "flex", flexDirection: "column", flex: 1, position: existingFadeOut > 0 ? "absolute" as const : "relative" as const, inset: existingFadeOut > 0 ? "14px 16px" : undefined }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.oasis, letterSpacing: 1 }}>
                      Select Students
                    </div>
                    <div style={{
                      fontFamily: fonts.mono, fontSize: 13, color: colors.oasis,
                      background: `${colors.oasis}12`, padding: "3px 10px", borderRadius: 4,
                    }}>
                      {postAssign > 0.5 ? "8 / 8 assigned" : `${Math.round(interpolate(frame, [270, 335], [0, 8], clamp))} / 8 selected`}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {students.map((s, i) => {
                      const checked = studentChecks[i];
                      const assigned = postAssign > 0.5;
                      return (
                        <div
                          key={s.name}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "8px 10px", borderRadius: 6,
                            background: (checked > 0.5 || assigned) ? `${colors.oasis}10` : "transparent",
                            border: (checked > 0.5 || assigned) ? `1px solid ${colors.oasis}30` : `1px solid ${colors.white}06`,
                          }}
                        >
                          <div style={{
                            width: 18, height: 18, borderRadius: 3, flexShrink: 0,
                            border: (checked > 0.5 || assigned) ? `2px solid ${colors.oasis}` : `1px solid ${colors.white}25`,
                            background: (checked > 0.5 || assigned) ? colors.oasis : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: fonts.mono, fontSize: 11, color: colors.white,
                          }}>
                            {(checked > 0.5 || assigned) && "\u2713"}
                          </div>
                          <div>
                            <div style={{ fontFamily: fonts.body, fontSize: 15, fontWeight: 600, color: colors.white }}>
                              {s.name}
                            </div>
                            <div style={{ fontFamily: fonts.mono, fontSize: 12, color: assigned ? colors.vitalsNormal : `${colors.white}50` }}>
                              {assigned ? `${s.assigned + 1} cases` : `${s.assigned} cases`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Select All / Deselect bar */}
                  <div style={{ marginTop: "auto", paddingTop: 8, display: "flex", gap: 8 }}>
                    <div style={{
                      fontFamily: fonts.body, fontSize: 13, fontWeight: 600,
                      color: colors.oasis, background: `${colors.oasis}12`,
                      padding: "4px 12px", borderRadius: 4, flex: 1, textAlign: "center" as const,
                    }}>
                      Select All
                    </div>
                    <div style={{
                      fontFamily: fonts.body, fontSize: 13,
                      color: `${colors.white}40`, background: `${colors.white}06`,
                      padding: "4px 12px", borderRadius: 4, flex: 1, textAlign: "center" as const,
                    }}>
                      Deselect All
                    </div>
                  </div>
                </div>
              )}
            </GlassPanel>

            {/* ── Right Panel: Summary → Case Selection + Config ── */}
            <GlassPanel enterFrame={85} exitFrame={490} style={{ width: 340, padding: "14px 16px", display: "flex", flexDirection: "column", position: "relative" }}>
              {/* ── View 1: Class Summary (before Assign Cases click) ── */}
              {existingFadeOut > 0 && (
                <div style={{ opacity: existingFadeOut, display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.oasis, marginBottom: 10, letterSpacing: 1 }}>
                    Class Overview
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: rightContent }}>
                    {[
                      { label: "Active Students", value: "18 / 24", color: colors.oasis },
                      { label: "Cases Assigned", value: "24", color: colors.azurite },
                      { label: "Completed", value: "14", color: colors.vitalsNormal },
                      { label: "In Progress", value: "7", color: colors.oasis },
                      { label: "Not Started", value: "3", color: `${colors.white}50` },
                    ].map((stat) => (
                      <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${colors.white}06` }}>
                        <span style={{ fontFamily: fonts.body, fontSize: 15, color: `${colors.white}70` }}>{stat.label}</span>
                        <span style={{ fontFamily: fonts.mono, fontSize: 17, fontWeight: 700, color: stat.color }}>{stat.value}</span>
                      </div>
                    ))}
                  </div>
                  {/* Available cases preview */}
                  <div style={{ marginTop: "auto", paddingTop: 10, borderTop: `1px solid ${colors.white}08` }}>
                    <div style={{ fontFamily: fonts.mono, fontSize: 12, color: `${colors.white}50`, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" as const }}>
                      Available Cases
                    </div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 14, color: `${colors.white}70` }}>
                      {assignmentCases.length} cases in library
                    </div>
                  </div>
                </div>
              )}

              {/* ── View 2: Case Selection + Config (after Assign Cases click) ── */}
              {rightCaseMode > 0 && (
                <div style={{ opacity: rightCaseMode, display: "flex", flexDirection: "column", flex: 1, position: existingFadeOut > 0 ? "absolute" as const : "relative" as const, inset: existingFadeOut > 0 ? "14px 16px" : undefined }}>
                  <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.oasis, marginBottom: 10, letterSpacing: 1 }}>
                    {configAppear > 0.5 ? "Assignment Config" : "Select Case"}
                  </div>

                  {/* Case cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {assignmentCases.map((c, i) => {
                      const isSelected = i === 0;
                      return (
                        <div
                          key={c.title}
                          style={{
                            padding: "10px 12px", borderRadius: 6,
                            border: isSelected
                              ? `2px solid rgba(55,141,189,${interpolate(caseSelect, [0, 1], [0.2, 0.9])})`
                              : `1px solid ${colors.oasis}12`,
                            background: isSelected && caseSelect > 0.5 ? `${colors.oasis}08` : "transparent",
                            opacity: isSelected ? 1 : interpolate(caseSelect, [0, 1], [1, 0.4]),
                          }}
                        >
                          <div style={{ fontFamily: fonts.body, fontSize: 16, fontWeight: 600, color: colors.white, marginBottom: 4 }}>
                            {c.title}
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.oasis, background: `${colors.oasis}12`, padding: "2px 7px", borderRadius: 3 }}>
                              {c.tag}
                            </span>
                            <span style={{ fontFamily: fonts.mono, fontSize: 13, color: `${colors.white}50` }}>
                              {c.sections} sections
                            </span>
                            <span style={{ fontFamily: fonts.mono, fontSize: 13, color: `${colors.white}50`, marginLeft: "auto" }}>
                              {c.assigned} assigned
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Config section — appears after case selected */}
                  <div style={{ marginTop: 12, opacity: configAppear, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ borderTop: `1px solid ${colors.white}10`, paddingTop: 10 }}>
                      <div style={{ fontFamily: fonts.mono, fontSize: 13, color: `${colors.white}60`, marginBottom: 4 }}>Due Date</div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 16, color: colors.white, background: `${colors.white}06`, padding: "8px 12px", borderRadius: 6 }}>
                        Mar 22, 2026
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 13, color: `${colors.white}60`, marginBottom: 4 }}>Students Selected</div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 28, fontWeight: 700, color: colors.oasis }}>
                        {Math.round(interpolate(frame, [330, 380], [0, 8], clamp))}
                      </div>
                    </div>
                  </div>

                  {/* Assign button — bottom of right panel */}
                  <div style={{ marginTop: "auto", paddingTop: 10 }}>
                    <div
                      style={{
                        fontFamily: fonts.heading, fontSize: 16, fontWeight: 700,
                        color: postAssign > 0.5 ? colors.vitalsNormal : colors.white,
                        background: postAssign > 0.5 ? `${colors.vitalsNormal}20` : colors.oasis,
                        padding: "10px 16px", borderRadius: 8, textAlign: "center" as const,
                        opacity: assignReady,
                        boxShadow: assignReady > 0.8 ? `0 0 16px ${colors.oasis}30` : "none",
                      }}
                    >
                      {postAssign > 0.5 ? "\u2713 8 Assignments Created" : "Assign to 8 Students"}
                    </div>
                  </div>
                </div>
              )}
            </GlassPanel>
          </div>

          {/* Success overlay flash */}
          {successFlash > 0 && (
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              pointerEvents: "none", zIndex: 20,
            }}>
              <div style={{
                fontFamily: fonts.heading, fontSize: 42, fontWeight: 700,
                color: colors.vitalsNormal, textShadow: `0 0 24px ${colors.vitalsNormal}50`,
                opacity: successFlash, letterSpacing: 1,
              }}>
                8 Assignments Created
              </div>
            </div>
          )}
        </div>
      )}
    </SceneShell>
  );
};
