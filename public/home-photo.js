// The fault illustration stays static unless its optional LED-off frame loads.
(() => {
  const photo = document.querySelector('[data-fault-photo]');
  if (!photo) return;
  const frame = photo.querySelector('.preview-led-off');
  const control = photo.querySelector('[data-photo-motion]');
  let visible = false;
  const preferenceKey = 'naserwis_photo_power_v1';
  let powered = true;
  try { powered = localStorage.getItem(preferenceKey) !== 'off'; } catch {}
  const ready = () => frame.complete && frame.naturalWidth > 0;
  const update = () => {
    photo.classList.toggle('preview-led-blink', ready() && powered);
    photo.classList.toggle('preview-led-off-state', ready() && !powered);
    photo.classList.toggle('preview-led-paused', !visible || document.hidden);
    control.hidden = !ready();
    control.setAttribute('aria-pressed', String(powered));
    control.title = powered ? control.dataset.pause : control.dataset.play;
  };
  control.addEventListener('click', () => {
    powered = !powered;
    try { localStorage.setItem(preferenceKey, powered ? 'on' : 'off'); } catch {}
    update();
  });
  frame.addEventListener('load', update);
  frame.addEventListener('error', update);
  document.addEventListener('visibilitychange', update);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); }).observe(photo);
  update();
})();
