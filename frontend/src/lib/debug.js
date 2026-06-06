/**
 * Dev-only debug logger. No-op in production builds.
 *
 * Use `devLog(label, ...args)` instead of `console.debug(...)` inside
 * silent-fallback catch blocks so:
 *   - production console stays clean,
 *   - developers still see swallowed errors in the browser devtools when
 *     `NODE_ENV !== "production"` (CRA dev server, local pytest playwright
 *     runs, the Emergent preview environment).
 *
 * The check is hoisted to a module constant so it's tree-shaken in
 * production bundles.
 */
const IS_DEV = process.env.NODE_ENV !== "production";

export function devLog(...args) {
  if (!IS_DEV) return;
  console.debug(...args);
}
