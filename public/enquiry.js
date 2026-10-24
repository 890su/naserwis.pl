// Progressive enquiry: typing never moves focus or scrolls the page.
(() => {
    'use strict';
    // Mobile order is present in raw HTML, so delayed JS cannot move content down.
    const slotInner = document.querySelector('.mobile-enquiry-slot > .container');
    const desktopSlot = document.querySelector('[data-enquiry-desktop-slot]');
    const rail = slotInner?.firstElementChild;
    if (rail && desktopSlot) {
        const mobile = matchMedia('(max-width: 1199px)');
        function place() {
            const destination = mobile.matches ? slotInner : desktopSlot;
            if (rail.parentElement !== destination) destination.prepend(rail);
        }
        mobile.addEventListener('change', place);
        place();
    }
    // Owner-requested motion exception: these examples animate even with reduced motion.
    document.querySelectorAll('[data-staged-form]').forEach(form => {
        const message = form.elements.message;
        const details = form.querySelector('.enquiry-details');
        const examples = form.querySelector('.enquiry-examples');
        const list = form.querySelector('.enquiry-example-list');
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
        // Only the text participates in native list scrolling. The surrounding
        // row still highlights and selects across its full width, while gestures
        // in its empty side areas hit the parent and scroll the page naturally.
        function rowAtPoint(event) {
            const bounds = list.getBoundingClientRect();
            if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) return null;
            return [...list.children].find(item => {
                if (item.hidden) return false;
                const row = item.getBoundingClientRect();
                return event.clientY >= row.top && event.clientY <= row.bottom;
            });
        }
        let hoveredRow = null;
        function highlightRow(row) {
            if (hoveredRow === row) return;
            hoveredRow?.classList.remove('is-hovered');
            hoveredRow = row;
            hoveredRow?.classList.add('is-hovered');
        }
        examples.addEventListener('pointermove', event => {
            if (event.pointerType === 'mouse') highlightRow(rowAtPoint(event));
        });
        examples.addEventListener('pointerleave', () => highlightRow(null));
        examples.addEventListener('click', event => {
            const example = event.target.closest('[data-enquiry-example]') || rowAtPoint(event);
            if (!example) return;
            highlightRow(null);
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
        // Manual scrolling takes over from automatic movement.
        function manualScroll() {
            paused = true;
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
                paused = false;
                highlightRow(null);
                offset = list.scrollTop = 0;
                updateMotion();
            });
        });
        reveal();
        addEventListener('pageshow', reveal);
    });

})();
