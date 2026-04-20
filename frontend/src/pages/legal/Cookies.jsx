import LegalLayout, {
  H2,
  P,
  UL,
  LI,
  Definition,
} from "@/components/legal/LegalLayout";

export default function Cookies() {
  return (
    <LegalLayout
      title="Cookie & Tracking Notice"
      eyebrow="Cookies"
      version="v0.1"
      lastUpdated="2026-04-20"
      effectiveDate="TBD (on counsel sign-off)"
      currentPath="/legal/cookies"
    >
      <H2 id="summary">1. Summary</H2>
      <P>
        A "cookie" is a small text file stored on your device by a website
        to remember state between requests. Some cookies are strictly
        necessary to operate a site; others are optional. Under the EU
        ePrivacy Directive (as implemented in Estonia) non-essential
        cookies and equivalent tracking technologies require informed
        consent. This notice tells you exactly what we use, why, and how to
        control it.
      </P>

      <H2 id="what-we-use">2. What we use</H2>

      <Definition term="Strictly necessary">
        Session state, CSRF protection, and anti-abuse controls for the
        pilot-request form. These are first-party, short-lived, and
        essential to operate the Website. No consent required (ePrivacy
        Dir. Art. 5(3), exception for communications strictly necessary to
        deliver a service explicitly requested by the user).
      </Definition>

      <Definition term="Product analytics (PostHog)">
        We use PostHog to measure aggregate usage of the Website (e.g.
        which sections of the Strategic Memo are read, how many visitors
        reach the pilot-request form). PostHog may set first-party
        cookies/local-storage keys on your device for the purposes of
        deduplicating events from the same browser session. We rely on
        your informed consent for this processing, and we operate PostHog
        in its EU data region.
      </Definition>

      <Definition term="Admin localStorage (/admin only)">
        If you authenticate into the administrative console at /admin, a
        single localStorage key (<span className="mono">trs.admin_token</span>)
        holds your admin token locally on your device so you do not need
        to re-authenticate on every page load. This applies only to
        authorized operators of Third Rail Systems OÜ.
      </Definition>

      <Definition term="Memo read-progress (localStorage)">
        If you scroll through our Strategic Memo to completion, we record a
        single boolean flag (<span className="mono">trs.memo_read</span>)
        on your device. If you subsequently submit the pilot-request form,
        this flag is sent with your submission solely so we can qualify
        your enquiry (it helps us know whether to lead with the memo
        content on our follow-up call). You can clear this value at any
        time by clearing site storage for this domain.
      </Definition>

      <H2 id="no-ads">3. What we do not use</H2>
      <UL>
        <LI>No advertising cookies.</LI>
        <LI>No cross-site tracking or ad-network pixels.</LI>
        <LI>No social-media share trackers.</LI>
        <LI>
          No fingerprinting or probabilistic identity-matching of visitors.
        </LI>
      </UL>

      <H2 id="control">4. How to control these</H2>
      <P>
        You can refuse or withdraw consent to product analytics at any
        time. We offer two controls:
      </P>
      <UL>
        <LI>
          <span className="text-white">Browser-level:</span> disable
          third-party cookies and/or local storage in your browser
          settings. Modern privacy browsers (e.g. Safari Intelligent
          Tracking Prevention, Firefox Total Cookie Protection) already
          limit what PostHog can persist.
        </LI>
        <LI>
          <span className="text-white">Do Not Track / Global Privacy
          Control:</span> our analytics layer honours{" "}
          <span className="mono">DNT: 1</span> and the{" "}
          <span className="mono">Sec-GPC: 1</span> header where sent.
        </LI>
        <LI>
          <span className="text-white">Opt-out email:</span> write to{" "}
          <a
            href="mailto:privacy@thirdrailsystems.ee"
            className="text-cyan-400 hover:text-cyan-300"
          >
            privacy@thirdrailsystems.ee
          </a>
          {" "}and we will suppress your analytics identifier server-side.
        </LI>
      </UL>
      <P>
        A consent banner compliant with the EDPB's Guidelines 03/2022 on
        deceptive design patterns will be introduced prior to any
        processing of analytics data from EU/EEA visitors that is not
        strictly necessary. Until that banner is deployed, PostHog is
        configured with the most conservative session-recording defaults
        (recording disabled for authenticated sessions, IPs anonymised).
      </P>

      <H2 id="contact">5. Contact</H2>
      <P>
        Questions about this notice:{" "}
        <a
          href="mailto:privacy@thirdrailsystems.ee"
          className="text-cyan-400 hover:text-cyan-300"
        >
          privacy@thirdrailsystems.ee
        </a>
        .
      </P>
    </LegalLayout>
  );
}
