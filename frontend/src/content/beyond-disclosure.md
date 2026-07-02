# Beyond Disclosure: A European Architectural Alternative for Protecting Marginalised Populations Across Workforce and Travel Contexts

**Author:** Levi Hankins, Founder and CEO, Third Rail Systems OÜ

### Abstract

Protection systems that require marginalised populations to disclose vulnerability to receive accommodation are structurally inadequate. Across European workforce and travel contexts, disclosure-based architectures fail because the collected data becomes a persistent attack surface. Institutional stigmatisation causes delayed or absent disclosure, and cross-border movement exposes sensitive demographic data to hostile jurisdictions. Single-axis legal frameworks cannot adequately protect intersectional populations, and the individuals most in need of protection are systematically excluded from the registries that gate such protection. This whitepaper analyses four empirical domains regarding marginalised populations: LGBTQ+ identities, neurodivergence and trauma, physical disability, and intersectional vulnerabilities. It proposes an architectural alternative operating on four principles: sovereign local edge execution, ephemeral processing without persistent state, decoupled audit trails, and minimum disclosure as a moral baseline.

### 1. The Disclosure Paradox: The Structural Failure of Centralised Identity

European enterprise systems operate under a profound structural contradiction. The General Data Protection Regulation (GDPR) Article 9 prohibits the processing of special categories of personal data, including sexual orientation, racial origin, and health data (LGBTQ+ Claim 2). Concurrently, the ISO 31030 travel risk management standard requires organisations to assess localised threats against the specific demographic profile of individual travellers (LGBTQ+ Claim 4). Enterprise duty-of-care leaders are therefore required to evaluate risks specific to identity factors they are legally prohibited from collecting or storing.

The traditional enterprise response has been to rely on voluntary disclosure, creating centralised registries of marginalised employees to manage compliance and accommodation. This model carries a heavy psychological and institutional cost. The requirement to conceal one's identity to survive within an institution leaves a lasting imprint. Between February 1994 and September 2011, more than 13,000 United States service members were separated from the military under the Don't Ask, Don't Tell policy (LGBTQ+ Claim 1). Sam des Forges, Director of Conduct, Equity and Justice at the UK Ministry of Defence, has observed that the necessity of hiding oneself in professional environments is inherently exhausting (LGBTQ+ Claim 8).

When institutions require formal disclosure to grant protection, they create a barrier marginalised populations cannot safely cross. In the German Bundeswehr, soldiers wait an average of 1.3 years before formal disclosure of Post-Traumatic Stress Disorder (PTSD), compared to 0.6 years for other disorders. This latency is attributed directly to institutional stigmatisation (Grandin Claim 4). When soldiers delay reporting trauma because the institution makes disclosure costly, the mechanisms designed to trigger support become deterrents.

### 2. The Threat Landscape: Navigating Hostile Jurisdictions and Operational Harms

This compliance gap is dangerous because the external threat landscape is severe and increasingly volatile. As of 2026, 65 UN member states actively criminalise consensual same-sex sexual acts (LGBTQ+ Claim 5). For travellers navigating these jurisdictions, centralised corporate databases holding demographic profiles represent extreme liabilities.

The risks extend well beyond static legislation. Cross-border data transfer frameworks are inherently unstable. The Court of Justice of the European Union invalidated the Safe Harbour framework in 2015 (Schrems I) and the Privacy Shield framework in 2020 (Schrems II), in each case ruling that United States surveillance practices failed to provide adequate protection for European data. In June 2026, the United States Supreme Court ruling in *Trump v. Slaughter* raised immediate questions among privacy scholars regarding the independence of US regulatory authorities, and therefore regarding the stability of successor data-transfer agreements. Concurrently, a June 2026 government export-control directive compelled a frontier AI developer to suspend global access to two of its most capable models for a period, because the developer could not selectively restrict access by nationality, while a parallel framework conditioned the release of advanced models on government review. This volatility indicates that relying on centralised, cross-border data architectures to protect vulnerable employees is a structural risk.

Even robust national architectures remain vulnerable when trust is centralised. The 2017 ROCA vulnerability, which compromised the cryptographic integrity of more than 750,000 Estonian national eID cards through a flaw in an outsourced silicon component, demonstrated that institutional control over black-boxed, centralised infrastructure cannot be assumed. When the foundational trust layer is outsourced and centralised, a single supply-chain failure can become a systemic crisis. The incident is a historical precedent rather than a current event, but it is precisely why the European Digital Identity Wallet and eIDAS 2.0 rollouts now prioritise decentralised, privacy-preserving designs.

For marginalised travellers, physical borders and operational transit represent points of acute vulnerability. The 2024 reform of the Schengen Borders Code de facto legitimises racial profiling by permitting discretionary document checks near internal borders. Consequently, 58% of respondents who experienced a police stop in the year before the FRA survey reported their most recent stop was the result of racial profiling (Crenshaw Claim 2). For individuals with physical limitations, disclosure-based travel systems fail operationally. The European Disability Forum's 2025 report documents widespread, systemic damage to wheelchairs and assistive devices by air carriers, framing it as a human rights concern. Airlines do not publish consistent aggregate mishandling data for mobility equipment, and that opacity is itself a symptom of institutional neglect: the scale of the harm cannot be independently audited because the carriers responsible for it do not report it. The financial exposure is acute regardless. The Montreal Convention classifies a mobility device as baggage, capping mandatory airline liability at 1,519 Special Drawing Rights, roughly €1,900, as revised by ICAO with effect from December 2024, against custom electric wheelchairs frequently valued between €15,000 and €75,000 (Heumann Claim 3). A passenger may file a special declaration of interest at check-in to raise that ceiling, but the default treats a piece of essential medical equipment as an ordinary suitcase.

### 3. The Intersectional and Diagnostic Gaps: Why Legal Frameworks Fail

European legal systems struggle to process intersectional realities. EU anti-discrimination law evaluates race, gender, and disability through separate legislative silos. The *Bahl v Law Society* case in the United Kingdom illustrates this limitation. An Asian woman argued she faced discrimination specifically as a Black woman. The Employment Tribunal accepted this intersectional premise, but the Employment Appeal Tribunal overturned it, ruling the tribunal erred in law by failing to distinguish between separate elements of race and sex discrimination (Crenshaw Claim 7). Because single-axis legal protection cannot remedy compound harm, technological architectures must operate at the intersectional level.

Legal and accessibility architectures that require a verified clinical diagnosis also systematically exclude the populations they claim to serve. Autism spectrum condition prevalence in European populations is approximately 1 in 89 (Grandin Claim 1). However, between 89% and 97% of autistic adults aged 40 and older in the United Kingdom remain undiagnosed. These older autistic adults face severe outcomes, including a six-fold increase in suicidal ideation (Grandin Claim 2).

This diagnostic gatekeeping contributes to a persistent structural employment gap. Only 51.3% of active, working-age persons in the EU with disabilities are in paid employment (Grandin Claim 6). Entering the labour market requires navigating a severe privacy dilemma, because disclosing a condition to secure legal accommodations places sensitive medical data within corporate infrastructure. *(Methodological note: while Eurostat data provides aggregate employment figures for disabled populations using the Global Activity Limitation Indicator, specific physical-disability subset employment data is not available through current European reporting frameworks. This statistical opacity at the pan-European institutional level further complicates visibility and targeted policy design.)*

### 4. The Physical Precedent: Blueprints for Minimum Disclosure

The architectural alternative to disclosure-based protection already exists in physical European infrastructure. The Hidden Disabilities Sunflower scheme, originating at Gatwick Airport and adopted across Europe, acts as a discreet visual signal that the wearer requires additional time or assistance. No medical proof or diagnostic specification is required to obtain the lanyard (Grandin Claim 8). Spain's primary airport operator Aena implements a similar invisible-disabilities badge granting access to dedicated security checkpoints without forcing medical disclosure (Grandin Claim 8).

Corporate employment models are adopting this philosophy. Specialisterne, a pioneering European employment organisation, partners directly with Copenhagen Airport to hire neurodivergent employees for security screening positions. They structure the work environment to leverage rather than penalise the neurodivergent profile, without requiring traditional barrier-laden recruitment processes (Grandin Claim 7). These initiatives show that decentralised, minimum-disclosure accommodations work at scale in highly regulated physical environments. Digital privacy architectures can learn directly from this physical precedent.

### 5. The European Architectural Alternative

To address the failures of disclosure-based protection, enterprise digital systems can adopt a different design philosophy. The architectural alternative proposed by Third Rail Systems OÜ shifts the burden of accommodation away from user disclosure and toward system adequacy. This architecture is governed by four design principles.

**Principle 1: Sovereign Local Edge Execution**
To protect travellers crossing through hostile jurisdictions, sensitive data should not reside in the cloud. Sovereign local edge execution is designed so that sensitive profile attributes are processed on the user's own hardware, and so that the central enterprise architecture does not receive, transmit, or store the demographic data.

**Principle 2: Ephemeral Processing Without Persistent State**
When evaluating localised threats, the architecture uses ephemeral processing. The system evaluates environmental threat intelligence against the local user profile, generates an immediate risk evaluation, and then discards the processing state rather than retaining it. The system learns the context of the environment without centralising the identity of the user.

**Principle 3: Decoupled Audit Trails**
Enterprise compliance requires proof that duty-of-care obligations were met. Decoupled audit trails address the GDPR Article 9 paradox. The architecture generates cryptographically verifiable proofs that a risk assessment occurred and appropriate accommodations were offered, without recording the sensitive attributes that triggered the assessment. The employer receives a verifiable attestation of compliance, and the employee's demographic attributes remain private.

**Principle 4: Minimum Disclosure as a Moral Baseline**
Drawing direct inspiration from physical infrastructure such as the Sunflower lanyard, digital systems can offer accommodations without demanding clinical proof. Minimum disclosure operates on the premise that an employee can toggle cognitive, physical, or travel accommodations autonomously. The architecture acts on the user's operational request without requiring them to justify it through a centralised medical or demographic registry.

---

### Appendix: Architectural Objections and Implementation Pathways

A technical reader will raise three practical objections to the principles above. Each has an architectural answer.

**The managed-device objection.** Corporate travellers often carry devices under mobile device management (MDM), so local execution might seem to hand control back to the employer. The response is to place the sensitive computation inside a hardware-isolated execution environment, a secure enclave within the device processor. Management tooling can restrict applications or wipe the device, but it has no read access through its management channel to the state inside the enclave, where the identity-specific assessment runs. The protection does not depend on the employer declining to look. It depends on there being no ordinary path by which the employer can.

**The audit-correlation objection.** If the organisation receives a proof that an accommodation was provided at a specific time and place, it could cross-reference that against travel records and re-identify the individual. The response is to decouple the audit record from time and place. The proof establishes, to the organisation and to a regulator, that a defined duty-of-care obligation was discharged for an active traveller within a broad region and time window, with the granularity of region and window tuned so that the record is not correlated to a single person. The cloaking widens where few travellers are present, so the proof carries a verifiable attestation of compliance without carrying the metadata that would defeat the point.

**The query-leak objection.** If a device asks a service for the safety status of a specific demographic in a specific country, the query itself reveals the user. The response is not to ask. The device retrieves a compact, encrypted dataset covering all demographics and jurisdictions as a generic update, and performs the identity-specific matching locally, inside the enclave. The network observes a routine data refresh and not a demographic query. What is never asked cannot be observed.

---

### References

Full source detail is provided in the [Beyond Disclosure source list](/beyond-disclosure/sources), comprising Part A (library-verified sources) and Part B (wider-pattern sources pending primary-source verification), maintained alongside the Third Rail Systems consolidated citation library.

---

*Third Rail Systems OÜ, Tallinn, Estonia. Registry 17488655. This whitepaper and all intellectual property described in it are held by Third Rail Systems OÜ.*
