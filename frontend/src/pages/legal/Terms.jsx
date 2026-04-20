import LegalLayout, {
  H2,
  H3,
  P,
  UL,
  LI,
} from "@/components/legal/LegalLayout";

export default function Terms() {
  return (
    <LegalLayout
      title="Website Terms of Use"
      eyebrow="Terms"
      version="v0.1"
      lastUpdated="2026-04-20"
      effectiveDate="TBD (on counsel sign-off)"
      currentPath="/legal/terms"
    >
      <H2 id="scope">1. Scope</H2>
      <P>
        These Terms of Use ("Terms") govern access to and use of the public
        website located at thirdrailsystems.ee (the "Website") and the
        informational materials made available on it. These Terms{" "}
        <span className="text-white">do not</span> govern the Third Rail
        Systems OÜ enterprise platform or any paid pilot or production
        engagement. A separate pilot agreement, signed by both parties, is
        the sole instrument governing those services.
      </P>

      <H2 id="identity">2. The provider</H2>
      <P>
        The Website is operated by Third Rail Systems OÜ, an Estonian
        private limited company registered at Harju maakond, Tallinn,
        Lasnamäe linnaosa, Sepapaja tn 6, 15551, Estonia. Full imprint
        details are available on the{" "}
        <a href="/legal/imprint" className="text-cyan-400 hover:text-cyan-300">
          Legal / Imprint
        </a>{" "}
        page.
      </P>

      <H2 id="permitted-use">3. Permitted use</H2>
      <P>
        You may access and use the Website for lawful, non-commercial
        informational purposes, and — in the case of enterprise evaluators —
        to assess whether Third Rail's offering is suitable for your
        organization. You agree not to:
      </P>
      <UL>
        <LI>
          Use the Website in any manner that could damage, disable,
          overburden, or impair it or interfere with any other party's use.
        </LI>
        <LI>
          Attempt to gain unauthorized access to any portion of the
          Website, including the administrative console, or to any
          connected system or network.
        </LI>
        <LI>
          Use any automated system (including bots, scrapers, or spiders)
          to submit the pilot-request form. Submissions are rate-limited
          and subject to automated anti-abuse controls as described in the{" "}
          <a href="/legal/privacy" className="text-cyan-400 hover:text-cyan-300">
            Privacy Notice
          </a>
          .
        </LI>
        <LI>
          Reproduce, reverse-engineer, or republish the Strategic Memo or
          other long-form materials without attribution and prior written
          consent.
        </LI>
      </UL>

      <H2 id="pilot-intake">4. Pilot-request submissions</H2>
      <P>
        Submitting the pilot-request form on the Website does not create a
        contractual obligation on either party. Pilots are scoped and
        governed by a separate written agreement. By submitting the form
        you confirm that (a) you are authorized to provide the contact
        information on behalf of your organization and (b) the information
        is accurate.
      </P>

      <H2 id="ip">5. Intellectual property</H2>
      <P>
        The Website, the Third Rail Systems name and logo, the "Inclusion
        Safety Dossier" concept, the Strategic Memo text, and all other
        content on the Website are the intellectual property of Third Rail
        Systems OÜ or its licensors. Nothing on the Website should be
        construed as granting a licence to use any of the foregoing except
        as expressly stated in writing.
      </P>

      <H2 id="no-advice">6. No professional advice; no warranties</H2>
      <P>
        The Website, the Strategic Memo, and any accompanying material are
        provided for informational purposes only. They do not constitute
        legal, compliance, security, travel-risk, medical, or other
        professional advice, and they are{" "}
        <span className="text-white">not</span> a substitute for advice
        from qualified counsel familiar with your organization's specific
        circumstances. The Website is provided "as is" and "as available"
        and, to the maximum extent permitted by Estonian and EU law, Third
        Rail disclaims all warranties, express or implied, in connection
        with the Website.
      </P>

      <H2 id="liability">7. Limitation of liability</H2>
      <P>
        To the maximum extent permitted by applicable law, Third Rail will
        not be liable for any indirect, incidental, special, or
        consequential damages — including loss of profit, loss of goodwill,
        or loss of data — arising out of or in connection with your use of
        the Website. Nothing in these Terms limits liability that cannot be
        limited or excluded under Estonian law.
      </P>

      <H2 id="third-parties">8. Third-party links</H2>
      <P>
        The Website may contain links to third-party websites and
        resources. Those sites are operated independently of Third Rail and
        we do not endorse and are not responsible for their content,
        availability, or practices.
      </P>

      <H2 id="changes">9. Changes to these Terms</H2>
      <P>
        We may update these Terms from time to time. Material changes will
        be reflected by a revised version number and last-updated date at
        the top of this page.
      </P>

      <H2 id="law">10. Governing law and jurisdiction</H2>
      <H3>10.1 Consumers in the EU</H3>
      <P>
        If you use the Website as a consumer, your mandatory local consumer
        protections are not affected by these Terms, and you retain the
        right to bring proceedings in the courts of your habitual
        residence.
      </P>
      <H3>10.2 All other users</H3>
      <P>
        These Terms are governed by the laws of the Republic of Estonia,
        without reference to its conflict-of-laws rules. Disputes arising
        out of or in connection with these Terms shall be submitted to the
        exclusive jurisdiction of the Harju County Court (Harju Maakohus),
        Tallinn, Estonia, save where mandatory law provides otherwise.
      </P>

      <H2 id="contact">11. Contact</H2>
      <P>
        Questions about these Terms:{" "}
        <a
          href="mailto:legal@thirdrailsystems.ee"
          className="text-cyan-400 hover:text-cyan-300"
        >
          legal@thirdrailsystems.ee
        </a>
        .
      </P>
    </LegalLayout>
  );
}
