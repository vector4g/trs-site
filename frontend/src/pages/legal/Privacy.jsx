import LegalLayout, {
  H2,
  H3,
  P,
  UL,
  LI,
  Definition,
} from "@/components/legal/LegalLayout";

export default function Privacy() {
  return (
    <LegalLayout
      title="Privacy Notice"
      eyebrow="Privacy"
      version="v0.1"
      lastUpdated="2026-04-20"
      effectiveDate="TBD (on counsel sign-off)"
      currentPath="/legal/privacy"
    >
      <H2 id="summary">1. At a glance</H2>
      <P>
        Third Rail Systems OÜ ("Third Rail", "we", "us") builds a
        minimum-disclosure compliance layer for enterprise travel risk. Our
        commercial thesis is that identity-bearing data should remain on the
        traveler's device and never enter our systems or our customer's HRIS.
        This notice explains the narrow set of personal data we do process —
        primarily for our public website and pilot-intake flow — and your
        rights under the EU General Data Protection Regulation (GDPR).
      </P>
      <UL>
        <LI>
          We do <span className="text-white">not</span> centrally collect or
          store GDPR Article 9 "special-category" data.
        </LI>
        <LI>
          We <span className="text-white">do</span> process limited contact
          data when you voluntarily submit our pilot-request form.
        </LI>
        <LI>
          We <span className="text-white">do</span> use PostHog (EU region)
          for privacy-respecting product analytics on this website.
        </LI>
        <LI>
          We are registered in Tallinn, Estonia. Our processing operates
          under EU jurisdiction by design.
        </LI>
      </UL>

      <H2 id="controller">2. Data Controller</H2>
      <Definition term="Legal entity">
        Third Rail Systems OÜ — an Estonian private limited company (osaühing).
      </Definition>
      <Definition term="Registered address">
        Harju maakond, Tallinn, Lasnamäe linnaosa, Sepapaja tn 6, 15551, Estonia.
      </Definition>
      <Definition term="Registry code">
        17488655 (Estonian Commercial Register).
      </Definition>
      <Definition term="VAT">
        [TBC — EE VAT number if/when registered.]
      </Definition>
      <Definition term="Privacy contact">
        <a
          href="mailto:privacy@thirdrailsystems.ee"
          className="text-cyan-400 hover:text-cyan-300"
        >
          privacy@thirdrailsystems.ee
        </a>
      </Definition>
      <P>
        Third Rail has not appointed a statutory Data Protection Officer
        (GDPR Art. 37) at this stage; the CEO exercises the privacy-contact
        function. A DPO will be appointed prior to any processing that
        triggers an Art. 37 obligation.
      </P>

      <H2 id="what">3. What we process, and why</H2>
      <H3>3.1 Website visitors</H3>
      <P>
        When you visit thirdrailsystems.ee, our EU-hosted infrastructure
        processes the following technical data for the sole purpose of
        delivering and securing the site: IP address, user agent, referrer,
        and request timestamps. This data is retained in operational logs for
        a maximum of 30 days and is not used to build a behavioural profile
        of you outside the analytics scope described below.
      </P>
      <UL>
        <LI>
          <span className="text-white">Lawful basis:</span> Article 6(1)(f)
          GDPR — legitimate interest in operating and securing our website.
        </LI>
      </UL>

      <H3>3.2 Pilot-request intake form</H3>
      <P>
        When you submit the pilot-request form on our homepage, we collect
        only: first name, last name, corporate email address, and your role
        (e.g. CSO, DPO, ERG lead). We use this information exclusively to
        respond to your enquiry, assess pilot fit, and (if relevant) enter
        pre-contract negotiations with your organization.
      </P>
      <UL>
        <LI>
          <span className="text-white">Lawful basis:</span> Article 6(1)(b)
          GDPR — steps taken at your request prior to entering into a
          contract — with Article 6(1)(f) as a secondary basis for the
          operational notification of our sales team.
        </LI>
        <LI>
          <span className="text-white">Retention:</span> up to 24 months
          from submission, after which unactioned enquiries are deleted.
        </LI>
        <LI>
          <span className="text-white">Anti-abuse:</span> we process your IP
          address and submission timing transiently to apply rate-limits and
          honeypot detection. These values are not stored alongside your
          contact record after the check completes.
        </LI>
      </UL>

      <H3>3.3 Product analytics (PostHog)</H3>
      <P>
        We use PostHog (operated by PostHog Inc., with an EU data-region
        available) to measure aggregate usage of our marketing site —
        including events like <em>memo_viewed</em>,{" "}
        <em>memo_read_completed</em>, and <em>pilot_request_submitted</em>.
        These events are associated with an anonymous device identifier and
        are not joined to your identity on our side unless you subsequently
        submit the pilot-request form, at which point we may associate the
        anonymous identifier with your contact record solely to qualify the
        enquiry (e.g. whether you read our Strategic Memo before submitting).
      </P>
      <UL>
        <LI>
          <span className="text-white">Lawful basis:</span> Article 6(1)(f)
          GDPR — legitimate interest in understanding how our thesis is
          received by the prospective-customer audience.
        </LI>
        <LI>
          <span className="text-white">Opt-out:</span> see the Cookies notice
          for controls. You can disable analytics at any time.
        </LI>
      </UL>

      <H3>
        3.4 The product itself — our "minimum-disclosure" architectural
        commitment
      </H3>
      <P>
        Third Rail's production platform — the minimum-disclosure compliance
        layer sold to enterprise customers — is deliberately designed so
        that we never act as a Controller of a traveler's special-category
        personal data. When a customer deploys the platform, identity inputs
        (e.g. protected-trait signals relevant to travel risk) remain
        encrypted on the traveler's device; our stateless synthesis layer
        cross-references destinations against local penal codes without
        logging those inputs centrally. The enterprise remains the
        Controller of standard itineraries, and Third Rail operates as a
        Processor under a Data Processing Agreement that will be executed
        prior to any pilot activation.
      </P>

      <H2 id="recipients">4. Recipients and international transfers</H2>
      <P>
        We disclose your personal data only to the processors strictly
        necessary to run the website and respond to enquiries. As of this
        version we use:
      </P>
      <UL>
        <LI>
          <span className="text-white">Resend Inc.</span> — transactional
          email delivery for notifying us of your pilot-request submission.
          Contracted under Resend's standard DPA.
        </LI>
        <LI>
          <span className="text-white">MongoDB (EU-region cluster).</span>{" "}
          Database of record for pilot-request submissions.
        </LI>
        <LI>
          <span className="text-white">PostHog, Inc.</span> — product
          analytics; we use (or will use, pending migration) the EU data
          region to keep processing within the EU.
        </LI>
      </UL>
      <P>
        Where a processor is established outside the EEA, the transfer is
        governed by an executed Data Processing Agreement incorporating the
        European Commission's Standard Contractual Clauses (Decision
        (EU) 2021/914) and, where applicable, supplementary measures
        consistent with the EDPB's{" "}
        <em>Recommendations 01/2020</em>. We do not currently rely on
        derogations under Article 49 GDPR.
      </P>

      <H2 id="rights">5. Your rights under GDPR</H2>
      <P>
        You have the right, subject to the conditions set out in the GDPR, to:
      </P>
      <UL>
        <LI>
          <span className="text-white">Access</span> the personal data we
          hold about you (Art. 15).
        </LI>
        <LI>
          Request <span className="text-white">rectification</span> of
          inaccurate data (Art. 16).
        </LI>
        <LI>
          Request <span className="text-white">erasure</span> where one of
          the grounds in Art. 17 applies.
        </LI>
        <LI>
          Request <span className="text-white">restriction</span> of
          processing (Art. 18).
        </LI>
        <LI>
          Obtain your data in a portable, machine-readable format (Art. 20).
        </LI>
        <LI>
          <span className="text-white">Object</span> to processing based on
          our legitimate interests (Art. 21).
        </LI>
        <LI>
          Lodge a complaint with your local EU supervisory authority or with
          the Estonian Data Protection Inspectorate (
          <em>Andmekaitse Inspektsioon</em>).
        </LI>
      </UL>
      <P>
        To exercise any of these rights, write to{" "}
        <a
          href="mailto:privacy@thirdrailsystems.ee"
          className="text-cyan-400 hover:text-cyan-300"
        >
          privacy@thirdrailsystems.ee
        </a>
        . We will respond within one month of receipt (Art. 12(3)).
      </P>

      <H2 id="security">6. Security</H2>
      <P>
        We maintain organizational and technical measures appropriate to the
        nature of the data we process: encryption in transit (TLS 1.2+),
        encryption at rest for the pilot-requests datastore, least-privilege
        access, and audit logging. Our production platform extends these
        measures with on-device encryption of identity inputs, stateless
        synthesis, and immutable vector logging — consistent with the EU AI
        Act's expectations for limited-risk assistive decision-support
        systems.
      </P>

      <H2 id="children">7. Children</H2>
      <P>
        This website and our product are not directed at children under 16
        and we do not knowingly process children's data.
      </P>

      <H2 id="changes">8. Changes to this notice</H2>
      <P>
        We will update this notice as our processing evolves and, in all
        events, following counsel review. Material changes will be
        communicated on this page with a revised version number and date.
      </P>

      <H2 id="contact">9. Contact</H2>
      <Definition term="By email">
        <a
          href="mailto:privacy@thirdrailsystems.ee"
          className="text-cyan-400 hover:text-cyan-300"
        >
          privacy@thirdrailsystems.ee
        </a>
      </Definition>
      <Definition term="By post">
        Third Rail Systems OÜ — Attn. Privacy
        <br />
        Harju maakond, Tallinn, Lasnamäe linnaosa, Sepapaja tn 6, 15551,
        Estonia.
      </Definition>
    </LegalLayout>
  );
}
