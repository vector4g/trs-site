What we secure, what we retain, what we refuse to hold, and how to reach us if you find something wrong. Every statement on this page is checkable by you, from your own browser or a linked document, without asking us anything. That is deliberate: it is the same standard our architecture is built to, applied to ourselves.

## The design premise {#the-design-premise}

Our security posture starts from an architectural decision rather than a control list: the platform is built so that special-category personal data is not centrally retained in the first place. Attributes meet the risk layer transiently during assessment and are purged before output; what persists is proof that assessment occurred. A system cannot leak, be compelled to produce, or be breached for records it does not hold. The full architecture is documented in the [whitepaper](/beyond-disclosure) and its source library. The controls below protect everything that remains.

## What we retain, and what we refuse to {#what-we-retain}

This website does not require accounts, does not set marketing or tracking cookies by default, and does not run third-party advertising or profiling scripts. The pilot intake form asks for name, corporate email, and role, processed solely to evaluate pilot fit, and requests no special-category data; that statement appears on [the form itself](/#contact). Retention, purposes, and rights are set out in the [privacy policy](/legal/privacy). The Exposure Check self-assessment runs without analytics by design.

## Transport and browser security {#transport-and-browser-security}

The site is served exclusively over HTTPS. A Content Security Policy is enforced that does not permit inline scripts or dynamic code evaluation, which materially limits what an injected script could ever do. You can verify the policy yourself: view the source of any page and read the Content-Security-Policy declaration in the document head. We state the delivery mechanism precisely because it matters: the policy is currently declared in the page rather than sent as a response header, which is a constraint of our static hosting, and header delivery is the stronger form. It moves to a response header when the hosting configuration permits, and this page will record the change. We consider a security posture you have to take on trust to be a contradiction in terms.

## Application controls {#application-controls}

Administrative access is protected by login lockout with rate limiting; repeated failed attempts receive a standard 429 response with a declared retry interval. Server-side request handling includes guards against server-side request forgery on any endpoint that fetches external resources. Cross-origin access is restricted to an explicit allowlist; the deployment process fails closed if the allowlist is misconfigured, rather than defaulting open. Input handling escapes user-supplied patterns to prevent regular-expression denial of service.

## Reporting a vulnerability {#reporting-a-vulnerability}

We publish a [security.txt](/.well-known/security.txt) file under RFC 9116 at /.well-known/security.txt, with a monitored contact address and a declared expiry we renew. If you find a vulnerability, we want to hear about it through that channel, and we will respond. Good-faith security research conducted through responsible disclosure will not be met with legal threats; it will be met with thanks and, where the finding warrants it, public credit if you want it.

## What we do not claim {#what-we-do-not-claim}

We hold no third-party security certification at this stage, and this page does not imply one. Our venture readiness has been assessed under KTH Royal Institute of Technology's Innovation Readiness Level framework; [the report is public](/assets/kth-irl-evidence-report-third-rail-systems.docx), describes its own methodology, and assesses venture readiness, not security controls. When our certification posture changes, this page will change, with its dateModified updated. A security page that overstates is a security incident waiting for an audience; this one is written to be checked.

## Corrections {#corrections}

If any statement on this page does not match what you observe in production, that is a reportable finding like any other: tell us through the security.txt contact and we will correct the page publicly, consistent with the [corrections policy](/beyond-disclosure/sources) that governs our published claims.
