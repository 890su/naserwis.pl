import { businessCopy } from './business-copy.mjs';

export const businessPath = (locale, slug = '') => `${locale === 'pl' ? '/' : `/${locale}/`}dla-firm/${slug ? `${slug}/` : ''}`;
export const audienceLabels = {
  pl: ['Usługi', 'Dla firm'], ru: ['Услуги', 'Для бизнеса'],
  uk: ['Послуги', 'Для бізнесу'], en: ['Services', 'For business']
};
export const menuAudienceLabels = audienceLabels;
export const businessLinks = Object.fromEntries(Object.entries(businessCopy).map(([locale, c]) => [locale, { label: c.hub.nav, url: businessPath(locale) }]));
export const businessServices = Object.fromEntries(Object.entries(businessCopy).map(([locale, c]) => [locale, Object.entries(c.services).map(([slug, service]) => [service.nav, slug])]));
export const businessMenuServices = businessServices;
