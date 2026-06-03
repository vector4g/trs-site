import LegalLayout, {
  H2,
  P,
  Definition,
} from "@/components/legal/LegalLayout";
import { openExternal } from "@/components/landing/shared";

const ODR_URL = "https://ec.europa.eu/consumers/odr";

export default function Imprint() {
  return (
    <LegalLayout
      title="Legal / Imprint"
      eyebrow="Imprint"
      version="v0.1"
      lastUpdated="2026-04-20"
      currentPath="/legal/imprint"
    >
      <H2 id="entity">1. Entity information</H2>
      <Definition term="Legal name">
        Third Rail Systems OÜ
      </Definition>
      <Definition term="Legal form">
        Osaühing (OÜ) — private limited company organised under the laws of
        the Republic of Estonia.
      </Definition>
      <Definition term="Registered address">
        Harju maakond, Tallinn, Lasnamäe linnaosa, Sepapaja tn 6, 15551, Estonia.
      </Definition>
      <Definition term="Registry code">
        17488655 (Estonian Commercial Register — <em>Äriregister</em>).
      </Definition>
      <Definition term="VAT identification">
        [TBC — EE VAT number if/when registered. Until registration, VAT is
        not charged on invoices issued by Third Rail.]
      </Definition>

      <H2 id="representation">2. Representation</H2>
      <Definition term="Chief Executive Officer">
        Levi Hankins
      </Definition>
      <Definition term="Chief Technology Officer">
        Jeremy Stabile
      </Definition>
      <P>
        Legally binding statements on behalf of Third Rail Systems OÜ may
        be made only by a board member or a person holding a written power
        of attorney from the board.
      </P>

      <H2 id="contact">3. Contact</H2>
      <Definition term="General enquiries">
        <a
          href="mailto:hello@thirdrailsystems.ee"
          className="text-cyan-400 hover:text-cyan-300"
        >
          hello@thirdrailsystems.ee
        </a>
      </Definition>
      <Definition term="Legal enquiries">
        <a
          href="mailto:legal@thirdrailsystems.ee"
          className="text-cyan-400 hover:text-cyan-300"
        >
          legal@thirdrailsystems.ee
        </a>
      </Definition>
      <Definition term="Privacy / GDPR">
        <a
          href="mailto:privacy@thirdrailsystems.ee"
          className="text-cyan-400 hover:text-cyan-300"
        >
          privacy@thirdrailsystems.ee
        </a>
      </Definition>
      <Definition term="Pilot enquiries">
        <a
          href="mailto:levi@thirdrailsystems.ee"
          className="text-cyan-400 hover:text-cyan-300"
        >
          levi@thirdrailsystems.ee
        </a>
      </Definition>

      <H2 id="responsibility">4. Responsibility for content</H2>
      <P>
        The content of this Website is maintained by the founding team of
        Third Rail Systems OÜ. We make reasonable efforts to ensure the
        information is accurate and up to date; however, we do not
        guarantee its completeness and it does not constitute professional
        advice (see the{" "}
        <a href="/legal/terms" className="text-cyan-400 hover:text-cyan-300">
          Terms of Use
        </a>
        ).
      </P>

      <H2 id="disputes">5. Consumer dispute resolution</H2>
      <P>
        Third Rail Systems OÜ is neither obliged nor willing to participate
        in dispute-resolution proceedings before a consumer arbitration
        body within the meaning of the Estonian Consumer Protection Act.
        The European Commission's online dispute-resolution platform is
        available at{" "}
        <a
          href={ODR_URL}
          className="text-cyan-400 hover:text-cyan-300"
          target="_blank"
          rel="noreferrer"
          onClick={openExternal(ODR_URL)}
        >
          ec.europa.eu/consumers/odr
        </a>
        .
      </P>

      <H2 id="supervisory">6. Competent supervisory authority</H2>
      <P>
        For data-protection complaints, the competent supervisory
        authority is the Estonian Data Protection Inspectorate (
        <em>Andmekaitse Inspektsioon</em>), Tatari 39, 10134 Tallinn,
        Estonia.
      </P>
    </LegalLayout>
  );
}
