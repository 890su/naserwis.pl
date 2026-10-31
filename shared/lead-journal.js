// Server-only operational journal. Contact details must never go to GA4.
export async function storeJournal(data, env) {
  if (!env.JOURNAL_DB) return false;
  const submittedAt = data.submittedAt || new Date().toISOString();
  const contactIsEmail = data.phone.includes('@');
  const details = [data.message, data.requestType && `Request type: ${data.requestType}`,
    data.urgency && `Urgency: ${data.urgency}`, data.address && `Address: ${data.address}`].filter(Boolean).join('\n');
  const lead = {
    site_brand: 'NaSerwis', request_id: data.leadId, submitted_at: submittedAt,
    contact_name: data.name, phone: contactIsEmail ? '' : data.phone,
    email: contactIsEmail ? data.phone : '', service_id: data.attribution.service || data.intent || 'other',
    message: details, locale: data.lang,
    page_path: data.attribution.landing_page || '',
    attribution: {...data.attribution, form_id: data.formType},
  };
  await env.JOURNAL_DB.prepare(`INSERT INTO lead_journal
    (site_brand, request_id, submitted_at, payload_json, purge_after)
    VALUES (?, ?, ?, ?, ?) ON CONFLICT(site_brand, request_id) DO NOTHING`)
    .bind('NaSerwis', data.leadId, submittedAt, JSON.stringify(lead),
      new Date(Date.parse(submittedAt) + 180 * 86400000).toISOString()).run();
  return true;
}
