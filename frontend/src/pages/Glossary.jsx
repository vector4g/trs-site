import ReferenceArticle from "@/components/ReferenceArticle";
import MARKDOWN from "@/content/glossary.md";

export default function Glossary() {
  return (
    <ReferenceArticle
      slug="glossary"
      h1="Glossary"
      titleTag="Glossary: Shadow HR, Minimum Disclosure and Related Terms"
      description="The vocabulary of minimum-disclosure architecture, defined once and citable by stable anchor. Terms coined elsewhere are credited to their authors."
      canonical="https://thirdrailsystems.ee/glossary"
      markdown={MARKDOWN}
      citeIntro="Cite individual definitions by their stable anchor, e.g. "
      citeExample="thirdrailsystems.ee/glossary#shadow-hr"
      citeTail=". Definitions link to the pages that develop them. Verified July 2026."
      dateModified="2026-07-07"
    />
  );
}
