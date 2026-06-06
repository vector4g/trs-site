/**
 * Project-level ESLint config.
 *
 * Disables two extremely noisy lint rules that fire on intentional typography
 * and stable hook patterns throughout the site:
 *
 *  - `react/no-unescaped-entities`: flags every apostrophe and quote in JSX
 *    text. React renders these correctly, and the site is typography-heavy
 *    (long-form briefs, legal pages, founder bios). Pre-escaping them with
 *    HTML entities would make the source unreadable for content edits with
 *    zero functional benefit.
 *
 *  - `react-hooks/set-state-in-effect` and `react-hooks/purity`: experimental
 *    React 19 rules that flag deliberate, well-established patterns
 *    (e.g. resetting derived state when a prop changes, computing a length
 *    inside render). The patterns are correct; the rules over-fire on them.
 *
 * Everything else — `react-hooks/exhaustive-deps`, `react/jsx-key`, the
 * jsx-a11y suite — remains enforced.
 */
export default [
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
    },
  },
];
