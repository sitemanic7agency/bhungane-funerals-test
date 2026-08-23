(function () {
  'use strict';

  /* Single configurable constant driving every tel:/wa.me link on the site. */
  var WHATSAPP_NUMBER = '27737119561';

  function waLink(message) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
  }

  function isMobile() {
    return !window.matchMedia('(min-width: 700px)').matches;
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------- Custom smooth scroll: slow, calm easing, not scroll-behavior ---------- */

  function tweenTo(targetY) {
    var start = window.scrollY || document.documentElement.scrollTop || 0;
    var dist = targetY - start;
    if (Math.abs(dist) < 2) return;
    if (prefersReducedMotion()) {
      window.scrollTo(0, targetY);
      return;
    }
    var duration = Math.min(2600, 900 + Math.abs(dist) * 0.55);
    var t0 = performance.now();
    function step(now) {
      var k = Math.min((now - t0) / duration, 1);
      var eased = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      window.scrollTo(0, start + dist * eased);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function scrollToId(id, offset) {
    var el = document.getElementById(id);
    if (!el) return;
    if (offset === undefined) offset = isMobile() ? 16 : 96;
    var top = el.getBoundingClientRect().top + (window.scrollY || 0) - offset;
    tweenTo(Math.max(top, 0));
  }

  /* ---------- WhatsApp links from data-wa message templates ---------- */

  function hydrateWaLinks(root) {
    var nodes = (root || document).querySelectorAll('[data-wa]');
    nodes.forEach(function (node) {
      node.setAttribute('href', waLink(node.getAttribute('data-wa')));
    });
  }

  /* ---------- Mobile drawer ---------- */

  function initDrawer() {
    var toggle = document.querySelector('[data-drawer-toggle]');
    var drawer = document.querySelector('[data-drawer]');
    if (!toggle || !drawer) return;

    function close() {
      drawer.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
    function open() {
      drawer.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
    }

    toggle.addEventListener('click', function () {
      if (drawer.hidden) open(); else close();
    });

    drawer.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('click', close);
    });

    return { close: close };
  }

  /* ---------- Nav highlighting (tracks last navigated section, not scroll position) ---------- */

  function setActiveNav(id) {
    document.querySelectorAll('[data-nav-id]').forEach(function (link) {
      var active = link.getAttribute('data-nav-id') === id;
      link.setAttribute('aria-current', active ? 'true' : 'false');
    });
  }

  /* ---------- In-page section links ---------- */

  function initSectionLinks(drawerClose) {
    document.querySelectorAll('[data-goto]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var targetId = link.getAttribute('data-goto');
        var navId = link.getAttribute('data-nav-id') || targetId;
        setActiveNav(navId);
        if (drawerClose) drawerClose();
        scrollToId(targetId, targetId === 'hero' || targetId === 'm-hero' ? 200 : undefined);
      });
    });
  }

  /* ---------- Deep-link scroll on load (cross-page anchors into service rows, etc.) ---------- */

  function scrollToHashOnLoad() {
    var hash = window.location.hash ? window.location.hash.slice(1) : '';
    if (!hash) return;
    var el = document.getElementById(hash);
    if (!el) return;
    window.scrollTo(0, 0);
    setTimeout(function () {
      scrollToId(hash, hash === 'hero' || hash === 'm-hero' ? 200 : undefined);
    }, 340);
  }

  /* ---------- Plan card "see full details" toggle ---------- */

  function initPlanToggles() {
    document.querySelectorAll('[data-plan-toggle]').forEach(function (btn) {
      var card = btn.closest('.plan-card');
      if (!card) return;
      var extras = card.querySelectorAll('[data-plan-extra]');
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        var next = !open;
        btn.setAttribute('aria-expanded', String(next));
        btn.textContent = next ? 'Hide details' : 'See full details';
        extras.forEach(function (item) {
          item.hidden = !next;
        });
      });
    });
  }

  /* ---------- Quote composer: chips + fields assemble one WhatsApp message live ---------- */

  function initQuoteComposer() {
    var form = document.querySelector('[data-quote-form]');
    if (!form) return;

    form.addEventListener('submit', function (e) { e.preventDefault(); });

    var chips = form.querySelectorAll('.chip[data-need]');
    var nameInput = form.querySelector('[data-field="name"]');
    var phoneInput = form.querySelector('[data-field="phone"]');
    var msgInput = form.querySelector('[data-field="message"]');
    var submit = form.querySelector('[data-quote-submit]');

    var selectedNeed = '';

    function leadLine() {
      if (!selectedNeed) return 'Hi Bhunganeh Funerals — I would like to request a quote.';
      if (selectedNeed === 'A funeral now') {
        return 'Hi Bhunganeh Funerals — a death has occurred and my family needs help now.';
      }
      return 'Hi Bhunganeh Funerals — I would like to ask about ' + selectedNeed.toLowerCase() + '.';
    }

    function composeMessage() {
      var lines = [leadLine()];
      var name = (nameInput && nameInput.value || '').trim();
      var phone = (phoneInput && phoneInput.value || '').trim();
      var msg = (msgInput && msgInput.value || '').trim();
      if (name) lines.push('Name: ' + name);
      if (phone) lines.push('Phone: ' + phone);
      if (msg) lines.push(msg);
      return lines.join('\n');
    }

    function refresh() {
      if (submit) submit.setAttribute('href', waLink(composeMessage()));
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var value = chip.getAttribute('data-need');
        var wasSelected = chip.getAttribute('aria-pressed') === 'true';
        chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
        selectedNeed = wasSelected ? '' : value;
        if (!wasSelected) chip.setAttribute('aria-pressed', 'true');
        refresh();
      });
    });

    [nameInput, phoneInput, msgInput].forEach(function (input) {
      if (input) input.addEventListener('input', refresh);
    });

    refresh();
  }

  /* ---------- Page fade-in ---------- */

  function initPageFade() {
    var main = document.querySelector('main');
    if (main && !prefersReducedMotion()) main.classList.add('page-fade');
  }

  document.addEventListener('DOMContentLoaded', function () {
    hydrateWaLinks(document);
    initPageFade();
    var drawer = initDrawer();
    initSectionLinks(drawer && drawer.close);
    initPlanToggles();
    initQuoteComposer();
    scrollToHashOnLoad();
  });
})();
