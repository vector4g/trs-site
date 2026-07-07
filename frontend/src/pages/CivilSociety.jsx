import ReferenceArticle from "@/components/ReferenceArticle";
import raw from "@/content/civil-society.md";

// The final paragraph of the markdown source is the pilot-pricing line,
// which the spec places AFTER the diagnostic CTA. Split it off here; the
// prerendered shell renders the markdown in source order (no CTA in the
// shell), so the line correctly closes the body there.
const splitAt = raw.trimEnd().lastIndexOf("\n\n");
const MARKDOWN = raw.trimEnd().slice(0, splitAt).trimEnd();
const TRAILING_LINE = raw.trimEnd().slice(splitAt).trim();

export default function CivilSociety() {
  return (
    <ReferenceArticle
      slug="civil-society"
      h1="Duty of care for human rights defenders: the file problem"
      titleTag="Duty of Care for Human Rights Defenders: The File Problem"
      description="Monitoring and evacuation protect people in the field. Almost nothing protects them from the file built to qualify them for protection. A reference for casework and security leads."
      canonical="https://thirdrailsystems.ee/civil-society"
      markdown={MARKDOWN}
      citeIntro="Cite individual answers by their stable anchor, e.g. "
      citeExample="thirdrailsystems.ee/civil-society#who-holds-the-file-after-placement"
      citeTail=". Claims on this page link to their entries in the Beyond Disclosure citation library. Verified July 2026."
      trailingLine={TRAILING_LINE}
      dateModified="2026-07-07"
    />
  );
}
