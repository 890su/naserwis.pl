/** Original circular contact UI with consent, keyboard and measurement fixes. */
(function () {
    'use strict';
    const container = document.querySelector('.fab-container');
    if (!container) return;
    const toggle = container.querySelector('.fab-toggle');
    const toggleLabel = toggle.getAttribute('aria-label');
    const menu = container.querySelector('.fab-menu');
    const fallback = container.querySelector('.contact-fallback');
    const status = container.querySelector('.contact-status');
    const invitation = container.querySelector('.contact-invitation');
    const quickModal = document.getElementById('quick-contact-modal');
    const mobileDock = document.querySelector('.mobile-contact-dock');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const invitationKey = 'naserwis-contact-invitation-dismissed-v3';
    let invitationDismissed = false;
    try { invitationDismissed = sessionStorage.getItem(invitationKey) === '1'; } catch (_error) { /* In-memory fallback. */ }
    let invitationTimer;
    let idleMotionTimer;
    let opener = toggle;
    let chatPending = false;
    let chatOpen = false;
    let chatTimer;
    let updateQueued = false;
    let menuOpen = false;
    let quickModalOpener = null;
    let previousBodyOverflow = '';
    const quickModalBackground = new Map();

    const language = (document.documentElement.lang || 'pl').split('-')[0];
    const chatErrors = {
        pl: 'Czat jest chwilowo niedostępny. Wybierz WhatsApp, telefon lub formularz.',
        ru: 'Чат временно недоступен. Выберите WhatsApp, телефон или форму заявки.',
        uk: 'Чат тимчасово недоступний. Виберіть WhatsApp, телефон або форму заявки.',
        en: 'Chat is temporarily unavailable. Please use WhatsApp, phone or the form.'
    };

    function track(event, detail = {}) {
        window.dispatchEvent(new CustomEvent('naserwis:ui-event', { detail: { event, ...detail } }));
    }

    function setOpen(open, source = toggle, restoreFocus = false) {
        const wasOpen = menuOpen;
        menuOpen = open;
        if (open) opener = source;
        container.classList.toggle('open', open);
        menu.inert = !open;
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? toggle.dataset.closeLabel : toggleLabel);
        if (!open) fallback.hidden = true;
        if (open) {
            pauseMotion();
            dismissInvitation();
            track('naserwis_contact_open', { placement: 'floating' });
            menu.querySelector('a, button')?.focus({ preventScroll: true });
        } else {
            if (restoreFocus && opener?.offsetParent !== null) opener?.focus({ preventScroll: true });
            if (wasOpen) queueIdleMotion();
        }
    }

    toggle.addEventListener('click', () => setOpen(!menuOpen, toggle));
    invitation.querySelector('[data-contact-invite]').addEventListener('click', () => setOpen(true));
    invitation.querySelector('[data-contact-dismiss]').addEventListener('click', () => {
        dismissInvitation();
        toggle.focus({ preventScroll: true });
    });
    menu.inert = true;
    document.addEventListener('click', (event) => {
        if (!container.contains(event.target)) setOpen(false);
        if (event.target.closest('.fab-menu a, .contact-form-link')) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !invitation.hidden) dismissInvitation();
        if (event.key === 'Escape' && menuOpen) {
            event.preventDefault();
            setOpen(false, opener, true);
        }
    });
    document.addEventListener('focusin', (event) => {
        if (menuOpen && !container.contains(event.target)) setOpen(false);
        scheduleUpdate();
    });
    document.addEventListener('focusout', scheduleUpdate);

    function inView(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return rect.height > 0 && rect.top < innerHeight && rect.bottom > 0;
    }
    function consentVisible() { return document.getElementById('consent-dialog')?.hidden === false; }
    function consentSettingsVisible() {
        const dialog = document.getElementById('consent-dialog');
        return dialog?.hidden === false && dialog.classList.contains('consent-overlay-settings');
    }

    function stopMotion() {
        toggle.classList.remove('contact-attention');
    }
    function pauseMotion() {
        clearTimeout(idleMotionTimer);
        idleMotionTimer = undefined;
        stopMotion();
    }
    function queueIdleMotion() {
        clearTimeout(idleMotionTimer);
        stopMotion();
        if (reducedMotion.matches || menuOpen || container.dataset.suppressed === 'true' || document.hidden) return;
        idleMotionTimer = setTimeout(() => {
            idleMotionTimer = undefined;
            if (reducedMotion.matches || menuOpen || container.dataset.suppressed === 'true' || document.hidden) return;
            toggle.classList.add('contact-attention');
        }, 2500);
    }
    function pauseInvitation() {
        clearTimeout(invitationTimer);
        invitationTimer = undefined;
        invitation.hidden = true;
    }
    function dismissInvitation() {
        invitationDismissed = true;
        try { sessionStorage.setItem(invitationKey, '1'); } catch (_error) { /* Session preference only. */ }
        pauseInvitation();
    }
    function queueInvitation() {
        if (invitationDismissed || invitationTimer || !invitation.hidden || menuOpen || document.hidden) return;
        invitationTimer = setTimeout(() => {
            invitationTimer = undefined;
            if (container.dataset.suppressed === 'true' || menuOpen || document.hidden) return;
            invitation.hidden = false;
            observeImpressions();
        }, 6000);
    }
    container.addEventListener('pointerenter', pauseMotion);
    container.addEventListener('pointerleave', scheduleUpdate);
    container.addEventListener('focusin', pauseMotion);
    container.addEventListener('focusout', scheduleUpdate);
    reducedMotion.addEventListener('change', scheduleUpdate);
    document.addEventListener('visibilitychange', scheduleUpdate);

    function update() {
        updateQueued = false;
        const modal = document.querySelector('.mobile-menu-overlay.active, #review-modal.active, #quick-contact-modal:not([hidden])');
        const initialConsent = consentVisible() && !consentSettingsVisible();
        const panelHeight = initialConsent ? document.querySelector('.consent-panel')?.getBoundingClientRect().height || 0 : 0;
        const dockHeight = !initialConsent && mobileDock && getComputedStyle(mobileDock).display !== 'none' ? mobileDock.getBoundingClientRect().height : 0;
        if (initialConsent && panelHeight) container.style.bottom = `${Math.ceil(panelHeight + 24)}px`;
        else if (dockHeight) container.style.bottom = `${Math.ceil(dockHeight + 16)}px`;
        else container.style.removeProperty('bottom');
        const suppressed = consentSettingsVisible() || Boolean(modal) || chatOpen || document.hidden;
        container.dataset.suppressed = String(suppressed);
        if (suppressed) {
            setOpen(false);
            pauseInvitation();
            pauseMotion();
        } else {
            if (initialConsent) pauseInvitation();
            else queueInvitation();
            queueIdleMotion();
        }
        observeImpressions();
    }
    function scheduleUpdate() {
        if (!updateQueued) { updateQueued = true; requestAnimationFrame(update); }
    }
    addEventListener('scroll', () => {
        pauseMotion();
        scheduleUpdate();
    }, { passive: true });
    addEventListener('resize', scheduleUpdate);
    window.visualViewport?.addEventListener('resize', scheduleUpdate);
    window.addEventListener('naserwis:consent-ui', () => {
        if (!consentVisible() && !window.NASERWIS_CONSENT?.get()?.support) chatPending = false;
        update();
    });
    // Consent is built on DOMContentLoaded. Measure again after its panel has
    // participated in layout so the circular launcher clears the full banner.
    document.addEventListener('DOMContentLoaded', update);
    const consentPanelObserver = new ResizeObserver(scheduleUpdate);
    function observeConsentPanel() {
        const panel = document.querySelector('.consent-panel');
        if (panel) consentPanelObserver.observe(panel);
    }
    window.addEventListener('naserwis:consent-ui', observeConsentPanel);
    document.addEventListener('DOMContentLoaded', observeConsentPanel);
    const modalObserver = new MutationObserver(scheduleUpdate);
    document.querySelectorAll('.mobile-menu-overlay, #review-modal, #quick-contact-modal').forEach(element => modalObserver.observe(element, { attributes: true, attributeFilter: ['class', 'hidden'] }));

    function setQuickModalBackground(inert) {
        if (inert) {
            [...document.body.children].forEach(element => {
                if (element === quickModal || element.tagName === 'SCRIPT') return;
                quickModalBackground.set(element, element.inert);
                element.inert = true;
            });
        } else {
            quickModalBackground.forEach((value, element) => { element.inert = value; });
            quickModalBackground.clear();
        }
    }
    function closeQuickModal() {
        if (!quickModal || quickModal.hidden) return;
        quickModal.hidden = true;
        document.body.classList.remove('quick-contact-open');
        document.body.style.overflow = previousBodyOverflow;
        setQuickModalBackground(false);
        const restore = quickModalOpener;
        quickModalOpener = null;
        if (restore?.offsetParent !== null) restore.focus({ preventScroll: true });
        scheduleUpdate();
    }
    function openQuickModal(source) {
        if (!quickModal) return false;
        setOpen(false);
        quickModalOpener = source?.closest('.fab-menu') ? toggle : source || document.activeElement;
        previousBodyOverflow = document.body.style.overflow;
        quickModal.hidden = false;
        document.body.classList.add('quick-contact-open');
        document.body.style.overflow = 'hidden';
        setQuickModalBackground(true);
        requestAnimationFrame(() => quickModal.querySelector('.quick-contact-close')?.focus({ preventScroll: true }));
        scheduleUpdate();
        return true;
    }
    quickModal?.addEventListener('click', event => {
        if (event.target.closest('[data-quick-contact-close]')) closeQuickModal();
    });
    document.addEventListener('keydown', event => {
        if (!quickModal || quickModal.hidden) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            closeQuickModal();
            return;
        }
        if (event.key !== 'Tab') return;
        const focusable = [...quickModal.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled])')]
            .filter(element => element.offsetParent !== null);
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
    });

    function failChat() {
        if (!chatPending) return;
        chatPending = false;
        status.textContent = chatErrors[language] || chatErrors.pl;
        setOpen(true, opener);
        fallback.hidden = false;
        track('naserwis_chat_error', { placement: 'floating' });
    }
    function openChat() {
        if (!chatPending || !window.NASERWIS_CONSENT?.get()?.support) return;
        if (window.$chatwoot) {
            try {
                window.$chatwoot.toggle('open');
                chatPending = false;
                clearTimeout(chatTimer);
                setOpen(false);
                // Only count an actual SDK-open call, never the consent request.
                window.dispatchEvent(new CustomEvent('naserwis:chat-opened'));
                chatOpen = true;
                scheduleUpdate();
            } catch (_error) { failChat(); }
        } else {
            clearTimeout(chatTimer);
            chatTimer = setTimeout(failChat, 12000);
        }
    }
    container.querySelector('.fab-chat')?.addEventListener('click', () => {
        status.textContent = '';
        chatPending = true;
        setOpen(false);
        if (window.NASERWIS_CONSENT?.requestSupport()) openChat();
        else if (!window.NASERWIS_CONSENT) failChat();
    });
    window.addEventListener('chatwoot:ready', openChat);
    window.addEventListener('chatwoot:closed', () => { chatOpen = false; scheduleUpdate(); });
    window.addEventListener('naserwis:consent', (event) => {
        if (event.detail.support) openChat();
        else { chatPending = false; chatOpen = false; clearTimeout(chatTimer); window.$chatwoot?.toggle('close'); }
        scheduleUpdate();
    });

    // Exposure is counted only when analytics consent exists and the control is
    // actually visible (not underneath the consent UI). No retroactive events.
    const seen = new WeakSet();
    const ctas = [...document.querySelectorAll('a[href="#contact"], .fab-toggle, [data-contact-invite], [data-contact-modal]')];
    function placement(element) {
        if (element.closest('.mobile-contact-dock')) return 'sticky';
        if (element.closest('.fab-container')) return 'floating';
        if (element.closest('.contact-checkpoint')) return 'checkpoint';
        return 'content';
    }
    function observeImpressions() {
        if (!window.NASERWIS_CONSENT?.get()?.analytics || consentVisible()) return;
        ctas.forEach(element => {
            if (seen.has(element) || !inView(element) || getComputedStyle(element).visibility === 'hidden') return;
            if (element.closest('.fab-container') && container.dataset.suppressed === 'true') return;
            if (element.closest('.fab-menu') && !menuOpen) return;
            seen.add(element);
            const action = element.matches('a[href="#contact"], [data-contact-modal]') ? 'form' : element.matches('.fab-toggle, button') ? 'contact_menu' : element.getAttribute('href')?.startsWith('tel:') ? 'phone' : 'form';
            track('naserwis_cta_view', { placement: placement(element), action });
        });
    }
    document.addEventListener('click', (event) => {
        const target = event.target.closest('a[href="#contact"], [data-contact-modal]');
        if (!target) return;
        event.preventDefault();
        track('naserwis_cta_click', { placement: placement(target), action: 'form' });
        openQuickModal(target);
    });
    scheduleUpdate();
})();
