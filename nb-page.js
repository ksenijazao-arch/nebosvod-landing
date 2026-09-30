(function () {
  // звёзды на фоне
  var c = document.getElementById('stars');
  if (c) {
    var ctx = c.getContext('2d'), stars = [], w, h, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var resize = function () {
      w = window.innerWidth; h = window.innerHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = []; for (var i = 0, n = Math.round(w * h / 6000); i < n; i++) stars.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.2 + .2, p: Math.random() * 6.28, s: Math.random() * .02 + .005 });
    };
    var draw = function (t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) { var s = stars[i]; ctx.globalAlpha = still ? .7 : .35 + .65 * Math.abs(Math.sin(s.p + t * s.s * .06)); ctx.fillStyle = i % 7 === 0 ? '#e8c882' : '#fff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill(); }
      ctx.globalAlpha = 1; if (!still) requestAnimationFrame(draw);
    };
    window.addEventListener('resize', resize); resize(); draw(0);
  }

  // города и ручной часовой пояс
  document.querySelectorAll('select[name=city]').forEach(function (sel) {
    NB.fillCities(sel);
    var box = sel.form.querySelector('.manual');
    sel.addEventListener('change', function () { if (box) box.style.display = sel.value === 'manual' ? 'block' : 'none'; });
  });

  // ссылка на бота с меткой источника
  window.NB_botLink = function (tag) { return 'https://t.me/nebosvod_astro_bot?start=' + tag; };
  document.querySelectorAll('[data-bot]').forEach(function (a) { a.href = NB_botLink(a.getAttribute('data-bot')); });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]'); if (!b) return;
    var link = NB_botLink(b.getAttribute('data-copy'));
    var done = function () { b.textContent = 'Ссылка скопирована!'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(done).catch(function () { prompt('Скопируй ссылку:', link); });
    else prompt('Скопируй ссылку:', link);
  });
})();
