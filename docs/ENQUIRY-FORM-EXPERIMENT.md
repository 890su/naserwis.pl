# Enquiry form experiment

The experiment tests whether showing two required fields at once increases the share of visitors who send a successful enquiry. It covers the four localized homepages and the service pages that use the same in-page form.

| Variant | In-page form |
| --- | --- |
| A, simple | Phone and problem description, optional name and address in a collapsed section, and one submit button |
| B, staged | Published two-step form with examples, the start button, and the second step for contact and optional details |

Assignment is random with equal probabilities. A visitor can see either form on the first visit. After analytics consent, the browser saves the assignment for later eligible pages. Browsers with a saved decision to decline analytics use the existing staged form outside the measured experiment. Both forms use the current delivery endpoint and the existing Google Ads lead conversion.

| GA4 event | Meaning |
| --- | --- |
| `naserwis_ab_simple_view` | The simple form heading came into view with analytics consent |
| `naserwis_ab_staged_view` | The staged form heading came into view with analytics consent |
| `naserwis_ab_simple_lead` | The server acknowledged a simple-form submission |
| `naserwis_ab_staged_lead` | The server acknowledged a staged-form submission |

The primary metric is the share of measured users with an acknowledged in-page submission among users exposed to each form. In a GA4 Exploration use Total users for each event over the same date range and divide the lead users by the view users for the matching form. Use users rather than event totals to avoid double-counting repeat page views or submissions. Check group sizes and device and language mix, and monitor the existing successful enquiry and contact-channel events during the test.

Collect until 9 December 2026 at 23:59 Warsaw time. After that the site uses the staged form pending review. Report the sample sizes, rates, difference and a 95% confidence interval. A small sample or an interval compatible with meaningful effects in both directions is inconclusive.

The experiment sends only form identifiers and page context to GA4 after analytics consent. The browser tests intercept delivery and the Google tags. They check one existing Ads conversion on success, zero on failure, and the matching GA4 view and lead commands. Confirm collection in GA4 Events after real visitor traffic has accumulated.
