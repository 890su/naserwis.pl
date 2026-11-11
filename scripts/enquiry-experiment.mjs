// Keep assignment ahead of first paint and mount the selected form before
// the existing deferred validation and submission handlers attach.
function assignEnquiryVariant(endsAt, storageKey) {
  if (Date.now() >= Date.parse(endsAt)) return;
  const root = document.documentElement;
  try {
    const consent = JSON.parse(localStorage.getItem('naserwis_consent_v1'));
    const hasPreference = consent?.version === 1;
    if (hasPreference && !consent.analytics) return;
    const saved = hasPreference ? localStorage.getItem(storageKey) : null;
    const variant = ['simple', 'staged'].includes(saved)
      ? saved
      : Math.random() < 0.5 ? 'simple' : 'staged';
    if (hasPreference) localStorage.setItem(storageKey, variant);
    root.dataset.enquiryExperiment = variant;
    window.addEventListener('naserwis:consent', ({ detail }) => {
      try {
        if (!detail?.analytics) localStorage.removeItem(storageKey);
        else if (!localStorage.getItem(storageKey)) localStorage.setItem(storageKey, variant);
      } catch {
        // Storage can be blocked even when the form remains usable.
      }
    });
  } catch {
    // The standard form is already in the HTML if storage is unavailable.
  }
}

function mountEnquiryVariant(title, phoneLabel) {
  const form = document.currentScript.closest('form');
  const variant = document.documentElement.dataset.enquiryExperiment;
  if (!variant) return;
  form.dataset.enquiryVariant = variant;
  if (variant !== 'simple') return;

  const heading = form.querySelector('.enquiry-title');
  const problem = form.querySelector('.enquiry-problem');
  const message = form.elements.message;
  const phone = form.elements.phone;
  const contact = phone.closest('.form-group');
  const details = form.querySelector('.enquiry-details');
  const problemLabel = document.createElement('label');
  problemLabel.htmlFor = message.id;
  problemLabel.textContent = heading.textContent;
  heading.textContent = title;
  message.removeAttribute('aria-label');
  message.removeAttribute('aria-describedby');
  message.removeAttribute('placeholder');
  problem.querySelector('.contact-field-help').remove();
  problem.prepend(problemLabel);
  contact.querySelector('label').textContent = phoneLabel;
  contact.querySelector('.enquiry-hint').remove();
  phone.type = 'tel';
  phone.inputMode = 'tel';
  phone.autocomplete = 'tel';
  phone.maxLength = 60;
  phone.removeAttribute('placeholder');
  phone.removeAttribute('aria-describedby');
  form.insertBefore(contact, problem);
  form.querySelector('.enquiry-examples').remove();
  details.querySelectorAll('fieldset, .contact-next-step').forEach(element => element.remove());
  details.hidden = false;
  form.removeAttribute('data-staged-form');
  form.setAttribute('data-compact-form', '');
  form.addEventListener('reset', () => {
    details.querySelector('.enquiry-extras').open = false;
  });
}

// Fixed four-week collection window. The published staged form is the
// default after the test ends until a result is reviewed.
export const enquiryExperimentHead = `<script id="enquiry-experiment">(${assignEnquiryVariant})('2026-12-09T23:59:59+01:00', 'naserwis_enquiry_ab_v1');</script>`;
export const enquiryExperimentMount = (title, phone) =>
  `<script>(${mountEnquiryVariant})(${JSON.stringify(title)}, ${JSON.stringify(phone)});</script>`;
