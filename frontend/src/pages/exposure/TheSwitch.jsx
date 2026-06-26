/* eslint-disable react/no-unescaped-entities */
import { Link } from "react-router-dom";

import EssayLayout from "@/components/brief/EssayLayout";
import { BriefSection } from "@/components/brief";
import { useSEO, useJsonLd } from "@/lib/useSEO";
import { EXPOSURE2_READ_STORAGE_KEY } from "@/components/landing/shared";
import { essayRobots } from "@/lib/exposureSeries";

const CANONICAL = "https://thirdrailsystems.ee/writing/the-switch";

const TOC = [
  { id: "anatomy", label: "I. The Anatomy of a Sudden Disruption" },
  { id: "leverage", label: "II. The Architecture of Leverage" },
  { id: "europe-2031", label: "III. The Europe 2031 Rhyme" },
  { id: "geography", label: "IV. The Fallacy of Geographic Sovereignty" },
  { id: "estonia", label: "V. The Estonian Blueprint" },
  { id: "need-less", label: "VI. Need Less, Hold Less" },
];

export default function TheSwitch() {
  useSEO({
    title: "The Switch Someone Else Holds · Third Rail Systems",
    description:
      "When one government can disable a model worldwide overnight, dependency is the vulnerability. Why digital sovereignty is architectural, not geographic.",
    canonical: CANONICAL,
    robots: essayRobots("the-switch"),
  });
  useJsonLd(
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "The Switch Someone Else Holds",
      description:
        "A federal kill switch and slow platform enshittification are the same dynamic at different speeds. The defence is the same: need less, hold less.",
      author: {
        "@type": "Person",
        name: "Levi Hankins",
        url: "https://www.linkedin.com/in/levihankins",
        jobTitle: "Founder & CEO, Third Rail Systems OÜ",
      },
      publisher: {
        "@type": "Organization",
        name: "Third Rail Systems OÜ",
        url: "https://thirdrailsystems.ee/",
        logo: { "@type": "ImageObject", url: "https://thirdrailsystems.ee/og.png" },
      },
      datePublished: "2026-06-26",
      mainEntityOfPage: CANONICAL,
      image: "https://thirdrailsystems.ee/og.png",
      inLanguage: "en",
      isPartOf: {
        "@type": "CreativeWorkSeries",
        name: "Exposure",
        position: 2,
      },
      keywords:
        "digital sovereignty, Anthropic Claude, export control, enshittification, Cory Doctorow, Estonia Cybernetica, Europe 2031, platform risk",
    },
    "exposure2-article-jsonld",
  );
  useJsonLd(
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://thirdrailsystems.ee/" },
        { "@type": "ListItem", position: 2, name: "Writing", item: "https://thirdrailsystems.ee/writing" },
        { "@type": "ListItem", position: 3, name: "The Switch Someone Else Holds", item: CANONICAL },
      ],
    },
    "exposure2-breadcrumb-jsonld",
  );

  return (
    <EssayLayout
      canonical={CANONICAL}
      eyebrow="Exposure · Part Two"
      title="The Switch Someone Else Holds"
      lede="On 12 June 2026 a single federal directive disabled a frontier model worldwide overnight. The kill switch was the acute version of a much slower decay. The defence is the same for both."
      backLinks={[
        { to: "/writing/nothing-happened", label: "Part One · Nothing Happened" },
      ]}
      toc={TOC}
      eventKey="exposure2"
      readStorageKey={EXPOSURE2_READ_STORAGE_KEY}
      shareTitle="The Switch Someone Else Holds · Third Rail Systems"
      footerCta={{
        to: "/writing/exposure-is-not-democratic",
        label: "Part Three · Exposure Is Not Democratic",
        description:
          "The same structural exposure, applied to people rather than companies, is measured in something far graver and far less evenly distributed. The capstone.",
      }}
    >
      <BriefSection id="anatomy" number="I." title="The Anatomy of a Sudden Disruption">
        <p>
          The modern digital economy runs on a persistent illusion of stability.
          Organisations build intricate, automated workflows on the assumption
          that the tools they depend on will stay available, governed by ordinary
          market forces. On 12 June 2026, at 5:21 PM Eastern Time, I watched that
          illusion get dismantled. I did not watch it as a neutral observer. I
          build on the opposite principle, distributed, minimum-dependency
          architecture, so I recognised the cutoff at once: it was the failure
          mode I had spent my work trying to design out.
        </p>
        <p>
          This was not a voluntary safety pause or a scheduled maintenance window.
          It was a federal export-control directive from the United States
          government. By targeting "foreign nationals", a categorisation so broad
          it barred even Anthropic's own international employees, the directive
          forced an immediate global shutdown of the Claude Fable 5 and Mythos 5
          models. The trigger was an alleged method of bypassing the safeguards
          in Fable 5. Anthropic disagreed with the proportionality of the
          response, arguing the demonstrated vulnerabilities were narrow,
          non-universal, and similar to flaws already discoverable in other
          publicly available models. The legal reality held regardless: because
          the directive covered all foreign nationals worldwide, disabling the
          models entirely was the only way to comply.
        </p>
        <p>
          A crowded, partisan debate ignited at once across European policy
          circles. Many treated the cutoff as a sovereignty outrage, a
          geopolitical weapon aimed at foreign innovation. Yet experts in
          international and data protection law have pointed out that the anger
          may be running ahead of the facts: the foreign-only scope was likely an
          artefact of the only legal tool available for a rapid freeze, not a
          targeted strike against allies.
        </p>
        <p>
          But the motive does not matter. Whether the directive was a deliberate
          weapon or the blunt application of a domestic security law, the
          architectural result was identical. Workflows halted. The mechanism
          existed, and it was used. The fact that the switch can be pulled, for
          any reason, is what reveals the structural flaw.
        </p>
        <p>
          When an enterprise adopts an advanced capability, it reorganises around
          it. The engineers stop performing the core task and start managing the
          model's outputs. When the model is switched off by a single directive,
          the enterprise does not just lose a tool; it loses operational
          capacity, because the human architecture has already been dismantled to
          accommodate the machine. That is the danger of a switch someone else
          holds.
        </p>
      </BriefSection>

      <BriefSection id="leverage" number="II." title="The Architecture of Leverage">
        <p>
          The sudden cutoff is the acute version of a much slower decay, the
          pattern the writer Cory Doctorow calls "enshittification". It runs in
          three phases. First, the bait: a platform floods users with value, free
          services, steep discounts, directing all its surplus toward winning a
          base. Then lock-in: once a critical mass has settled in, the platform
          makes leaving prohibitive through proprietary formats, cultivated
          habits, and deep integration into business workflows, and pivots to
          court suppliers with favourable terms before locking them in too.
          Finally, extraction: with users and suppliers unable to migrate without
          heavy cost, the platform degrades its own service to claw value back
          for shareholders, replacing organic results with paid placements and
          restricting access.
        </p>
        <p>
          Doctorow names a second pattern that compounds this: the "reverse
          centaur". A centaur is a human augmented by a machine. A reverse
          centaur is a human reorganised to serve the machine, reduced to an
          appendage of a workflow it no longer controls, often there only to
          absorb blame when the automated system fails. Either way, the business
          no longer controls its own destiny.
        </p>
        <p>
          The export directive and slow platform decay are the same dynamic at
          different speeds. Degradation extracts value through a slow tightening
          of terms; the kill switch extracts immediate compliance. Both draw
          their power from one structural flaw: the concentration of reliance.
          When a technology becomes critical infrastructure for millions of
          businesses, control over access becomes a lever, and the leverage
          someone holds is exactly proportional to how much you depend on them.
          The defence against both the slow squeeze and the sudden shock is the
          same. A workflow distributed across several providers, leaning only
          lightly on any single proprietary node, cannot be quietly degraded for
          profit or neutralised by one directive.
        </p>
      </BriefSection>

      <BriefSection id="europe-2031" number="III." title="The Europe 2031 Rhyme">
        <p>
          Before the directive proved the fragility of foreign dependencies,
          strategic foresight researchers had already warned of it. The Europe
          2031 report, by a coalition of European technology and policy experts
          (Daan Juijn, Stan van Baarsen, Judith Dada, Lily Stelling, Philip Fox,
          Alex Petropoulos, and Michiel Bakker, with editing by Tom Chivers)
          projected Europe's slide into irrelevance through dependency on
          foreign-controlled chokepoints, dramatised through the eyes of a policy
          worker and climaxing in a Washington negotiation over control of ASML,
          the sole maker of the lithography equipment needed to print
          cutting-edge chips. The report published essentially as the export
          directive hit, making its warning real faster than its authors
          imagined. Renting access to a frontier model gives the renter no power
          to keep that model from being disabled by a single regulatory stroke.
          The dependency was always the vulnerability.
        </p>
      </BriefSection>

      <BriefSection id="geography" number="IV." title="The Fallacy of Geographic Sovereignty">
        <p>
          This forces a re-evaluation of what sovereignty means. Policy debate
          has been overwhelmingly geographic, fixated on where the servers
          physically sit. But the location of a server rack offers little
          protection if the software on it is controlled by an entity subject to
          sudden legal injunctions. A border does not stop a kill switch. And
          the opposite reflex, demanding isolation on the argument that regions
          are "better off without" foreign models, is one-sided disarmament: it
          is not sovereignty, it is forced technological regression.
        </p>
        <p>
          Real control is architectural, not geographic. Digital sovereignty is
          the operational ability to understand, secure, modify, and replace
          your own systems, and to govern what you depend on. If a critical
          workflow is anchored to a single proprietary model, disabling that
          model collapses the workflow. But if the workflow is built on
          interoperability, with an abstraction layer that routes requests
          across providers by real-time availability, a single directive can
          turn off a specific model and still not turn off the system. The same
          logic answers enshittification: keep the functional ability to exit a
          degraded platform without destroying the business.
        </p>
      </BriefSection>

      <BriefSection id="estonia" number="V." title="The Estonian Blueprint">
        <p>
          The constructive model is not in the big tech hubs but in Estonia. One
          of the most digitised states in the world, its e-governance rests on
          traditional cryptography that a sufficiently capable quantum computer
          could break, exposing decades of confidential state data through
          "harvest now, decrypt later" attacks. Rather than wait for foreign
          giants to patch this, Estonia treated post-quantum resilience as an
          immediate national-security matter and contracted Cybernetica, a
          domestic firm in Tallinn and Tartu, to lead the transition.
        </p>
        <p>
          Cybernetica is a study in architectural sovereignty. It keeps a slight
          majority of its staff, 51 percent, in the university town of Tartu,
          cultivating in-house mathematical depth. As its research director Dan
          Bogdanov notes, Estonia is unusual in how much of its core technology
          it builds from the ground up rather than consuming from hyperscalers;
          a German professor once called it the land of "exotic, gourmet
          cryptography". The work spans a national post-quantum roadmap, the
          quantum-proofing of the Population Register, and ongoing research to
          keep the underlying mathematics native rather than outsourced. The
          result is a state that can audit, modify, and replace its own
          cryptographic foundations without waiting for permission or an API
          update from a foreign provider. That is what it means to govern what
          you depend on.
        </p>
      </BriefSection>

      <BriefSection id="need-less" number="VI." title="Need Less, Hold Less">
        <p>
          The lever may be pulled slowly, over years, by a board chasing higher
          revenues, or instantly, by a security apparatus enforcing a mandate.
          The result is the same: the capacity to operate independently is lost.
          The durable defence is disciplined subtraction. We reduce the leverage
          someone holds by reducing what we depend on, building on interoperable
          standards, distributing across interchangeable providers, and keeping
          a real exit. Sovereignty proves itself by needing less, not by
          isolating more.
        </p>
        <p>
          And note what this analysis has quietly assumed: that the cost of a
          pulled switch is measured in halted workflows and lost productivity.
          For an enterprise, it is. But the same structural exposure, applied to
          people rather than companies, is measured in something far graver and
          far less evenly distributed. That is{" "}
          <Link
            to="/writing/exposure-is-not-democratic"
            className="text-cyan-400 underline decoration-cyan-500/40 underline-offset-4 hover:text-cyan-300 hover:decoration-cyan-300"
          >
            a subject for its own reckoning
          </Link>
          . For now it is enough to see the architecture clearly: the switch,
          whoever holds it and for whatever reason, has power only over what we
          have made ourselves unable to live without.
        </p>
      </BriefSection>
    </EssayLayout>
  );
}
