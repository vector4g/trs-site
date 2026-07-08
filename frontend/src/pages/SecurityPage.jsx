import ReferenceArticle from "@/components/ReferenceArticle";
import MARKDOWN from "@/content/security.md";

export default function SecurityPage() {
  return (
    <ReferenceArticle
      slug="security"
      h1="Security and data handling"
      titleTag="Security and Data Handling · Third Rail Systems"
      description="How Third Rail Systems secures its site and platform, what we retain and what we refuse to, and how to reach us about a vulnerability. Every claim verifiable."
      canonical="https://thirdrailsystems.ee/security"
      markdown={MARKDOWN}
      citeIntro="Cite individual sections by their stable anchor, e.g. "
      citeExample="thirdrailsystems.ee/security#what-we-retain"
      citeTail=". Statements on this page are checkable from your own browser or the linked artefact. Verified July 2026."
      dateModified="2026-07-08"
    />
  );
}
