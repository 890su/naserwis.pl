// The fault illustration stays static unless its optional LED-off frame loads.
(() => {
  const photo = document.querySelector('[data-fault-photo]');
  if (!photo) return;
  const frame = photo.querySelector('.preview-led-off');
  const control = photo.querySelector('[data-photo-motion]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let stopped = false;
  const ready = () => frame.complete && frame.naturalWidth > 0;
  const update = () => {
    const enabled = ready() && !reduced.matches;
    photo.classList.toggle('preview-led-blink', enabled && !stopped);
    photo.classList.toggle('preview-led-paused', !visible || document.hidden);
    control.hidden = !enabled;
    control.textContent = stopped ? control.dataset.play : control.dataset.pause;
  };
  control.addEventListener('click', () => { stopped = !stopped; update(); });
  frame.addEventListener('load', update);
  frame.addEventListener('error', update);
  reduced.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); }).observe(photo);
  update();
})();
