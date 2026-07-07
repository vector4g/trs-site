import ReferenceArticle from "@/components/ReferenceArticle";
import MARKDOWN from "@/content/assistance-codes.md";

export default function AssistanceCodes() {
  return (
    <ReferenceArticle
      slug="assistance-codes"
      h1="What airline assistance codes disclose"
      titleTag="What Airline Assistance Codes Disclose: WCHR, WCHS, WCHC"
      description="Requesting assistance transmits a standardised disability category through the reservation ecosystem. Who sees an SSR code, why it is special category data, and what employers should not hold."
      canonical="https://thirdrailsystems.ee/assistance-codes"
      markdown={MARKDOWN}
      citeIntro="Cite individual answers by their stable anchor, e.g. "
      citeExample="thirdrailsystems.ee/assistance-codes#who-sees-an-assistance-code"
      citeTail=". Claims link to their entries in the Beyond Disclosure citation library. Verified July 2026."
      dateModified="2026-07-07"
      relatedLinks={[
        {
          to: "/medication-at-borders",
          label: "Prescription medication at borders →",
          testid: "assistance-link-medication-at-borders",
        },
      ]}
    />
  );
}
