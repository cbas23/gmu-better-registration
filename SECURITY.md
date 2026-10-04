# Security and Privacy Policy

Effective date: August 17, 2026  
Last updated: August 17, 2026

This policy applies to the Better GMU Registration browser extension. The
extension improves registration tables on George Mason University's Student
Registration SSB website and retrieves public professor information from
RateMyProfessors.

Better GMU Registration is an independent project. It is not affiliated with,
endorsed by, or operated by George Mason University or RateMyProfessors.

## Information the extension handles

The extension reads information already displayed in GMU registration tables,
including instructor names, course and meeting details, seat and waitlist
status, schedule types, course attributes, and section notes. This information
is used locally in the browser to enhance the presentation of those tables.

The extension does not read or collect GMU passwords, authentication cookies,
student identification numbers, payment information, or form entries.

## Information sent to RateMyProfessors

To provide the professor-rating feature, the extension sends an instructor's
displayed name and George Mason University's public school identifier to the
RateMyProfessors GraphQL service. RateMyProfessors returns public professor
profile and rating information. No course selections, registration history,
GMU credentials, or user identity are included in these requests.

These requests are sent directly from the extension to RateMyProfessors over
HTTPS. Like other internet services, RateMyProfessors may automatically receive
technical request information such as the user's IP address and browser user
agent. RateMyProfessors handles that information under its own policies; this
project does not control its retention or use.

## Storage and retention

Professor matches are cached only in memory by the extension to avoid repeated
lookups while the registration page is open. The cache is discarded when the
content-script context ends. The extension does not use browser storage,
cookies, or a developer-operated server to retain registration-table data.

The developer does not receive or retain the registration-table information
processed by the extension.

## Analytics, advertising, and data sales

The extension does not include analytics or advertising, track browsing across
websites, create user profiles, or sell user data. Information is not shared
with third parties except for the instructor-name lookup sent to
RateMyProfessors as described above.

## Permissions

The extension runs only on George Mason University's Student Registration SSB
pages so it can read and enhance their registration tables. It requests access
to `https://www.ratemyprofessors.com/*` only so its background service worker
can retrieve professor ratings. It does not request access to all websites,
browsing history, tabs, cookies, downloads, or browser storage.

## Data-use commitment

The extension uses website content only to provide its disclosed table
enhancements and professor-rating feature. Its use and transfer of information
received from Chrome APIs adheres to the Chrome Web Store User Data Policy,
including the Limited Use requirements.

## User choices

Users can stop all processing and requests by disabling or uninstalling the
extension. Removing the extension deletes the extension and ends any in-memory
cache maintained by it.

## Changes to this policy

Material changes to the extension's data practices will be described in an
updated version of this policy and reflected in the applicable browser-extension
store disclosures before the changed behavior is released.

## Reporting a security or privacy issue

Please do not disclose suspected vulnerabilities in a public issue. Use the
repository's private **Report a vulnerability** form instead:

<https://github.com/cbas23/gmu-better-registration/security/advisories/new>

Include the affected extension version, browser, reproduction steps, and the
potential impact. Privacy questions that do not contain sensitive details may
be submitted through the repository's issue tracker.
