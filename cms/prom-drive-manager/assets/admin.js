/* Native WordPress media library; no ACF, external scripts or API credentials. */
(function ($) {
  'use strict';
  const selector = document.querySelector('[data-pdm-page-key]');
  function syncPage() {
    if (!selector) return;
    document.querySelectorAll('[data-page]').forEach(group => {
      group.hidden = group.dataset.page !== selector.value;
      group.querySelectorAll('input,select,textarea').forEach(input => { input.disabled = group.hidden; });
    });
  }
  selector?.addEventListener('change', syncPage);
  syncPage();
  document.addEventListener('click', event => {
    const pick = event.target.closest('.pdm-pick');
    const clear = event.target.closest('.pdm-clear');
    if (!pick && !clear) return;
    const root = (pick || clear).closest('.pdm-media');
    const input = root.querySelector('input');
    const preview = root.querySelector('.pdm-preview');
    if (clear) { input.value = ''; preview.replaceChildren(); input.dispatchEvent(new Event('change', {bubbles:true})); return; }
    const multiple = root.dataset.multiple === '1';
    const frame = wp.media({title:'เลือกภาพ PROM DRIVE',button:{text:'ใช้ภาพที่เลือก'},library:{type:'image'},multiple});
    frame.on('open', () => {
      if (root.dataset.url === '1') return;
      input.value.split(',').filter(Boolean).forEach(id => frame.state().get('selection').add(wp.media.attachment(Number(id))));
    });
    frame.on('select', () => {
      const items = frame.state().get('selection').toJSON();
      input.value = root.dataset.url === '1' ? (items[0]?.url || '') : items.map(item => item.id).join(',');
      preview.replaceChildren();
      items.forEach(item => { const image=document.createElement('img');image.src=item.sizes?.thumbnail?.url || item.url;image.alt=item.alt || '';preview.append(image); });
      input.dispatchEvent(new Event('change', {bubbles:true}));
    });
    frame.open();
  });
})(jQuery);
