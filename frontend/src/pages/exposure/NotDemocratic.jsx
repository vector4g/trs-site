/* eslint-disable react/no-unescaped-entities */
import { Link } from "react-router-dom";

import EssayLayout from "@/components/brief/EssayLayout";
import { BriefSection } from "@/components/brief";
import { useSEO, useJsonLd } from "@/lib/useSEO";
import { EXPOSURE3_READ_STORAGE_KEY } from "@/components/landing/shared";

const CANONICAL =
  "https://thirdrailsystems.ee/writing/exposure-is-not-democratic";

const EXPOSURE_CHECK_URL = "https://check.thirdrailsystems.ee";

const TOC = [
  { id: "engine", label: "I. Distancing Through Abstraction" },
  { id: "border", label: "II. The Border" },
  { id: "physical", label: "III. The Physical Space" },
  { id: "database", label: "IV. The Database Weaponised" },
  { id: "paradox", label: "V. The Duty-of-Care Paradox" },
  { id: "resolution", label: "VI. Resolution Through Design Justice" },
];

export default function NotDemocratic() {
  useSEO({
    title: "Exposure Is Not Democratic · Third Rail Systems",
    description:
      "Collected data lands hardest on the most exposed. How duty of care under ISO 31030 collides with GDPR Article 9, and why minimum disclosure is the resolution.",
    canonical: CANONICAL,
  });
  useJsonLd(
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Exposure Is Not Democratic: The Price of Being Legible",
      description:
        "Collected data lands hardest on the most exposed. Duty of care under ISO 31030 collides with GDPR Article 9. Minimum disclosure is the resolution.",
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
      datePublished: "2026-06-08",
      mainEntityOfPage: CANONICAL,
      image: "https://thirdrailsystems.ee/og.png",
      inLanguage: "en",
      isPartOf: {
        "@type": "CreativeWorkSeries",
        name: "Exposure",
        position: 3,
      },
      keywords:
        "ISO 31030, GDPR Article 9, duty of care, design justice, data minimisation, minimum disclosure, surveillance, marginalised employees",
    },
    "exposure3-article-jsonld",
  );
  useJsonLd(
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://thirdrailsystems.ee/" },
        { "@type": "ListItem", position: 2, name: "Writing", item: "https://thirdrailsystems.ee/writing" },
        { "@type": "ListItem", position: 3, name: "Exposure Is Not Democratic", item: CANONICAL },
      ],
    },
    "exposure3-breadcrumb-jsonld",
  );

  return (
    <EssayLayout
      canonical={CANONICAL}
      eyebrow="Exposure · Part Three"
      title="Exposure Is Not Democratic"
      lede="The price of being legible. Dependency and accumulation are two forms of the same thing: exposure. The durable defence against both is the same move: need less, hold less."
      backLinks={[
        { to: "/writing/nothing-happened", label: "Part One · Nothing Happened" },
        { to: "/writing/the-switch", label: "Part Two · The Switch" },
      ]}
      toc={TOC}
      eventKey="exposure3"
      readStorageKey={EXPOSURE3_READ_STORAGE_KEY}
      shareTitle="Exposure Is Not Democratic · Third Rail Systems"
      footerCta={null}
    >
      <div className="mt-12 space-y-6 text-[15px] leading-relaxed text-slate-300 sm:text-base">
        <p>
          Dependency and accumulation are two forms of the same thing:
          exposure. Whatever we depend on, or hold onto, today becomes the
          leverage someone holds over us tomorrow. The durable defence against
          both is the same move: need less, hold less. When there is less
          dependency, there is less to switch off. When there is less
          accumulation, there is less to harvest.
        </p>
        <p>
          But exposure is not distributed evenly. When leverage is used, the
          cost lands hardest on the people at the intersections. A harvested
          attribute that is a mere abstraction for a majority-identity person
          is a tangible danger to someone whose identity is criminalised,
          surveilled, or punished. Resilience through minimum disclosure is
          therefore not only a technical or durability argument. It is a
          justice argument. Collecting less protects everyone, and it protects
          the most exposed most.
        </p>
        <p className="text-xl italic leading-snug text-white sm:text-2xl">
          To say that the power is in the margins and that the safest data is
          the data you never collected is to say the exact same sentence.
        </p>
      </div>

      <BriefSection id="engine" number="I." title="The Conceptual Engine: Distancing Through Abstraction">
        <p>
          Why is it so easy for systemic architecture to harm people at the
          margins? The mechanism relies on distancing through abstraction.
        </p>
        <p>
          Rendering a person as data strips away the individual, accountable
          humanity that naturally restrains harm. It replaces the human being
          with a category, a flag, an attribute, or a database entry. People
          are vastly easier to harm as categories than as persons. In this
          way, the database acts like a mask. It does the dehumanising in
          advance.
        </p>
        <p>
          Minimum disclosure is the refusal to pre-abstract people into a
          harm-able form. We keep people human by keeping them un-collected.
          When we fail to do this, the collected attribute invariably becomes
          leverage.
        </p>
      </BriefSection>

      <BriefSection id="border" number="II." title="The Border: Neurodivergence and the Law">
        <p>
          Consider how the simple act of carrying prescribed medication
          changes radically based on jurisdiction. For neurodivergent
          individuals relying on ADHD medication, standard medical care in one
          country becomes a severe criminal offence in another.
        </p>
        <p>
          Medications containing amphetamine or methylphenidate, such as
          Adderall or Ritalin, are strictly controlled or entirely banned in
          nations like Japan and the United Arab Emirates. In February 2015,
          Carrie Russell, a 26-year-old from Oregon, was detained for eighteen
          days in Japan after her prescribed Adderall was shipped to her
          there. In the UAE, travelling with undeclared amphetamine-based
          medication can lead to imprisonment and mandatory deportation. The
          system is so rigidly enforced that authorities have imprisoned
          individuals simply for testing positive for restricted medicines in
          their urine, meaning the trace metabolite in the body is itself an
          incriminating attribute.
        </p>
        <p>
          To travel legally, an individual must frequently disclose their
          neurodivergence to border and health authorities, exposing
          themselves to scrutiny, potential detention, or severe legal
          penalties if the paperwork is deemed insufficient. The collected
          attribute, a medical prescription meant to aid the individual, is
          transformed by the state into a criminal liability.
        </p>
      </BriefSection>

      <BriefSection id="physical" number="III." title='The Physical Space: Disability and the "Fire Hazard"'>
        <p>
          The danger of legibility also extends to physical space, where an
          assistive device is documented and flagged as a risk to the
          majority.
        </p>
        <p>
          In July 2024, the US Department of Justice reached a settlement with
          Good Times Restaurants Inc. regarding an incident at a Bad Daddy's
          Burger Bar in Murfreesboro, Tennessee. Staff excluded a visiting
          youth wheelchair basketball team and their families, in town for a
          tournament, allegedly claiming the group of wheelchairs presented a
          "fire hazard".
        </p>
        <p>
          This is not an isolated phenomenon. It is the systemic translation
          of a physical reality into a bureaucratic risk category. When a
          disabled person is flagged as a safety hazard or an evacuation risk,
          their visibility is weaponised against their fundamental right to
          exist in public spaces. The system uses their legibility to justify
          their exclusion.
        </p>
      </BriefSection>

      <BriefSection id="database" number="IV." title="The Database Weaponised: LGBTQ+ Legibility">
        <p>
          The most severe costs of legibility are paid when state actors
          weaponise data against criminalised identities.
        </p>
        <p>
          I understand this mechanism not just as a theory, but as a lived
          reality. The uneventful New Year's Eve I have written about{" "}
          <Link
            to="/writing/nothing-happened"
            className="text-cyan-400 underline decoration-cyan-500/40 underline-offset-4 hover:text-cyan-300 hover:decoration-cyan-300"
          >
            elsewhere
          </Link>
          , heading into the year 2000, I spent at the Badlands nightclub in
          Washington D.C. What I did not know at the time is that the venue
          was under active, covert surveillance. In June 2000, it was revealed
          that the Naval Criminal Investigative Service had run a multi-year
          undercover operation targeting several local venues, including
          Badlands. Officially, the military framed this as a drug enforcement
          operation. However, advocacy groups like the Servicemembers Legal
          Defense Network credibly criticised the sting as a workaround for
          the "Don't Ask, Don't Tell" policy, designed to identify and
          discharge gay service members. A number of service members faced
          charges or discharge. Simply being present in a specific space, if
          recorded and tracked, was an attribute that could destroy a career.
        </p>
        <p>
          The digital age has scaled this mechanism of entrapment to
          terrifying proportions. In Egypt, under broad "debauchery" laws (Law
          10/1961), authorities routinely use digital platforms to monitor and
          entrap LGBTQ individuals. Human Rights Watch has documented how
          undercover police use fake profiles on applications like Grindr,
          Facebook, and WhosHere to lure people into meetings, followed by
          arbitrary arrests and forced device searches.
        </p>
        <p>
          In Chechnya, the mechanism of extraction reached a horrific
          endpoint. During the anti-gay purges that began in the spring of
          2017, the authorities did not just arrest individuals. According to
          extensive documentation by Human Rights Watch, security forces
          tortured detained men to force them to hand over the contacts of
          other men from their mobile phones. The contact list, a basic
          feature of digital life, became the load-bearing mechanism to scale
          the hunt. Captors forced victims to call their acquaintances to lure
          them into traps, and families were summoned and encouraged to
          commit honour killings. The dataset was not just breached. It was
          actively weaponised to dismantle a hidden community.
        </p>
      </BriefSection>

      <BriefSection id="paradox" number="V." title="The Duty-of-Care Paradox">
        <p>
          There is an immense moral distance between a state torture facility
          and a corporate compliance database. To flatten them would be an
          insult to the survivors of the former. But while the gravity of the
          harm is vastly unequal, the underlying architecture of vulnerability
          is exactly the same.
        </p>
        <p>
          In the corporate world, this manifests as the duty-of-care paradox.
          Under the{" "}
          <Link
            to="/catch-22"
            className="text-cyan-400 underline decoration-cyan-500/40 underline-offset-4 hover:text-cyan-300 hover:decoration-cyan-300"
          >
            ISO 31030 standard for travel risk management
          </Link>
          , organisations are guided to assess risks across three distinct
          phases: preparation before travel, support during travel, and care
          after the traveller returns. To prepare adequately, companies often
          feel they must collect highly sensitive data about their employees,
          such as medical requirements or sexual orientation, to ensure they
          are not sent to hostile jurisdictions. In the European Union, the
          General Data Protection Regulation classifies this as Article 9
          special category data.
        </p>
        <p>
          To protect a vulnerable employee, an organisation collects their
          most dangerous attributes. By doing so, it creates the exact
          database that endangers the employee if it is breached, intercepted,
          or legally compelled by a hostile state. The intent to protect is
          entirely nullified by the method of collection.
        </p>
      </BriefSection>

      <BriefSection id="resolution" number="VI." title="Resolution Through Design Justice">
        <p>
          How do we break this cycle? We must turn to the principles of
          design justice, as articulated by scholars like Sasha
          Costanza-Chock.
        </p>
        <p>
          When systems are designed predominantly by those occupying majority
          identities, they inherently create a "privilege hazard". This term,
          defined by researchers Catherine D'Ignazio and Lauren Klein in their
          work on data feminism, describes the failure to recognise oppression
          because the designer does not personally face the risk. Furthermore,
          Shoshana Zuboff's warnings on surveillance capitalism and Safiya
          Noble's insights on how algorithmic optimisation perpetuates
          structural discrimination remind us that massive data collection
          fundamentally imbalances power.
        </p>
        <p>
          The operational resolution to this imbalance is strict data
          minimisation. Legally mandated under GDPR Article 5(1)(c) (which
          requires data to be adequate, relevant, and limited to what is
          necessary) and enforced as data protection by design under Article
          25, minimisation is not just a regulatory compliance checkbox. It is
          a foundational ethical necessity.
        </p>
        <p>
          By refusing to collect the data, we refuse to build the weapon.
          Minimum disclosure ensures that we do not pre-abstract vulnerable
          people into targets. Systems that protect the most exposed
          individuals inherently protect everyone.
        </p>
        <p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          <a
            href={EXPOSURE_CHECK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-cyan-500/40 underline-offset-8 hover:decoration-cyan-300"
          >
            The safest data is the data we never collect.
          </a>
        </p>
        <p className="mt-10 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-6 text-base leading-relaxed text-slate-200">
          If this describes your organisation's exposure, the architectural
          fix is closer than the policy debate suggests. We do confidential
          60-minute diagnostics under NDA, with no HRIS integration required.{" "}
          <Link
            to="/diagnostic"
            className="font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Request a diagnostic →
          </Link>
        </p>
      </BriefSection>
    </EssayLayout>
  );
}
