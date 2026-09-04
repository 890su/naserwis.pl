/**
 * NaSerwis.pl consent management and Google Consent Mode v2.
 * This file must load before Google tags on every page.
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'naserwis_consent_v1';
    const POLICY_VERSION = 1;
    let memoryConsent = null;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

    const denied = {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        functionality_storage: 'denied',
        personalization_storage: 'denied',
        security_storage: 'granted',
        wait_for_update: 500
    };

    function readConsent() {
        try {
            const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return value && value.version === POLICY_VERSION ? value : memoryConsent;
        } catch (_error) {
            return memoryConsent;
        }
    }

    function googleConsent(preferences) {
        return {
            analytics_storage: preferences.analytics ? 'granted' : 'denied',
            ad_storage: preferences.marketing ? 'granted' : 'denied',
            ad_user_data: preferences.marketing ? 'granted' : 'denied',
            ad_personalization: preferences.marketing ? 'granted' : 'denied',
            functionality_storage: preferences.support ? 'granted' : 'denied',
            personalization_storage: preferences.support ? 'granted' : 'denied',
            security_storage: 'granted'
        };
    }

    const initialConsent = readConsent();
    window.gtag('consent', 'default', initialConsent ? googleConsent(initialConsent) : denied);
    window.gtag('set', 'ads_data_redaction', true);
    window.gtag('set', 'url_passthrough', true);

    const TEXT = {
        pl: {
            eyebrow: 'Prywatność pod kontrolą',
            title: 'Twoja prywatność',
            intro: 'Używamy niezbędnych technologii do działania strony. Analitykę, reklamę i czat uruchamiamy zgodnie z Twoim wyborem.',
            accept: 'Akceptuję wszystkie', reject: 'Odrzucam opcjonalne', settings: 'Ustawienia', save: 'Zapisz wybór',
            close: 'Zamknij i pozostaw tylko niezbędne',
            changeAnytime: 'Wybór możesz zmienić w dowolnej chwili w stopce strony.',
            alwaysOn: 'Zawsze aktywne',
            necessary: 'Niezbędne', necessaryDesc: 'Bezpieczeństwo, formularze i zapis ustawień prywatności.',
            analytics: 'Analityka', analyticsDesc: 'Pomaga nam mierzyć korzystanie ze strony i skuteczność formularzy.',
            marketing: 'Reklama', marketingDesc: 'Pomiar reklam Google i personalizacja reklam.',
            support: 'Czat', supportDesc: 'Uruchamia zewnętrzny czat pomocy Chatwoot.',
            privacy: 'Polityka prywatności', cookies: 'Polityka cookies', manage: 'Ustawienia prywatności'
        },
        ru: {
            eyebrow: 'Конфиденциальность под контролем',
            title: 'Ваша конфиденциальность',
            intro: 'Мы используем необходимые технологии для работы сайта. Аналитика, реклама и чат включаются в соответствии с вашим выбором.',
            accept: 'Принять все', reject: 'Отклонить необязательные', settings: 'Настроить', save: 'Сохранить выбор',
            close: 'Закрыть и оставить только необходимые',
            changeAnytime: 'Выбор можно изменить в любой момент через ссылку внизу сайта.',
            alwaysOn: 'Всегда включены',
            necessary: 'Необходимые', necessaryDesc: 'Безопасность, формы и сохранение настроек конфиденциальности.',
            analytics: 'Аналитика', analyticsDesc: 'Помогает измерять использование сайта и эффективность форм.',
            marketing: 'Реклама', marketingDesc: 'Измерение рекламы Google и персонализация объявлений.',
            support: 'Чат', supportDesc: 'Включает внешний чат поддержки Chatwoot.',
            privacy: 'Политика конфиденциальности', cookies: 'Политика cookies', manage: 'Настройки конфиденциальности'
        },
        uk: {
            eyebrow: 'Конфіденційність під контролем',
            title: 'Ваша конфіденційність',
            intro: 'Ми використовуємо необхідні технології для роботи сайту. Аналітика, реклама та чат вмикаються відповідно до вашого вибору.',
            accept: 'Прийняти все', reject: 'Відхилити необов’язкові', settings: 'Налаштувати', save: 'Зберегти вибір',
            close: 'Закрити й залишити лише необхідні',
            changeAnytime: 'Вибір можна змінити будь-коли через посилання внизу сайту.',
            alwaysOn: 'Завжди активні',
            necessary: 'Необхідні', necessaryDesc: 'Безпека, форми та збереження налаштувань конфіденційності.',
            analytics: 'Аналітика', analyticsDesc: 'Допомагає вимірювати використання сайту та ефективність форм.',
            marketing: 'Реклама', marketingDesc: 'Вимірювання реклами Google і персоналізація оголошень.',
            support: 'Чат', supportDesc: 'Вмикає зовнішній чат підтримки Chatwoot.',
            privacy: 'Політика конфіденційності', cookies: 'Політика cookies', manage: 'Налаштування конфіденційності'
        },
        en: {
            eyebrow: 'Privacy under your control',
            title: 'Your privacy',
            intro: 'We use essential technologies to operate the site. Analytics, advertising and chat are enabled according to your choice.',
            accept: 'Accept all', reject: 'Reject optional', settings: 'Customise', save: 'Save choice',
            close: 'Close and keep only necessary',
            changeAnytime: 'You can change your choice at any time from the site footer.',
            alwaysOn: 'Always active',
            necessary: 'Necessary', necessaryDesc: 'Security, forms and storing your privacy settings.',
            analytics: 'Analytics', analyticsDesc: 'Helps us measure site usage and form effectiveness.',
            marketing: 'Advertising', marketingDesc: 'Google Ads measurement and ad personalisation.',
            support: 'Chat', supportDesc: 'Enables the external Chatwoot support chat.',
            privacy: 'Privacy policy', cookies: 'Cookie policy', manage: 'Privacy settings'
        }
    };

    function currentLanguage() {
        const language = (document.documentElement.lang || 'pl').toLowerCase().split('-')[0];
        return TEXT[language] ? language : 'pl';
    }

    function policyUrl(type, language) {
        const prefix = language === 'pl' ? '' : '/' + language;
        return prefix + '/' + type;
    }

    function loadChatwoot() {
        if (window.$chatwoot || document.querySelector('script[data-chatwoot-loader]')) return;
        const config = window.NASERWIS_CONFIG || {};
        if (!config.chatwootBaseUrl || !config.chatwootWebsiteToken) return;

        window.chatwootSettings = { hideMessageBubble: true };
        const loader = document.createElement('script');
        loader.src = config.chatwootBaseUrl + '/packs/js/sdk.js';
        loader.async = true;
        loader.dataset.chatwootLoader = 'true';
        loader.addEventListener('load', function () {
            window.chatwootSDK.run({
                websiteToken: config.chatwootWebsiteToken,
                baseUrl: config.chatwootBaseUrl
            });
        });
        document.head.appendChild(loader);
    }

    function applyConsent(preferences, persist) {
        const value = {
            version: POLICY_VERSION,
            analytics: Boolean(preferences.analytics),
            marketing: Boolean(preferences.marketing),
            support: Boolean(preferences.support),
            updatedAt: new Date().toISOString()
        };

        memoryConsent = value;
        if (persist) {
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch (_error) { /* Contact must work with storage disabled. */ }
        }
        window.gtag('consent', 'update', googleConsent(value));
        if (value.support) loadChatwoot();
        window.dispatchEvent(new CustomEvent('naserwis:consent', { detail: value }));
        return value;
    }

    function buildConsentDialog() {
        if (document.getElementById('consent-dialog')) return;
        const language = currentLanguage();
        const t = TEXT[language];
        const saved = readConsent();

        const overlay = document.createElement('div');
        overlay.id = 'consent-dialog';
        overlay.className = 'consent-overlay';
        overlay.hidden = true;
        overlay.innerHTML = `
            <section class="consent-panel" role="dialog" aria-modal="true" aria-labelledby="consent-title" aria-describedby="consent-description">
                <header class="consent-heading">
                    <span class="consent-mark" aria-hidden="true">
                        <svg viewBox="0 0 48 48" role="img"><path d="M24 4 40 10v11c0 10.8-6.6 19-16 23-9.4-4-16-12.2-16-23V10L24 4Z"/><circle cx="24" cy="21" r="4"/><path d="M24 25v8M16 17h4m8 0h4"/></svg>
                    </span>
                    <div class="consent-heading-copy">
                        <span class="consent-eyebrow">${t.eyebrow}</span>
                        <h2 id="consent-title">${t.title}</h2>
                    </div>
                    <button type="button" class="consent-close" aria-label="${t.close}" title="${t.close}">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg>
                    </button>
                </header>
                <div class="consent-summary">
                    <p id="consent-description">${t.intro}</p>
                    <p class="consent-policy-links"><a href="${policyUrl('privacy', language)}">${t.privacy}</a><span aria-hidden="true">·</span><a href="${policyUrl('cookies', language)}">${t.cookies}</a></p>
                </div>
                <div class="consent-options" hidden>
                    <div class="consent-option consent-option-locked">
                        <span><strong>${t.necessary}</strong><small>${t.necessaryDesc}</small></span>
                        <span class="consent-always-on">${t.alwaysOn}</span>
                    </div>
                    <label class="consent-option"><span><strong>${t.analytics}</strong><small>${t.analyticsDesc}</small></span><input type="checkbox" name="analytics" role="switch"><i aria-hidden="true"></i></label>
                    <label class="consent-option"><span><strong>${t.marketing}</strong><small>${t.marketingDesc}</small></span><input type="checkbox" name="marketing" role="switch"><i aria-hidden="true"></i></label>
                    <label class="consent-option"><span><strong>${t.support}</strong><small>${t.supportDesc}</small></span><input type="checkbox" name="support" role="switch"><i aria-hidden="true"></i></label>
                </div>
                <p class="consent-change-note">
                    <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5a7.5 7.5 0 1 0 7.5 7.5A7.5 7.5 0 0 0 10 2.5Zm0 4v4.25m0 2.75h.01"/></svg>
                    ${t.changeAnytime}
                </p>
                <div class="consent-actions">
                    <button type="button" class="consent-button consent-button-muted consent-customise">${t.settings}</button>
                    <button type="button" class="consent-button consent-button-outline consent-reject">${t.reject}</button>
                    <button type="button" class="consent-button consent-button-primary consent-accept">${t.accept}</button>
                    <button type="button" class="consent-button consent-button-primary consent-save" hidden>${t.save}</button>
                </div>
            </section>`;
        document.body.appendChild(overlay);

        const options = overlay.querySelector('.consent-options');
        const customise = overlay.querySelector('.consent-customise');
        const save = overlay.querySelector('.consent-save');
        const closeButton = overlay.querySelector('.consent-close');
        const panel = overlay.querySelector('.consent-panel');
        const backgroundState = new Map();
        let previouslyFocused = null;

        function modalMode(active) {
            document.body.classList.toggle('consent-open', active);
            panel.setAttribute('aria-modal', String(active));
            panel.setAttribute('role', active ? 'dialog' : 'region');
            if (active) {
                Array.from(document.body.children).forEach(function (element) {
                    if (element === overlay || ['SCRIPT', 'STYLE'].includes(element.tagName)) return;
                    if (!backgroundState.has(element)) backgroundState.set(element, element.inert);
                    element.inert = true;
                });
                window.requestAnimationFrame(function () { closeButton.focus(); });
            } else {
                backgroundState.forEach(function (inert, element) { element.inert = inert; });
                backgroundState.clear();
            }
        }

        function notifyVisibility() {
            window.dispatchEvent(new CustomEvent('naserwis:consent-ui', {
                detail: { visible: !overlay.hidden, settings: overlay.classList.contains('consent-overlay-settings') }
            }));
        }

        function setChecks(value) {
            overlay.querySelector('[name="analytics"]').checked = Boolean(value && value.analytics);
            overlay.querySelector('[name="marketing"]').checked = Boolean(value && value.marketing);
            overlay.querySelector('[name="support"]').checked = Boolean(value && value.support);
        }

        function close() {
            overlay.hidden = true;
            overlay.classList.remove('consent-overlay-settings');
            modalMode(false);
            document.removeEventListener('keydown', onKeydown);
            if (previouslyFocused && previouslyFocused !== document.body && previouslyFocused.offsetParent !== null && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
            notifyVisibility();
        }

        function show(customiseImmediately) {
            previouslyFocused = document.activeElement;
            setChecks(readConsent());
            options.hidden = !customiseImmediately;
            customise.hidden = Boolean(customiseImmediately);
            save.hidden = !customiseImmediately;
            overlay.querySelector('.consent-accept').hidden = Boolean(customiseImmediately);
            overlay.classList.toggle('consent-overlay-settings', Boolean(customiseImmediately));
            overlay.hidden = false;
            modalMode(Boolean(customiseImmediately));
            document.addEventListener('keydown', onKeydown);
            notifyVisibility();
        }

        function closeWithNecessary() {
            if (!readConsent()) applyConsent({ analytics: false, marketing: false, support: false }, true);
            close();
        }

        function onKeydown(event) {
            // The initial banner never traps focus or intercepts page shortcuts.
            if (!overlay.classList.contains('consent-overlay-settings')) return;
            if (event.key === 'Escape') {
                event.preventDefault();
                closeWithNecessary();
                return;
            }
            if (event.key !== 'Tab') return;
            const focusable = Array.from(overlay.querySelectorAll('a[href], button:not([hidden]), input:not([disabled])'))
                .filter(function (element) { return element.offsetParent !== null; });
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }

        overlay.querySelector('.consent-accept').addEventListener('click', function () {
            applyConsent({ analytics: true, marketing: true, support: true }, true);
            close();
        });
        overlay.querySelector('.consent-reject').addEventListener('click', function () {
            applyConsent({ analytics: false, marketing: false, support: false }, true);
            close();
        });
        customise.addEventListener('click', function () {
            options.hidden = false;
            customise.hidden = true;
            save.hidden = false;
            overlay.querySelector('.consent-accept').hidden = true;
            overlay.classList.add('consent-overlay-settings');
            modalMode(true);
            notifyVisibility();
        });
        save.addEventListener('click', function () {
            applyConsent({
                analytics: overlay.querySelector('[name="analytics"]').checked,
                marketing: overlay.querySelector('[name="marketing"]').checked,
                support: overlay.querySelector('[name="support"]').checked
            }, true);
            close();
        });
        closeButton.addEventListener('click', closeWithNecessary);

        document.querySelectorAll('[data-consent-settings]').forEach(function (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                show(true);
            });
        });

        window.NASERWIS_CONSENT = {
            get: readConsent,
            open: function () { show(true); },
            requestSupport: function () {
                const value = readConsent();
                if (value && value.support) {
                    loadChatwoot();
                    return true;
                }
                show(true);
                return false;
            }
        };

        if (!saved) show(false);
        if (saved && saved.support) loadChatwoot();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildConsentDialog);
    } else {
        buildConsentDialog();
    }
})();
