/* =========================================================================
   Masaż z dojazdem, Trójmiasto
   Everything a client would want to change lives in CONFIG below.
   ========================================================================= */
'use strict';

const CONFIG = {
  name: 'Adam Kowalski',
  role: 'masażysta z dojazdem',
  city: 'Gdańsk',
  cities: ['Gdańsk', 'Sopot', 'Gdynia'],
  districts: ['Śródmieście', 'Wrzeszcz', 'Zaspa', 'Przymorze', 'Chełm', 'Strzyża',
              'Suchanino', 'Morena', 'Kokoszki', 'Piecki-Migowo', 'Ujeścisko',
              'Nowy Port', 'Brzeźno', 'Oliwa', 'Rębiechowo'],
  nearby: 'do 30 km od centrum',
  phone: '+48501827364',          // display and tel: +48 501 827 364
  phoneHref: 'tel:+48501827364',
  whatsapp: '48501827364',        // wa.me needs the number without + or spaces
  email: 'kontakt@masazadamakowalski.pl',
  domain: 'https://masazadamakowalski.pl',
  year: 2026,

  rating: '4,9',
  reviewCount: 340,
  yearsActive: 8,
  sessions: 1200,
  radius: '30 km',

  // session lengths offered; prices live in the price table in index.html
  durations: [60, 90, 120],
  defaultDuration: 90,

  treatments: [
    { id: 'klasyczny', name: 'Masaż klasyczny',   price: { 60: 180, 90: 240, 120: 300 } },
    { id: 'kamienie',   name: 'Kamienie i ciepło', price: { 60: 200, 90: 260, 120: 330 } },
    { id: 'sportowy',   name: 'Masaż sportowy',    price: { 60: 210, 90: 280, 120: 350 } }
  ],
  defaultTreatment: 'klasyczny',

  travel: 'w cenie w Gdańsku, Sopocie i Gdyni, do 30 km',
  payment: 'BLIK, gotówka lub karta',

  hours: [
    ['Poniedziałek – piątek', '9:00 – 21:00'],
    ['Sobota', '8:00 – 18:00'],
    ['Niedziela', 'po uzgodnieniu']
  ],

  // weekday windows used by the availability engine: [startHour, endHour]
  slots: {
    0: null,                       // Sunday: closed
    6: [[10, 14]],                 // Saturday
    default: [[10, 13], [15, 18], [19, 21]]
  },

  reviews: [
    { text: 'Umówiłam się z dnia na dzień, bo plecy totalnie odmawiały posłuszeństwa. Przyjechał punktualnie, rozstawił stół w salonie w dwie minuty. Po godzinie nie czułam barków. Pierwszy raz od roku.', author: 'Magda K.', meta: 'Wrzeszcz · 90 min · wrzesień 2026' },
    { text: 'Najlepszy masaż, jaki miałam na trójmieście, a do tego nie trzeba było szukać miejsca parkingowego. Polecam każdemu, kto siedzi osiem godzin dziennie przy komputerze.', author: 'Tomasz W.', meta: 'Orłowo, Gdynia · 120 min · sierpień 2026' },
    { text: 'Kamienne rozluźniły mi kark w sposób, jakiego nie osiągnęłam nawet w SPA za trzykrotnie tyle. Zero rozprośzenia typu „gdzie jest ten masażysta”. Po prostu przyjechał i zrobił swoją robotę.', author: 'Agnieszka D.', meta: 'Zaspa · 90 min, kamienie · lipiec 2026' }
  ],

  faq: [
    ['Czy naprawdę nie muszę niczego przygotowywać?',
     'Potrzebujesz około 2×2 metrów wolnego miejsca w salonie, sypialni albo w największym pokoju. Resztę przywożę ze sobą: stół składany, pościel, ręczniki, oleje i kamienie.'],
    ['Gdzie dojeżdżasz?',
     'Codziennie jadę po Gdańsku, Sopocie i Gdyni, w tym na Wrzeszcz, Zaspę, Przymorze, Chełm, Sopot i półwysep Hel. Do 30 km od centrum dojazd jest w cenie miejskiej stawki, dalej doliczam tylko paliwo.'],
    ['Co, jeśli nie odpowiem od razu na telefon?',
     'Odzwaniam zwykle w ciągu dwóch godzin, a wieczorami i w weekendy nawet szybciej. Jeśli wolisz, napisz SMS albo WhatsApp. Wtedy termin rezerwuję bez czekania na połączenie.'],
    ['Czy mogę odwołać wizytę?',
     'Tak, wystarczy telefon albo wiadomość. Bezpłatnie odwołujemy się, jeśli zgłosisz to najpóźniej 12 godzin przed wizytą. Później wydatek 80 zł, bo termin wtedy blokuję dla innego klienta.'],
    ['Czy taki masaż jest dla mnie odpowiedni?',
     'Najczęściej tak, ale są przeciwwskazania bezwzględne: gorączka, świeże urazy, zakrzepica, świeże zabiegi na skórze. Przy ciąży, chorobach nowotworowych albo osteoporozie najpierw porozmawiajmy i pokażę kartę zdrowia.'],
    ['Czy masaż pomaga na zimne bóle pleców?',
     'Przy nagłym przezięciu na pewno nie, bo rozgrzewanie tylko wzmocni objawy. Przy przewlekłych napięciach, karku od komputera i napięciu mięśniowym spodnia pleców: tak, bardzo często już po jednej sesji.']
  ]
};

/* =========================================================================
   Everything below is plumbing. Config changes need nothing here.
   ========================================================================= */
(function () {
  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = { min: CONFIG.defaultDuration, treatment: CONFIG.defaultTreatment };

  /* ---- theme: device preference first, T overrides for preview ---------- */
  function initTheme() {
    const root = document.documentElement;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    let manual = false;

    function apply(light) {
      root.dataset.theme = light ? 'light' : 'dark';
      const c = light ? '#efe9dd' : '#13110f';
      const metas = $$('meta[name="theme-color"]');
      metas.forEach((m, i) => {
        if (i === 0) { m.removeAttribute('media'); m.setAttribute('content', c); }
        else m.parentNode.removeChild(m);
      });
    }

    apply(mq.matches);
    if (mq.addEventListener) mq.addEventListener('change', e => { if (!manual) apply(e.matches); });

    document.addEventListener('keydown', e => {
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      if (e.key === 't' || e.key === 'T') {
        manual = true;
        root.dataset.preview = 'true';
        apply(root.dataset.theme !== 'light');
      }
      if (e.key === 'e' || e.key === 'E') toggleDev();
    });

    const q = new URLSearchParams(location.search);
    if (q.has('theme')) {
      const v = q.get('theme');
      if (v === 'light' || v === 'dark') { manual = true; apply(v === 'light'); }
    }
    if (q.has('edit')) toggleDev();

    /* ---- dev mode: press E or ?edit=1 to click-to-replace photos -------- */
    function toggleDev() {
      const on = document.body.classList.toggle('dev');
      if (!on) return;
      $$('.ph').forEach(ph => {
        if (!ph.dataset.label) {
          const img = $('img', ph);
          ph.dataset.label = (img && img.alt ? img.alt : 'zdjęcie').slice(0, 28);
        }
        if (ph.dataset.wired) return;
        ph.dataset.wired = '1';
        ph.addEventListener('click', function () {
          const inp = document.createElement('input');
          inp.type = 'file';
          inp.accept = 'image/*';
          inp.addEventListener('change', function () {
            const f = inp.files && inp.files[0];
            if (!f) return;
            const img = $('img', this);
            if (!img) return;
            if (img.dataset.blob) URL.revokeObjectURL(img.dataset.blob);
            const u = URL.createObjectURL(f);
            img.dataset.blob = u;
            img.src = u;
            img.classList.add('ready');
          });
          inp.click();
        });
      });
    }
  }

  /* ---- fill the DOM from CONFIG ---------------------------------------- */
  function hydrate() {
    $$('[data-cfg="name"]').forEach(el => (el.textContent = CONFIG.name));
    $$('[data-cfg="city"]').forEach(el => (el.textContent = CONFIG.city));
    $$('[data-cfg="radius"]').forEach(el => (el.textContent = CONFIG.radius));
    $$('[data-cfg="rating"]').forEach(el => (el.textContent = CONFIG.rating));
    $$('[data-cfg="reviewCount"]').forEach(el => (el.textContent = CONFIG.reviewCount));
    $$('[data-cfg="yearsActive"]').forEach(el => (el.textContent = CONFIG.yearsActive));
    $$('[data-cfg="sessions"]').forEach(el => (el.textContent = CONFIG.sessions.toLocaleString('pl-PL')));
    $$('[data-cfg="phoneDisplay"]').forEach(el => (el.textContent = prettyPhone()));
    $$('[data-cfg="year"]').forEach(el => (el.textContent = CONFIG.year));
    $$('[data-cfg="travel"]').forEach(el => (el.textContent = CONFIG.travel));
    $$('[data-cfg="payment"]').forEach(el => (el.textContent = CONFIG.payment));

    $$('[data-href="phone"]').forEach(a => (a.href = CONFIG.phoneHref));
    $$('[data-href="wa"]').forEach(a => (a.href = 'https://wa.me/' + CONFIG.whatsapp));
    $$('[data-href="mail"]').forEach(a => (a.href = 'mailto:' + CONFIG.email));

    const hours = $('#hours');
    if (hours) {
      hours.innerHTML = CONFIG.hours
        .map(([d, h]) => `<div><span>${d}</span><b>${h}</b></div>`)
        .join('');
    }

    const rev = $('#reviews');
    if (rev) {
      rev.innerHTML = CONFIG.reviews.map(r => `
        <figure data-r>
          <blockquote>${r.text}</blockquote>
          <figcaption><span class="stars" aria-label="5 na 5">★★★★★</span><b>${r.author}</b>${r.meta}</figcaption>
        </figure>`).join('');
    }

    const faq = $('#faq');
    if (faq) {
      faq.innerHTML = CONFIG.faq.map(([q, a], i) => `
        <details${i === 0 ? ' open' : ''}>
          <summary>${q}</summary>
          <div class="faq__a"><div>${a}</div></div>
        </details>`).join('');
    }

    const cities = $('#cities');
    if (cities) {
      cities.innerHTML = CONFIG.cities
        .map((c, i) => `<li data-n="${pad(i + 1)}">${c}</li>`).join('');
    }

    const districts = $('#districts');
    if (districts) {
      districts.innerHTML = CONFIG.districts.map(d => `<li>${d}</li>`).join('') +
                            `<li>${CONFIG.nearby}</li>`;
    }

    // titles and meta live in the HTML, Google reads them without running JS
  }

  function prettyPhone() {
    const d = CONFIG.phone.replace(/\D/g, '');
    const ccLen = d.length === 11 ? 2 : 3;          // +48 or a three digit code
    const rest = d.slice(ccLen);
    const groups = [];
    for (let i = 0; i < rest.length; i += 3) groups.push(rest.slice(i, i + 3));
    return '+' + d.slice(0, ccLen) + ' ' + groups.join(' ');
  }

  function treatmentById(id) {
    return CONFIG.treatments.find(t => t.id === id) || CONFIG.treatments[0];
  }
  function priceFor(id, min) {
    const t = treatmentById(id);
    return t.price[min] || t.price[CONFIG.defaultDuration];
  }

  /* ---- time scale: pick a session length -------------------------------- */
  function initScale() {
    const scale = $('#scale');
    if (!scale) return;

    CONFIG.durations.forEach(min => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tick';
      b.dataset.min = String(min);
      b.innerHTML = `<b>${min}</b> min`;
      b.setAttribute('aria-label', `Masaż ${min} minut`);
      b.addEventListener('click', () => setDuration(min));
      b.addEventListener('keydown', e => {
        const bs = $$('.tick', scale);
        const i = bs.indexOf(b);
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const n = bs[(i + (e.key === 'ArrowRight' ? 1 : -1) + bs.length) % bs.length];
          n.focus();
          setDuration(Number(n.dataset.min));
        }
      });
      scale.appendChild(b);
    });
  }

  function setDuration(min) {
    state.min = min;
    $$('.tick').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.min) === min)));
    paintMatrix();
    rebuildSlots();
  }

  /* ---- price matrix: highlight the chosen column and row --------------- */
  function initMatrix() {
    $$('[data-pick]').forEach(a => a.addEventListener('click', () => {
      state.treatment = a.dataset.pick;
      paintMatrix();
      rebuildSlots();
    }));
  }

  function paintMatrix() {
    $$('#matrix thead th[data-col]').forEach(th =>
      th.classList.toggle('on', Number(th.dataset.col) === state.min));
    $$('#matrix tbody tr').forEach(tr => tr.classList.toggle('on', tr.dataset.t === state.treatment));
  }

  /* ---- availability engine --------------------------------------------- */
  const DAYS = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
  const DAYS_SHORT = ['nie', 'pon', 'wt', 'śr', 'czw', 'pt', 'sob'];
  const MONTHS = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca',
                  'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
  const pad = n => String(n).padStart(2, '0');

  // how far ahead the calendar is willing to look, in weeks
  const HORIZON = 8;
  // span choices for the "show more weeks" control, in weeks
  const SPANS = [1, 2, 4];

  const cal = { span: 1, offset: 0 };
  let picked = null;
  let activeDay = null;

  function windowsFor(date) {
    const w = CONFIG.slots[date.getDay()];
    if (w === null) return null;            // explicitly closed that weekday
    return w || CONFIG.slots.default;
  }

  /* every bookable hour left on a given day */
  function daySlots(date) {
    const wins = windowsFor(date);
    if (!wins) return [];
    const now = new Date();
    const out = [];
    for (const [from, to] of wins) {
      for (let h = from; h < to; h++) {
        const when = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, 0);
        if (when <= now) continue;
        out.push(when);
      }
    }
    return out;
  }

  /* flat list of the next N bookable slots, used by tests and as a fallback */
  function collectSlots(limit) {
    const out = [];
    const now = new Date();
    for (let add = 0; add < HORIZON * 7 && out.length < limit; add++) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + add);
      for (const when of daySlots(day)) {
        if (out.length >= limit) break;
        out.push(when);
      }
    }
    return out;
  }

  function maxOffset() { return Math.max(0, HORIZON - cal.span); }

  /* the stretch of calendar days currently on screen */
  function visibleDays() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + cal.offset * 7);
    const out = [];
    for (let i = 0; i < cal.span * 7; i++) {
      out.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    }
    return out;
  }

  function rangeLabel(days) {
    const a = days[0], b = days[days.length - 1];
    const year = b.getFullYear() === a.getFullYear() ? '' : ' ' + b.getFullYear();
    if (a.getMonth() === b.getMonth()) {
      return `${a.getDate()} to ${b.getDate()} ${MONTHS[b.getMonth()]}${year}`;
    }
    return `${a.getDate()} ${MONTHS[a.getMonth()]} to ${b.getDate()} ${MONTHS[b.getMonth()]}${year}`;
  }

  function key(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function rebuildSlots() {
    const box = $('#slots'), out = $('#availOut');
    if (!box) return;
    const min = state.min;
    const treat = treatmentById(state.treatment);

    const days = visibleDays().map(date => ({ date, k: key(date), times: daySlots(date) }));

    if (activeDay === null || !days.some(d => d.k === activeDay)) {
      activeDay = (days.find(d => d.times.length) || days[0]).k;
    }

    paintChrome(days);

    const dbox = $('#days');
    dbox.innerHTML = days.map(d => {
      const closed = windowsFor(d.date) === null;
      const none = !closed && !d.times.length;
      const note = closed ? 'zamknięte' : none ? 'brak wolnych' : d.times.length + (d.times.length === 1 ? ' termin' : ' terminy');
      return `
        <button type="button" class="day" data-k="${d.k}" ${closed || none ? 'disabled' : ''}
                aria-pressed="${d.k === activeDay}" aria-label="${longDate(d.date)}${closed ? ', nieczynne' : none ? ', brak wolnych terminów' : ', ' + d.times.length + ' wolnych terminów'}">
          <small>${DAYS_SHORT[d.date.getDay()]}</small>
          <b>${d.date.getDate()}.${pad(d.date.getMonth() + 1)}</b>
          <em>${note}</em>
        </button>`;
    }).join('');

    $$('.day', dbox).forEach(b => b.addEventListener('click', () => {
      if (b.disabled) return;
      activeDay = b.dataset.k;
      $$('.day', dbox).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      paintTimes();
    }));

    paintTimes();
    renderOut();

    /* range label, week arrows, span switch */
    function paintChrome(days) {
      const label = $('#calLabel');
      if (label) label.innerHTML = `${rangeLabel(days.map(d => d.date))} <span>${cal.span === 1 ? 'tydzień' : cal.span + ' tygodnie'}</span>`;

      const prev = $('#calPrev'), next = $('#calNext');
      if (prev) prev.disabled = cal.offset === 0;
      if (next) next.disabled = cal.offset >= maxOffset();

      const more = $('#calMore');
      if (more) {
        const i = SPANS.indexOf(cal.span);
        const grown = i < SPANS.length - 1;
        more.hidden = !grown && i > 0;
        more.textContent = grown ? 'Pokaż kolejne ' + SPANS[i + 1] + ' tygodnie' : 'Pokaż tylko najbliższy tydzień';
        more.dataset.grow = String(grown);
      }
    }

    function paintTimes() {
      const g = days.find(d => d.k === activeDay);
      if (!g || !g.times.length) {
        const closed = g && windowsFor(g.date) === null;
        box.innerHTML = `<p class="cal__none">${closed
          ? 'W niedziele nie przyjmuję. Najbliższy wolny termin znajdziesz strzałką obok.'
          : 'Na ten dzień zostały już wszystkie godziny. Wybierz inny albo zobacz kolejne tygodnie.'}</p>`;
        return;
      }
      box.innerHTML = g.times.map(w => `
        <button type="button" class="slot" data-iso="${w.toISOString()}"
                data-min="${min}"
                aria-pressed="${picked && picked.toISOString() === w.toISOString()}">
          <span>${pad(w.getHours())}:00</span><small>${min} min</small>
        </button>`).join('');

      $$('.slot', box).forEach(b => b.addEventListener('click', () => {
        picked = new Date(b.dataset.iso);
        $$('.slot', box).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        renderOut();
      }));
    }

    function renderOut() {
      if (!out) return;
      if (!picked) {
        out.innerHTML = `<p class="cal__idle">Wybierz godzinę powyżej. Potwierdzę termin i zarezerwuję go dla Ciebie.</p>`;
        return;
      }
      const when = picked.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });
      const price = priceFor(state.treatment, min);
      const msg = `Cześć! Chcę umówić masaż z dojazdem. ${when} o ${pad(picked.getHours())}:00, ${treat.name}, ${min} min, ${price} zł. Gdzie mam przyjechać?`;
      const wa = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg);
      const tel = CONFIG.phoneHref + '?p=' + encodeURIComponent(`Umów masaż ${when} ${pad(picked.getHours())}:00`);
      out.innerHTML = `
        <p><b>${when}</b>, godz. ${pad(picked.getHours())}:00 · ${treat.name.toLowerCase()} · ${min} min · ${price} zł</p>
        <span style="flex:1"></span>
        <a class="btn btn--sm" href="${tel}" data-href="phone">Potwierdź telefonem</a>
        <a class="btn btn--sm btn--ghost" href="${wa}" target="_blank" rel="noopener">Potwierdź na WhatsApp</a>`;
    }
  }

  function longDate(d) {
    return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }

  function initCalendarNav() {
    const prev = $('#calPrev'), next = $('#calNext'), more = $('#calMore');
    if (!prev && !next && !more) return;

    if (prev) prev.addEventListener('click', () => { cal.offset = Math.max(0, cal.offset - 1); rebuildSlots(); });
    if (next) next.addEventListener('click', () => { cal.offset = Math.min(maxOffset(), cal.offset + 1); rebuildSlots(); });

    if (more) more.addEventListener('click', () => {
      const i = SPANS.indexOf(cal.span);
      if (more.dataset.grow === 'true') {
        cal.span = SPANS[i + 1];
        cal.offset = Math.min(cal.offset, maxOffset());
      } else {
        cal.span = SPANS[0];
        cal.offset = 0;
      }
      activeDay = null;
      picked = null;
      rebuildSlots();
    });
  }

  /* ---- scroll reveals + hero load sequence ----------------------------- */
  function initReveals() {
    const hero = $('.hero');
    if (hero) {
      $$('[data-hero]', hero).forEach((el, i) => el.style.setProperty('--i', i));
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          $$('[data-hero]').forEach(el => el.classList.add('in'));
        });
      });
    }

    $$('h1 .ln').forEach((ln, i) => {
      ln.style.transitionDelay = (120 + i * 90) + 'ms';
      const t = ln.querySelector('.t');
      if (t) t.style.transitionDelay = (120 + i * 90) + 'ms';
    });

    // grouped children land one after another
    $$('[data-anim="spread"]').forEach(g => {
      Array.from(g.children).forEach((c, i) => c.style.setProperty('--i', i));
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const group = el.parentElement;
        if (group && !el.style.getPropertyValue('--i')) {
          const sibs = Array.from(group.children).filter(c => c.hasAttribute('data-r'));
          el.style.setProperty('--i', Math.max(0, sibs.indexOf(el)));
        }
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: .06 });

    $$('[data-r]:not(.in)').forEach(el => io.observe(el));
    $$('[data-anim="spread"]:not(.in)').forEach(el => io.observe(el));
  }

  /* ---- header condense + scroll progress + hero drift ------------------ */
  function initScrollChrome() {
    const hd = $('.hd'), prog = $('#prog');
    const drift = $('.hero__fig .ph');
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ticking = false;
    function onScroll() {
      const y = window.scrollY;
      if (hd) hd.classList.toggle('stuck', y > 12);
      if (prog) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        prog.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      }
      if (drift && !calm) {
        // the hero photo settles a little slower than the page, so the fold breathes
        const p = Math.max(0, Math.min(1, y / (window.innerHeight * .9)));
        drift.style.transform = `translate3d(0, ${(p * 46).toFixed(2)}px, 0) scale(${(1 + p * .04).toFixed(4)})`;
      }
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();
  }

  /* ---- mark photos as loaded so they can fade in ----------------------- */
  function initPhotoFade() {
    $$('.ph img').forEach(img => {
      const done = () => img.classList.add('ready');
      if (img.complete && img.naturalWidth) done();
      else img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  }

  /* ---- gallery lightbox ------------------------------------------------ */
  function initLightbox() {
    const gal = $('#gallery'), lb = $('#lb');
    if (!gal || !lb) return;
    const imgs = $$('button', gal).map(b => ({
      full: $('img', b).dataset.full || $('img', b).src,
      cap: ($('img', b).alt || b.getAttribute('aria-label') || '').trim()
    }));
    const lbImg = $('img', lb), lbCap = $('.lb__cap span', lb), lbCapT = $('.lb__cap b', lb);
    let i = 0, last = null;

    function open(n) {
      i = (n + imgs.length) % imgs.length;
      lbImg.src = imgs[i].full;
      lbImg.alt = imgs[i].cap;
      lbCap.textContent = pad(i + 1) + ' / ' + imgs.length;
      lbCapT.textContent = imgs[i].cap;
      lb.classList.add('on');
      lb.setAttribute('aria-hidden', 'false');
      last = document.activeElement;
      $('.lb__x', lb).focus();
    }
    function close() {
      lb.classList.remove('on');
      lb.setAttribute('aria-hidden', 'true');
      if (last) last.focus();
    }

    $$('button', gal).forEach((b, n) => b.addEventListener('click', () => open(n)));
    $('.lb__x', lb).addEventListener('click', close);
    $('.lb__p', lb).addEventListener('click', () => open(i - 1));
    $('.lb__n', lb).addEventListener('click', () => open(i + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });

    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') open(i - 1);
      else if (e.key === 'ArrowRight') open(i + 1);
      else if (e.key === 'Tab') {
        const f = $$('button', lb);
        const idx = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(idx + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });

    let x0 = null;
    lb.addEventListener('touchstart', e => (x0 = e.changedTouches[0].clientX), { passive: true });
    lb.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 48) open(i + (dx < 0 ? 1 : -1));
      x0 = null;
    }, { passive: true });
  }

  /* ---- mobile drawer ---------------------------------------------------- */
  function initDrawer() {
    const b = $('.burger'), d = $('.drawer');
    if (!b || !d) return;
    b.addEventListener('click', () => {
      const on = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', String(!on));
      d.classList.toggle('on', !on);
      document.body.style.overflow = !on ? 'hidden' : '';
    });
    $$('a', d).forEach(a => a.addEventListener('click', () => {
      b.setAttribute('aria-expanded', 'false');
      d.classList.remove('on');
      document.body.style.overflow = '';
    }));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && d.classList.contains('on')) b.click();
    });
  }

  /* ---- go --------------------------------------------------------------- */
  function init() {
    hydrate();
    initTheme();
    initScale();
    initMatrix();
    setDuration(CONFIG.defaultDuration);
    initCalendarNav();
    rebuildSlots();
    initReveals();
    initScrollChrome();
    initPhotoFade();
    initLightbox();
    initDrawer();
    document.documentElement.classList.add('js-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // exposed for the automated checks
  window.__cal = { rebuildSlots, collectSlots, daySlots, state, cal, SPANS, HORIZON, priceFor };
})();
