// KyivLock — єдиний клієнтський скрипт (без бібліотек, ~3 КБ, defer).
// Cookie-згода → відкладений GA4 (Consent Mode v2), події конверсій, час приїзду, анімації появи.
(function () {
  var w = window;
  var GA = document.body.dataset.ga4 || '';
  var gaOn = /^G-[A-Z0-9]+$/.test(GA);
  w.dataLayer = w.dataLayer || [];
  w.gtag = function () { w.dataLayer.push(arguments); };
  w.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* приватний режим */ } },
  };

  var loaded = false;
  function loadGA() {
    if (loaded || !gaOn) return;
    loaded = true;
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA;
    document.head.appendChild(s);
    w.gtag('js', new Date()); w.gtag('config', GA);
  }
  var idle = function (fn) { return 'requestIdleCallback' in w ? w.requestIdleCallback(fn, { timeout: 4000 }) : setTimeout(fn, 2500); };

  var consent = store.get('consent');
  var banner = document.getElementById('cookie');
  if (consent === 'granted') { w.gtag('consent', 'update', { analytics_storage: 'granted' }); idle(loadGA); }
  else if (!consent && banner) idle(function () { banner.hidden = false; });
  if (banner) banner.addEventListener('click', function (e) {
    var b = e.target.closest('[data-consent]');
    if (!b) return;
    var v = b.dataset.consent;
    store.set('consent', v); banner.hidden = true;
    if (v === 'granted') { w.gtag('consent', 'update', { analytics_storage: 'granted' }); loadGA(); }
  });

  function track(event, params) {
    var p = { page_path: location.pathname };
    for (var k in params || {}) p[k] = params[k];
    w.gtag('event', event, p);
  }

  // Кліки по телефону та месенджерах: phone_click / messenger_click
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-ga]');
    if (a) track(a.dataset.ga, a.dataset.ch ? { channel: a.dataset.ch } : {});
  });

  // Орієнтовний час приїзду
  var eta = document.getElementById('eta');
  if (eta) {
    var o = eta.querySelector('output'), sel = eta.querySelector('select');
    var ru = document.body.dataset.lang === 'ru';
    var u = function () { o.textContent = sel.value ? (ru ? 'Ориентировочно ' : 'Орієнтовно ') + sel.value : ''; };
    sel.addEventListener('change', u);
    eta.addEventListener('submit', function (e) { e.preventDefault(); });
    u();
  }

  // Поява блоків під час прокрутки. Блоки, видимі одразу, не чіпаємо (без «блимання» і без впливу на LCP);
  // без IntersectionObserver або при «зменшенні руху» все просто показано одразу.
  var calm = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in w && !calm) {
    var rvSel = 'main .section h2, main .section .lead, .card, .steps li, .tbl, .faq details, main .section .callcard, .eta, .trust, .do, .dont, .rev, .note, .media, .chips';
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('in'); io.unobserve(el);
        // Після появи прибираємо службові класи, щоб працювали звичайні hover-переходи
        setTimeout(function () { el.classList.remove('rv', 'in'); el.style.removeProperty('--i'); }, 1400);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    var vh = w.innerHeight;
    [].forEach.call(document.querySelectorAll(rvSel), function (el) {
      if (el.closest('.hero') || el.getBoundingClientRect().top < vh) return;
      // Затримка «по черзі» для карток у сітці та кроків
      var p = el.parentElement, i = p ? [].indexOf.call(p.children, el) : 0;
      if (i > 0) el.style.setProperty('--i', Math.min(i % 4, 3));
      el.classList.add('rv'); io.observe(el);
    });
  }

  // Мобільне меню (<details>): оверлей під шапкою, aria-expanded, блокування прокрутки сторінки,
  // закриття по Escape і по кліку на посилання; в акордеоні відкритий лише один підрозділ.
  var mm = document.getElementById('menu-m'), mp = document.getElementById('mmenu');
  if (mm && mp) {
    var ms = mm.querySelector('summary'), root = document.documentElement;
    var place = function () { root.style.setProperty('--menu-top', Math.max(0, Math.round(mm.closest('.hdr').getBoundingClientRect().bottom)) + 'px'); };
    mm.addEventListener('toggle', function () {
      var o = mm.open;
      if (o) place();
      ms.setAttribute('aria-expanded', String(o));
      ms.setAttribute('aria-label', o ? ms.dataset.close : ms.dataset.open);
      root.classList.toggle('menu-open', o);
    });
    mp.addEventListener('click', function (e) { if (e.target.closest('a')) mm.open = false; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mm.open) { mm.open = false; ms.focus(); } });
    [].forEach.call(mp.querySelectorAll('details'), function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) [].forEach.call(mp.querySelectorAll('details[open]'), function (x) { if (x !== d) x.open = false; });
      });
    });
    w.addEventListener('resize', function () { if (mm.open) place(); });
  }

  // Тінь шапки при прокрутці
  var hdr = document.querySelector('.hdr');
  if (hdr) {
    var on = false;
    var chk = function () { var s = w.scrollY > 8; if (s !== on) { on = s; hdr.classList.toggle('scrolled', s); } };
    w.addEventListener('scroll', chk, { passive: true }); chk();
  }
})();
