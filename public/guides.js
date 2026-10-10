// Progressive enhancement: both complete versions are readable without JavaScript.
const reader = document.querySelector('[data-reader]');
if (reader) {
  const controls = [...reader.querySelectorAll('[data-mode]')];
  const panels = [...reader.querySelectorAll('[data-panel]')];
  const group = reader.querySelector('.reader-switch > div');
  group.setAttribute('role', 'tablist');
  group.setAttribute('aria-label', reader.querySelector('.reader-switch').getAttribute('aria-label'));
  let current = 'simple';
  function select(mode) {
    current = mode;
    for (const control of controls) {
      const selected = control.dataset.mode === mode;
      control.setAttribute('role', 'tab');
      control.setAttribute('aria-controls', control.dataset.mode);
      control.setAttribute('aria-selected', String(selected));
      control.tabIndex = selected ? 0 : -1;
    }
    for (const panel of panels) {
      panel.hidden = panel.dataset.panel !== mode;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', `select-${panel.dataset.panel}`);
    }
    for (const link of document.querySelectorAll('[data-guide-language]')) {
      const url = new URL(link.href);
      url.hash = mode === 'technical' ? 'technical' : '';
      link.href = url.href;
    }
  }
  function fromHash() {
    const hash = location.hash;
    if (/^#technical(?:$|-)/.test(hash)) select('technical');
    else if (!hash || /^#simple(?:$|-)/.test(hash)) select('simple');
    const target = document.getElementById(hash.slice(1));
    if (target && hash !== '#simple' && hash !== '#technical') target.scrollIntoView();
  }
  for (const control of controls) {
    control.addEventListener('click', event => {
      event.preventDefault();
      const mode = control.dataset.mode;
      if (current !== mode || location.hash !== '#' + mode) history.pushState(null, '', '#' + mode);
      select(mode);
    });
    control.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End', ' '].includes(event.key)) return;
      event.preventDefault();
      const target = event.key === 'Home' ? controls[0] : event.key === 'End' ? controls[1] : event.key === ' ' ? control : controls[control === controls[0] ? 1 : 0];
      target.click();
      target.focus();
    });
  }
  select(/^#technical(?:$|-)/.test(location.hash) ? 'technical' : 'simple');
  window.addEventListener('hashchange', fromHash);
  window.addEventListener('popstate', fromHash);
  if (location.hash) fromHash();
}
