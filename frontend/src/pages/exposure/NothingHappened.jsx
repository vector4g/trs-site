/* eslint-disable react/no-unescaped-entities */
import { Link } from "react-router-dom";

import EssayLayout from "@/components/brief/EssayLayout";
import { useSEO, useJsonLd } from "@/lib/useSEO";
import { EXPOSURE1_READ_STORAGE_KEY } from "@/components/landing/shared";
import { essayRobots } from "@/lib/exposureSeries";

const CANONICAL = "https://thirdrailsystems.ee/writing/nothing-happened";

// Exposure Check tool — surfaces "the safest data is the data we never
// collect" as a working demonstration of the principle.
const EXPOSURE_CHECK_URL = "https://check.thirdrailsystems.ee";

export default function NothingHappened() {
  useSEO({
    title: "Nothing Happened, and That Was the Point · Third Rail Systems",
    description:
      "Y2K was a fix delivered on time, so the disaster never came. The durable answer to exposure is the same: collect less in the first place.",
    canonical: CANONICAL,
    robots: essayRobots("nothing-happened"),
  });
  useJsonLd(
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Nothing Happened, and That Was the Point",
      description:
        "Y2K was a fix delivered on time. Harvest-now-decrypt-later puts encryption in the same shape of problem. The durable answer is collecting less.",
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
        position: 1,
      },
      keywords:
        "Y2K, post-quantum cryptography, harvest now decrypt later, data minimisation, digital sovereignty, Estonia",
    },
    "exposure1-article-jsonld",
  );
  useJsonLd(
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://thirdrailsystems.ee/" },
        { "@type": "ListItem", position: 2, name: "Writing", item: "https://thirdrailsystems.ee/writing" },
        { "@type": "ListItem", position: 3, name: "Nothing Happened", item: CANONICAL },
      ],
    },
    "exposure1-breadcrumb-jsonld",
  );

  return (
    <EssayLayout
      canonical={CANONICAL}
      eyebrow="Exposure · Part One"
      title="Nothing happened, and that was the point"
      lede={null}
      backLinks={[]}
      toc={[]}
      eventKey="exposure1"
      readStorageKey={EXPOSURE1_READ_STORAGE_KEY}
      shareTitle="Nothing Happened, and That Was the Point · Third Rail Systems"
      footerCta={{
        to: "/writing/the-switch",
        label: "Part Two · The Switch Someone Else Holds",
        description:
          "When one government can disable a model worldwide overnight, dependency itself is the vulnerability. The platform-lens companion to this essay.",
      }}
    >
      <div className="mt-12 space-y-6 text-[15px] leading-relaxed text-slate-300 sm:text-base">
        <p>
          Going into midnight on 1 January 2000, my partner, our friends and I
          skipped the big celebration on the National Mall in Washington, DC.
          Part of it was simple: it was one enormous crowd with limited ways
          out, and I have never liked being somewhere I could not get out of
          if everything went wrong. But there was a quieter reason. I was a
          sailor then, serving under Don't Ask, Don't Tell. The man I was with
          had been processed out of the service six months earlier under that
          same policy, for being gay. I was still living inside the exposure;
          he was the proof of what it cost. So we went to Badlands instead, a
          club that was ours, got there early, and had a completely uneventful
          night.
        </p>
        <p>
          Which turned out to be the story of Y2K everywhere. Nothing
          happened. And the way most people remember that nothing is exactly
          backwards, in a way that is about to cost us.
        </p>
        <p>
          The popular memory is that Y2K was a panic that fizzled. A media
          apocalypse, a lot of consultants getting rich, and then the date
          passed and nothing broke. The lesson most people took away is that
          technologists cry wolf.
        </p>
        <p>
          That reading is backwards, and it is worth correcting now, because
          we are walking into the same shape of problem again.
        </p>
        <p>
          The millennium bug was real. For decades, to save scarce and
          expensive memory, systems stored years as two digits and assumed the
          "19" in front. The flaw sat dormant inside critical infrastructure,
          harmless, until a specific date threatened to activate it everywhere
          at once. The reason almost nothing broke on 1 January 2000 is not
          that the threat was imaginary. It is that the world spent years and
          a great deal of money doing the tedious, unglamorous work of finding
          and fixing it first. The non-event was the achievement. We
          engineered a quiet midnight on purpose.
        </p>
        <p>
          Quantum decryption has the same architecture. A dormant flaw, a
          future trigger, and expensive remediation that has to happen before
          the trigger arrives, paid for by people who would rather not touch
          systems that currently work fine.
        </p>
        <p>
          The flaw is this. Most of what protects data today rests on
          mathematical problems that are easy to set and very hard to reverse,
          at least for classical computers. A sufficiently capable quantum
          computer changes that. And the threat does not wait for the machine
          to exist. It is already operating, under a model called "harvest
          now, decrypt later": adversaries copy encrypted data today, store
          it, and wait. They are aggressively targeting data with multi-decade
          confidentiality lifespans, such as classified intelligence, genomic
          databases, and long-term financial records, because the value of
          that information mathematically outlives the algorithms currently
          protecting it. The day decryption becomes feasible, years of
          harvested traffic becomes readable at once. The breach already
          happened. The decryption is just the delayed detonation.
        </p>
        <p>
          This is where the Y2K analogy stops being reassuring. Y2K had a
          fixed, known deadline, and the fix was forward-looking: patch the
          system before midnight and the data stays safe. The quantum timeline
          is a moving, debated target, somewhere across the next decade, and
          the remediation runs in reverse. Data already harvested is already
          lost the day the capability arrives. You cannot retroactively
          re-encrypt a copy sitting on someone else's server. The clock
          started before the alarm was rung, and it keeps running for every
          sensitive thing in transit right now.
        </p>
        <p>
          So the stakes do not arrive in one dramatic moment. They compound,
          quietly, every day.
        </p>
        <p>
          The standard response is a cryptographic arms race: migrate the
          whole world to post-quantum algorithms before the trigger. This is
          necessary, and it is genuinely hard. The new algorithms are not
          drop-in replacements. They carry larger keys and heavier signatures,
          they strain constrained systems, and most organisations do not even
          have a full map of where cryptography lives in their own
          infrastructure. It will take years, and it has to be done.
        </p>
        <p>
          But here is the option the Y2K engineers never had. They could only
          fix the systems they had. They could not choose to not have the
          flaw.
        </p>
        <p className="text-xl font-semibold text-white">We can.</p>
        <p>
          Data that was never collected has no time bomb in it.{" "}
          <a
            href={EXPOSURE_CHECK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 underline decoration-cyan-500/40 underline-offset-4 hover:text-cyan-300 hover:decoration-cyan-300"
          >
            The safest ciphertext is the one that was never created
          </a>
          . An adversary with a mature quantum computer cannot decrypt a file
          that does not exist, and cannot mine behavioural intelligence from a
          system built not to log it in the first place.
        </p>
        <p>
          It is the same instinct that kept me out of a crowd with no easy way
          out on the last night of 1999. You do not have to predict whether
          the bad case comes. You can decline to be standing in it. I learned
          that the hard way, long before I built anything: when the wrong fact
          about you can be collected and used against you, the safest position
          is the one where the fact was never there to find. That was survival
          once. It turns out to be architecture now. For two decades the
          default has been to collect everything, on the assumption that data
          is always an asset. Harvest now, decrypt later turns a large share
          of that stored data from an asset into a dated liability.
        </p>
        <p>
          Which reframes{" "}
          <Link
            to="/catch-22"
            className="text-cyan-400 underline decoration-cyan-500/40 underline-offset-4 hover:text-cyan-300 hover:decoration-cyan-300"
          >
            data minimisation
          </Link>{" "}
          entirely. It stops being a compliance cost or a privacy nicety and
          becomes a durability strategy. It is the one posture that gets
          stronger over time rather than weaker, because it does not depend on
          staying ahead in a race. For the data you decline to collect, you
          have simply opted out of the harvesting model.
        </p>
        <p>
          This is also, quietly, the sharper version of the digital-sovereignty
          argument Europe keeps having. Estonia is already treating the
          post-quantum transition as urgent rather than theoretical, because a
          digital state has the most to lose if its encryption has an expiry
          date. They are actively quantum-proofing their national Population
          Register precisely because citizens' data requires lifelong
          protection against future decryption. The serious work there is not
          only about owning more infrastructure. It is about designing systems
          that need to hold less sensitive data to function at all. Sovereignty
          as architecture, not procurement.
        </p>
        <p>
          The real lesson of Y2K is not that the next warning is overblown. It
          is that quiet, early, structural work is what turns a catastrophe
          into an unremarkable Tuesday.
        </p>
        <p>
          For the quantum threat, the earliest and most durable version of
          that work is a decision available to us right now, before any of the
          hard cryptographic migration even begins. It is the same decision I
          made in a corridor in Washington twenty-six years ago, scaled up to
          the systems we now live inside:
        </p>
        <p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Deciding what not to collect.
        </p>
      </div>
    </EssayLayout>
  );
}
