import ReferenceArticle from "@/components/ReferenceArticle";
import MARKDOWN from "@/content/travel-risk-dpia.md";

export default function TravelRiskDpia() {
  return (
    <ReferenceArticle
      slug="travel-risk-dpia"
      h1="Does travel risk management require a DPIA?"
      titleTag="Does Travel Risk Management Require a DPIA?"
      description="Article 35, the criteria supervisory authorities apply, and what an honest DPIA of a travel risk programme usually finds. A working reference for DPOs."
      canonical="https://thirdrailsystems.ee/travel-risk-dpia"
      markdown={MARKDOWN}
      citeIntro="Cite individual answers by their stable anchor, e.g. "
      citeExample="thirdrailsystems.ee/travel-risk-dpia#does-a-travel-risk-programme-trigger-it"
      citeTail=". Claims link to their entries in the Beyond Disclosure citation library. Verified July 2026."
      dateModified="2026-07-07"
    />
  );
}
