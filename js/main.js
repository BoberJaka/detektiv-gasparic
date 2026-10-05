/* ==========================================================================
   Boštjan Gašparič – zasebni detektiv
   main.js – brez knjižnic, brez sledenja, brez piškotkov.

   1. Mobilni meni (hamburger)
   2. Letnica v nogi
   3. Kontaktni obrazec: validacija, honeypot, sporočila,
      pošiljanje prek PHP ALI Formspree (samodejno zazna po atributu action)
   ========================================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* 1. MOBILNI MENI ------------------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('.nav-toggle__label').textContent = open ? 'Zapri' : 'Meni';
      nav.classList.toggle('is-open', open);
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Zapri z Escape in vrni fokus na gumb
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    // Zapri ob kliku na povezavo (npr. sidro na isti strani)
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
  }

  /* 2. LETNICA ------------------------------------------------------------ */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  /* 3. KONTAKTNI OBRAZEC -------------------------------------------------- */
  var form = document.getElementById('kontaktni-obrazec');
  if (!form) return;

  var alertOk = document.getElementById('obrazec-uspeh');
  var alertErr = document.getElementById('obrazec-napaka');
  var submitBtn = form.querySelector('[type="submit"]');

  // Čas nalaganja – robot, ki odda obrazec v manj kot 3 s, je zavrnjen (tudi v PHP)
  var started = form.querySelector('[name="cas_zacetka"]');
  if (started) started.value = String(Math.floor(Date.now() / 1000));

  // Sporočilo po preusmeritvi iz poslji.php (?poslano=1 ali ?napaka=1)
  var params = new URLSearchParams(window.location.search);
  if (params.get('poslano') === '1') showAlert(alertOk);
  if (params.get('napaka') === '1') showAlert(alertErr);

  function showAlert(el) {
    if (!el) return;
    el.hidden = false;
    el.setAttribute('tabindex', '-1');
    el.focus();
  }

  function setError(field, message) {
    var box = document.getElementById(field.getAttribute('aria-describedby').split(' ').pop());
    if (message) {
      field.setAttribute('aria-invalid', 'true');
      if (box) box.textContent = message;
    } else {
      field.removeAttribute('aria-invalid');
      if (box) box.textContent = '';
    }
  }

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var phoneRe = /^[+()\d\s\/-]{6,20}$/;

  function validate() {
    var firstInvalid = null;
    var kontakt = form.elements.kontakt;
    var opis = form.elements.opis;
    var tip = form.querySelector('[name="tip"]:checked');
    var tipGroup = document.getElementById('tip-skupina');
    var soglasje = form.elements.soglasje;

    // Kontakt: e-pošta ALI telefon
    var k = kontakt.value.trim();
    if (!k) {
      setError(kontakt, 'Vpišite telefon ali e-poštni naslov, da vas lahko kontaktiram.');
    } else if (!emailRe.test(k) && !phoneRe.test(k)) {
      setError(kontakt, 'Vpišite veljaven e-poštni naslov ali telefonsko številko.');
    } else {
      setError(kontakt, '');
    }
    if (kontakt.getAttribute('aria-invalid')) firstInvalid = firstInvalid || kontakt;

    // Vrsta naročnika
    var tipErr = document.getElementById('tip-napaka');
    if (!tip) {
      tipGroup.setAttribute('aria-invalid', 'true');
      tipErr.textContent = 'Izberite, ali pišete kot podjetje ali kot posameznik.';
      firstInvalid = firstInvalid || form.querySelector('[name="tip"]');
    } else {
      tipGroup.removeAttribute('aria-invalid');
      tipErr.textContent = '';
    }

    // Opis
    if (opis.value.trim().length < 20) {
      setError(opis, 'Na kratko opišite zadevo (vsaj 20 znakov). Podrobnosti lahko pojasnite pozneje.');
      firstInvalid = firstInvalid || opis;
    } else {
      setError(opis, '');
    }

    // Soglasje
    if (!soglasje.checked) {
      setError(soglasje, 'Brez soglasja vašega sporočila ne morem obdelati.');
      firstInvalid = firstInvalid || soglasje;
    } else {
      setError(soglasje, '');
    }

    return firstInvalid;
  }

  // Sprotno čiščenje napak
  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-invalid') === 'true') validate();
  });

  form.addEventListener('submit', function (e) {
    if (alertErr) alertErr.hidden = true;

    // Honeypot – če je polje izpolnjeno, gre za robota: tiho prekini
    if (form.elements.spletna_stran && form.elements.spletna_stran.value) {
      e.preventDefault();
      return;
    }

    var invalid = validate();
    if (invalid) {
      e.preventDefault();
      invalid.focus();
      return;
    }

    // Formspree: pošlji v ozadju, da obiskovalec ostane na strani.
    // PHP (php/poslji.php): pusti običajno oddajo – skripta preusmeri nazaj s ?poslano=1.
    if (form.action.indexOf('formspree.io') === -1) return;

    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Pošiljam …';

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (res) {
        if (!res.ok) throw new Error('napaka');
        form.reset();
        form.hidden = true;
        showAlert(alertOk);
      })
      .catch(function () {
        showAlert(alertErr);
      })
      .then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Pošlji zaupno sporočilo';
      });
  });
})();
