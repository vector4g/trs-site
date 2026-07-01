## — Executive Summary

In October 2020, the Hamburg Data Protection Authority fined H&amp;M €35.3&nbsp;million for a violation that involved no external attack, no data breach in the conventional sense, and no malicious actor. The breach was structural. Middle managers had been quietly accumulating digital dossiers on their employees, covering health information, religious beliefs, and family circumstances, over five years, stored on an internal network drive and generated through well-intentioned manager conversations. The data became visible to the wider company only because of a configuration error.

This document argues that the H&amp;M case is not an outlier. It is the visible instance of a structural pattern that is present in virtually every multinational employer with a marginalised-cohort workforce, that has grown larger and more concentrated since 2020, and that is now operating inside a regulatory environment actively configured to find and penalise it. The pattern is called Shadow HR. The exposure is calculated against the full marginalised population, not the disclosed subset.

The architectural pattern that resolves it, minimum-disclosure stateless synthesis , is the only approach that survives both the duty-of-care obligation and the data-protection prohibition simultaneously. Five operational diagnostic questions appear at the close. A General Counsel, Chief Privacy Officer, or Chief Security Officer who can answer all five with documented evidence is likely in compliant operating territory. One who cannot is likely sitting on undocumented exposure of the type the Hamburg DPA found at H&amp;M.

## Part 1 The H&M Precedent

The H&amp;M Hennes &amp; Mauritz fine, issued on 1 October 2020 by the Hamburg Commissioner for Data Protection and Freedom of Information, set the operational template that European DPAs have followed since. Understanding the case in detail matters because the violation mechanism is the violation mechanism that is operating, undetected, in most multinationals today.

H&amp;M operated a service centre in Nuremberg where, beginning in 2014, team leaders conducted what were internally called *Welcome Back Talks* with employees returning from sick leave or vacation. The stated purpose was to maintain personal connection and identify support needs. Over five years, the content of these conversations was systematically recorded by managers and stored on an internal network drive. The records included specific health diagnoses, family difficulties, religious beliefs, and details about employees' vacation experiences and personal circumstances. The records were used to inform employment decisions including evaluations and contract renewals.

The data was not exposed because of an external breach. The data was exposed because in October 2019, a technical configuration error made the network drive readable across the wider H&amp;M corporate network for approximately five hours. Employees noticed. Internal complaints followed. The Hamburg DPA opened an investigation.

Prof. Dr. Johannes Caspar, the Hamburg Commissioner at the time, characterised the H&amp;M conduct as constituting:

Three elements of the Hamburg analysis matter for understanding the broader pattern:

## Part 2 The Shadow HR Pattern, Named

The H&amp;M case names a pattern that exists in most multinational organisations. Once identified, the pattern becomes visible everywhere. Once made visible, it cannot be unseen by a sophisticated General Counsel.

Modern duty-of-care frameworks, including ISO 31030 for travel risk, the Corporate Sustainability Due Diligence Directive (CSDDD) for supply chain and workforce obligations, the Worker Protection Act 2024 in the United Kingdom, the Equality Act jurisprudence on reasonable adjustments, and parallel European employer-liability evolution, all demand that employers protect specific marginalised employees from specific identity-aware harms. Generic protection is inadequate. Tailored protection is required.

Modern data protection frameworks, including GDPR Article 9 on special category data, the EU AI Act prohibition on demographic-attribute training inputs in employment contexts, and sector-specific regulation on health and disability data, all prohibit employers from centrally recording the attributes that would let them deliver that tailored protection.

These two regimes were authored by different legislators, operating on different timescales, optimising for different harms. They are both correct, individually. They are catastrophically incompatible, together .

Managers in multinational organisations live inside the resulting incompatibility every day. They know they have a duty-of-care obligation. They know the official systems cannot legally hold the data that would let them discharge it. So they build unofficial systems. In practice, Shadow HR manifests as:

Each of these is special-category personal data under GDPR Article 9, processed without proper legal basis, without DPIA, without documented purpose limitation, without retention controls, and typically without the data subject's specific knowledge of the processing scope. None of it was created with malicious intent. All of it was created by people trying to discharge their organizational obligations under duty-of-care frameworks that gave them no architectural alternative.

## Part 3 The Disclosure-Collapse Multiplier

Shadow HR would be a static problem if voluntary employee disclosure rates were stable. They are not. Disclosure rates across every marginalised cohort with available data are collapsing, and the collapse changes the risk math materially.

The Human Rights Campaign Foundation's 2026 Corporate Equality Index documented that 47.5% of LGBTQ+ adults are less out in at least one area of their lives than they were 12 months ago. The HRC characterised this as a measurable retreat from workplace identity disclosure under the current political and regulatory environment.

The City &amp; Guilds Foundation Neurodiversity Index for 2023 found that 76% of neurodivergent employees chose not to fully disclose their condition to their employer. The 2024 CIPD *Neuroinclusion at Work* Report found that 31% of neurodivergent employees have not told their manager or HR anything at all. The Understood.org and Harris Poll Neurodiversity at Work Survey in May 2025 found that 64% of neurodivergent employees believe disclosure would harm them, and 77% of all adults agreed that neurodivergent employees feel pressure to mask their conditions at work.

Across LGBTQ+, neurodivergent, disability, and other marginalised cohorts, the direction of travel is consistent: fewer employees are telling their employers what they are. The regulatory rollback of DEI infrastructure in the United States, accelerating since early 2025, has made disclosure feel actively dangerous in ways it did not feel two years ago.

Most Chief Privacy Officers would assume that declining disclosure reduces Shadow HR exposure. The opposite is true. As voluntary disclosure to official channels collapses, managers operating under duty-of-care pressure do not stop tracking. They track informally instead. The spreadsheet replaces the HRIS field. The ERG private chat replaces the corporate membership list. The personal note replaces the corporate record.

The total population of employees about whom special-category data is being processed does not shrink as disclosure collapses. The population stays the same. The proportion of that processing that happens in undocumented, unsanctioned, unmonitored systems grows. And the regulatory liability is calculated on the total population, not on the proportion being tracked through official channels.

The most underappreciated dimension of this problem is scale. Neurodivergent individuals, those with autism, ADHD, dyslexia, dyspraxia, and related conditions, account for an estimated 15 to 20% of the global adult population. A multinational with 50,000 employees has approximately 7,500 to 10,000 neurodivergent workers. Approximately 24% have formally disclosed (per CIPD 2024). The disclosed subset is tracked somewhere, in HRIS accommodation fields, ERG membership lists, manager notes, or OHS files. Each of those tracking locations is processing special-category health data under Article 9. A configuration error of the H&amp;M variety, exposing one of these tracking locations, would generate a penalty calculated against the entire employed neurodivergent population, not against the subset whose data was incidentally exposed. Hamburg established that principle in 2020. It has been confirmed in every subsequent enforcement action.

## Part 4 The Enforcement Trajectory

The argument that the H&amp;M case was an outlier requires ignoring everything that has happened since. The European DPA enforcement environment is not stable around employee data. It is intensifying.

In July 2024, the Dutch Data Protection Authority *(Autoriteit Persoonsgegevens)* fined Uber €290&nbsp;million for the unlawful transfer of European driver data to the United States. The fine was not about a breach. It was about the routine processing of driver-identity data through pathways that did not satisfy GDPR transfer requirements.

The case extended the H&amp;M principle. It is not necessary for data to be exposed for the processing itself to constitute the violation. The Uber decision specifically reaffirmed that the population whose data was processed forms the calculation basis for the penalty, regardless of how many of those individuals experienced actual harm.

The CMS GDPR Enforcement Tracker Report for 2025 documented cumulative European enforcement of €355&nbsp;million across 162 enforcement actions in the employee-data category alone, through March 2025. The trajectory of monthly enforcement is accelerating, not flat. Three factors are driving the acceleration:

D&amp;O (Directors and Officers) liability insurance underwriters and cyber liability underwriters have begun requiring documented compliance with ISO 31030 (Travel Risk Management) and demonstrable GDPR Article 35 DPIA coverage on employee-data processing as conditions for competitive renewal pricing. The insurance market is establishing what the regulatory market is enforcing. Organisations that cannot document their employee-data architecture against both frameworks are facing premium increases and coverage exclusions that compound the direct regulatory exposure.

## Part 5 The Architectural Resolution

The Shadow HR problem cannot be solved by policy. Stronger manager training, clearer compliance documentation, more frequent DPIAs. All are useful, none are sufficient. Managers will continue to receive duty-of-care obligations they cannot legally discharge using sanctioned data infrastructure, and they will continue to build informal alternatives in response. The problem is solvable only by architectural change. Specifically, by removing the underlying need for centralised special-category data accumulation in the first place.

A minimum-disclosure architecture delivers the bespoke risk mitigation that duty-of-care frameworks demand without requiring the employer to centrally retain the demographic attributes that data-protection frameworks prohibit. The architectural pattern has three properties:

Identity attributes that would constitute Article 9 special-category data are held on the employee's edge device, behind biometric authentication, never transmitted to enterprise systems.

Risk assessment is performed by stateless synthesis against destination or assignment context. The demographic input is destroyed at the boundary of the synthesis enclave. No retained identity record exists to attach the output to.

The audit trail required for ISO 31030 and EU AI Act compliance captures the assessment outputs and decision logic, not the demographic inputs. The compliance evidence exists. The Article 9 exposure does not.

Centralised data brokerage, the architectural pattern that defines the legacy travel-risk-management industry, cannot survive the current regulatory environment. The enforcement trajectory is too steep, the disclosure-collapse multiplier is too aggressive, and the population-based penalty calculation is too punitive. Privacy-by-design architecture is not an aesthetic preference. It is the only structural pattern that satisfies both regulatory regimes simultaneously and that scales with a workforce whose disclosure rates will continue to decline through the remainder of the decade.

## Part 6 Five Diagnostic Questions

A General Counsel, Chief Privacy Officer, or Chief Security Officer evaluating organizational exposure to Shadow HR liability can begin with five operational diagnostic questions. The questions are not exhaustive. They are calibrated to surface the categories of exposure most consistently present in multinational organisations. An organisation that can answer all five questions with documented evidence is likely in compliant operating territory. An organisation that cannot answer one or more is likely sitting on undocumented exposure of the type the Hamburg DPA found at H&amp;M in 2020.

## — If This Brief Maps to Your Organisation

The Shadow HR pattern is recognizable once named. Most General Counsels who read this brief in full will recognise at least two of the five diagnostic questions as ones they cannot answer with documented evidence. Some will recognise all five.

Third Rail Systems OÜ is conducting confidential architectural diagnostics with a limited number of multinational organisations through Q3 2026. The diagnostic is not a sales engagement. It is a 60-minute structured conversation between your Privacy, Security, and HR leadership and our architectural team, focused on whether your current employee-data architecture can survive a Hamburg DPA inspection. The diagnostic produces a written assessment of exposure points and architectural alternatives. There is no obligation to engage further. Organisations that determine, after the diagnostic, that their current architecture is sound have received a documented validation that may be useful for D&amp;O insurance underwriting conversations. Organisations that determine, after the diagnostic, that architectural change is warranted have a reference framework for the change.

Diagnostic requests are evaluated against three criteria:

Copy the in-site link or share the LinkedIn companion essay with one click.

## — Further reading: the Exposure series

Three essays on the same architectural principle, viewed through different lenses: data lifespan, platform dependency, and the unequal distribution of exposure itself.

Y2K was a fix delivered on time. Harvest-now-decrypt-later puts encryption in the same shape of problem. The durable answer is collecting less.

When one government can disable a frontier model worldwide overnight, dependency itself is the vulnerability.

The same architecture, applied to people: how duty of care under ISO 31030 collides with GDPR Article 9 — and why minimum disclosure is the resolution.

## — Sources & Citations

© 2026 Third Rail Systems OÜ · Tallinn, Estonia · Registry 17488655 · v1.1 · May 2026
