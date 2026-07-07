import ReferenceArticle from "@/components/ReferenceArticle";
import MARKDOWN from "@/content/medication-at-borders.md";

export default function MedicationAtBorders() {
  return (
    <ReferenceArticle
      slug="medication-at-borders"
      h1="Prescription medication at borders: the employer problem"
      titleTag="Prescription Medication at Borders: The Employer Problem"
      description="Lawful prescriptions are controlled substances in some jurisdictions. Why medication is a travel risk, why asking about it is an Article 9 problem, and the architecture that resolves both."
      canonical="https://thirdrailsystems.ee/medication-at-borders"
      markdown={MARKDOWN}
      citeIntro="Cite individual answers by their stable anchor, e.g. "
      citeExample="thirdrailsystems.ee/medication-at-borders#why-is-medication-a-border-risk"
      citeTail=". Claims link to their entries in the Beyond Disclosure citation library. Verified July 2026."
      dateModified="2026-07-07"
      relatedLinks={[
        {
          to: "/assistance-codes",
          label: "What airline assistance codes disclose →",
          testid: "medication-link-assistance-codes",
        },
      ]}
    />
  );
}
