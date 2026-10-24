// Progressive enquiry: typing never moves focus or scrolls the page.
(() => {
    'use strict';
    // Owner-requested motion exception: these examples animate even with reduced motion.
    document.querySelectorAll('[data-staged-form]').forEach(form => {
        const message = form.elements.message;
        const details = form.querySelector('.enquiry-details');
        const examples = form.querySelector('.enquiry-examples');
        const list = form.querySelector('.enquiry-example-list');
        const pause = form.querySelector('[data-examples-pause]');
        const all = form.querySelector('[data-examples-all]');
        let expanded = false;
        let paused = false;
        let interacting = false;
        let visible = false;
        let frame = 0;
        let lastTime = 0;
        let offset = 0;
        let typingTimer = 0;
        let selectedText = '';
        function cancelTyping() { clearTimeout(typingTimer); typingTimer = 0; form.removeAttribute('data-typing-example'); }
        function finishTyping() {
            if (!typingTimer) return;
            cancelTyping();
            message.value = selectedText;
            message.dispatchEvent(new Event('input', { bubbles: true }));
        }
        // A second visual pass makes the loop seamless; it stays out of the tab order.
        const originalItems = [...list.children];
        originalItems.forEach(item => {
            const clone = item.cloneNode(true);
            clone.dataset.exampleClone = '';
            clone.tabIndex = -1;
            clone.setAttribute('aria-hidden', 'true');
            list.append(clone);
        });
        const clones = [...list.querySelectorAll('[data-example-clone]')];
        function stop() { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
        function animate(time) {
            const loopHeight = clones[0].offsetTop - originalItems[0].offsetTop;
            if (lastTime && loopHeight > 0) offset = (offset + Math.min(time - lastTime, 50) * .024) % loopHeight;
            lastTime = time;
            list.scrollTop = offset;
            frame = requestAnimationFrame(animate);
        }
        function updateMotion() {
            stop();
            pause.hidden = expanded;
            clones.forEach(item => { item.hidden = expanded; });
            if (visible && !paused && !interacting && !expanded && !examples.hidden && !document.hidden) frame = requestAnimationFrame(animate);
        }
        function reveal() {
            const hasDescription = message.value.trim().length > 0;
            // Once opened, preserve contact fields even if the description is edited away.
            if (hasDescription) details.hidden = false;
            examples.hidden = hasDescription || Boolean(typingTimer);
            updateMotion();
        }
        list.addEventListener('click', event => {
            const example = event.target.closest('[data-enquiry-example]');
            if (!example) return;
            cancelTyping();
            selectedText = example.textContent;
            details.hidden = false;
            examples.hidden = true;
            updateMotion();
            message.value = '';
            form.setAttribute('data-typing-example', 'true');
            message.focus({ preventScroll: true });
            let length = 0;
            function typeNext() {
                message.value = selectedText.slice(0, ++length);
                message.dispatchEvent(new Event('input', { bubbles: true }));
                message.style.height = 'auto';
                message.style.height = Math.max(108, message.scrollHeight) + 'px';
                message.setSelectionRange(message.value.length, message.value.length);
                if (length < selectedText.length) typingTimer = setTimeout(typeNext, 28);
                else cancelTyping();
            }
            typingTimer = setTimeout(typeNext, 28);
        });
        // Manual editing takes over immediately; submitting early finishes the selected text.
        message.addEventListener('beforeinput', cancelTyping);
        message.addEventListener('pointerdown', cancelTyping);
        form.addEventListener('submit', finishTyping, true);
        message.addEventListener('input', reveal);
        pause.addEventListener('click', () => {
            paused = !paused;
            pause.setAttribute('aria-pressed', String(paused));
            pause.textContent = paused ? pause.dataset.resume : pause.dataset.pause;
            updateMotion();
        });
        all.addEventListener('click', () => {
            expanded = !expanded;
            list.classList.toggle('enquiry-show-all', expanded);
            all.setAttribute('aria-expanded', String(expanded));
            all.textContent = expanded ? all.dataset.less : all.dataset.all;
            offset = list.scrollTop = 0;
            updateMotion();
        });
        list.addEventListener('pointerenter', () => { interacting = true; updateMotion(); });
        list.addEventListener('pointerleave', () => { interacting = list.contains(document.activeElement); updateMotion(); });
        list.addEventListener('focusin', () => { interacting = true; updateMotion(); });
        list.addEventListener('focusout', event => { interacting = list.contains(event.relatedTarget); updateMotion(); });
        // Manual scrolling pauses the automatic movement until the visitor resumes it.
        function manualScroll() {
            paused = true;
            pause.setAttribute('aria-pressed', 'true');
            pause.textContent = pause.dataset.resume;
            offset = list.scrollTop;
            updateMotion();
        }
        list.addEventListener('wheel', manualScroll, { passive: true });
        list.addEventListener('touchstart', manualScroll, { passive: true });
        list.addEventListener('scroll', () => { if (!frame) offset = list.scrollTop; }, { passive: true });
        document.addEventListener('visibilitychange', updateMotion);
        new IntersectionObserver(entries => { visible = entries[0].isIntersecting; updateMotion(); }).observe(list);
        form.addEventListener('reset', () => {
            cancelTyping();
            // Native reset applies field values after dispatching the event.
            requestAnimationFrame(() => {
                details.hidden = true;
                form.querySelector('.enquiry-extras').open = false;
                examples.hidden = false;
                message.style.removeProperty('height');
                offset = list.scrollTop = 0;
                updateMotion();
            });
        });
        reveal();
        addEventListener('pageshow', reveal);
    });

    // Keep the SAME form before the content on both phone and tablet layouts.
    const rail = document.querySelector('.preview-contact-rail') || document.querySelector('.preview-service-rail > .hero-form');
    const hero = document.querySelector('.hero');
    if (rail && hero) {
        rail.querySelector('form').dataset.enquiryPlacement = rail.matches('.preview-contact-rail') ? 'contact_rail' : 'service_rail';
        const marker = document.createComment('desktop enquiry position');
        rail.before(marker);
        const slot = document.createElement('section');
        slot.className = 'mobile-enquiry-slot';
        const slotInner = document.createElement('div');
        slotInner.className = 'container';
        slot.append(slotInner);
        hero.after(slot);
        const mobile = matchMedia('(max-width: 1199px)');
        function place() {
            if (mobile.matches) slotInner.append(rail);
            else marker.after(rail);
        }
        mobile.addEventListener('change', place);
        place();
    }
})();
