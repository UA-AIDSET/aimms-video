/**
 * UA Brand Colors & Theme for AIMMS Video
 */
import { loadFont as loadPlusJakartaSans } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

// Load fonts with specific weights
const heading = loadPlusJakartaSans("normal", {
  weights: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

const body = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const mono = loadJetBrainsMono("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
});

export const colors = {
  arizonaRed: "#AB0520",
  arizonaBlue: "#0C234B",
  midnight: "#001C48",
  azurite: "#1E5288",
  oasis: "#378DBD",
  chili: "#8B0015",
  white: "#FFFFFF",
  warmGray: "#F4EDE5",
  coolGray: "#E2E9EB",
  slate50: "#F8FAFC",
  slate100: "#F1F5F9",
  slate200: "#E2E8F0",
  slate600: "#475569",
  slate800: "#1E293B",
  ecgGreen: "#39FF14",
  vitalsNormal: "#4CAF50",
  vitalsWarning: "#FF9800",
  vitalsCritical: "#F44336",
};

export const fonts = {
  heading: heading.fontFamily,
  body: body.fontFamily,
  mono: mono.fontFamily,
};
