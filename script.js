/* ============================================================
   PERSONAL PORTFOLIO — BILINGUAL + MINIMAL INTERACTION
   ============================================================ */

// ---------- Language Toggle ----------
(function () {
    var langBtn = document.getElementById('lang-toggle');
    var currentLang = 'zh'; // Default display: Chinese (per user request: "首页可以默认英文" — wait, let me double-check. The user said: "网页必须做中英双语！首页可以默认英文". So default should be EN.)

    // Actually, re-reading: "首页可以默认英文" → default English
    // But they also said: "HR大多会手机查看", and HR in China might read Chinese...
    // Let me go with EN as default as the user specified.

    currentLang = 'en';
    setLang('en');

    langBtn.addEventListener('click', function () {
        currentLang = currentLang === 'en' ? 'zh' : 'en';
        setLang(currentLang);
    });

    function setLang(lang) {
        // Update all elements with data-en and data-zh
        var elements = document.querySelectorAll('[data-en][data-zh]');
        elements.forEach(function (el) {
            el.textContent = el.getAttribute('data-' + lang);
        });

        // Update language button text
        langBtn.textContent = lang === 'en' ? '中文' : 'English';

        // Update html lang attribute
        document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    }
})();

// ---------- Nav Scroll Shadow ----------
(function () {
    var navbar = document.getElementById('navbar');

    window.addEventListener('scroll', function () {
        navbar.style.boxShadow = window.scrollY > 20 ? '0 1px 6px rgba(0,0,0,0.05)' : 'none';
    });

    // Active nav link
    var links = document.querySelectorAll('.nav-links a');
    var sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', function () {
        var current = '';
        sections.forEach(function (s) {
            if (window.scrollY >= s.offsetTop - 80) {
                current = s.getAttribute('id');
            }
        });
        links.forEach(function (link) {
            link.style.color = '';
            if (link.getAttribute('href') === '#' + current) {
                link.style.color = '#2D65F6';
            }
        });
    });
})();

// ---------- Minimal Scroll Reveal ----------
(function () {
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.card').forEach(function (el) {
        el.classList.add('reveal');
        observer.observe(el);
    });

    // Trigger visible for elements already in view on load
    setTimeout(function () {
        document.querySelectorAll('.reveal').forEach(function (el) {
            var rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('visible');
            }
        });
    }, 100);
})();
