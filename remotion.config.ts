/**
 * Remotion CLI configuration (Studio, render, bundle).
 * @see https://www.remotion.dev/docs/config
 * @see https://www.remotion.dev/docs/api — API overview & package index
 */
import { Config } from "@remotion/cli/config";

// Single source of truth for entry — CLI no longer needs `src/index.ts` on every command
Config.setEntryPoint("./src/index.ts");

// Optional: bump if renders are slow and machine has headroom (default is fine for most)
// Config.setConcurrency(8);
