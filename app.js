document.addEventListener('DOMContentLoaded', () => {

  // ── TextType — two-phase sequential engine (no loop, runs once) ──────────
  //  Phase 1: type the prefix text into prefixEl (plain white)
  //  Phase 2: type the name into targetEl (gradient)
  //  After both phases complete, reveal hero-after-type elements
  function initTextTypeSequential({
    prefixEl,
    targetEl,
    cursorEl,
    prefixText = "Hi, I'm ",
    nameText = 'Sai Medhas Pilli',
    typingSpeed = 70,
    initialDelay = 200,
    cursorBlinkDuration = 0.5,
    onComplete = null,
  }) {
    if (!prefixEl || !targetEl) return;

    // GSAP cursor blink — starts immediately
    if (cursorEl && typeof gsap !== 'undefined') {
      gsap.set(cursorEl, { opacity: 1 });
      gsap.to(cursorEl, {
        opacity: 0,
        duration: cursorBlinkDuration,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
      });
    }

    function typeInto(el, text, speed, delay, done) {
      let i = 0;
      function step() {
        if (i < text.length) {
          el.textContent += text[i++];
          setTimeout(step, speed);
        } else {
          if (typeof done === 'function') done();
        }
      }
      setTimeout(step, delay);
    }

    // Phase 1: type prefix, then Phase 2: type name
    typeInto(prefixEl, prefixText, typingSpeed, initialDelay, () => {
      typeInto(targetEl, nameText, typingSpeed, 0, () => {
        // All done — fire callback
        if (typeof onComplete === 'function') onComplete();
      });
    });
  }

  // ── Initialise on hero headline ───────────────────────────────────────────
  const typePrefixEl  = document.getElementById('text-type-prefix');
  const typeTargetEl  = document.getElementById('text-type-target');
  const typeCursorEl  = document.getElementById('text-type-cursor');
  const heroAfterEls  = document.querySelectorAll('.hero-after-type');

  initTextTypeSequential({
    prefixEl:   typePrefixEl,
    targetEl:   typeTargetEl,
    cursorEl:   typeCursorEl,
    prefixText: "Hi, I'm ",
    nameText:   'Sai Medhas Pilli',
    typingSpeed:  72,
    initialDelay: 250,
    onComplete: () => {
      // Staggered slow-motion reveal of elements below the headline
      heroAfterEls.forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 200);
      });
    },
  });

  // 1. Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ── React Bits <Dock /> Magnification Engine ──────────────────────────
  function initDockMagnification({
    dockSelector = '#nav-dock',
    itemSelector = '.dock-item',
    baseItemSize = 40,
    magnification = 58,
    distance = 135,
  } = {}) {
    const dock = document.querySelector(dockSelector);
    if (!dock) return;

    const items = dock.querySelectorAll(itemSelector);
    let rafId = null;

    function updateItemSizes(mouseX) {
      items.forEach(item => {
        const rect = item.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const dist = Math.abs(mouseX - centerX);
        const icon = item.querySelector('.dock-icon');

        if (dist < distance) {
          // Cosine spring curve for magnification
          const factor = Math.cos((dist / distance) * (Math.PI / 2));
          const targetSize = baseItemSize + (magnification - baseItemSize) * factor;
          const targetScale = 1 + 0.25 * factor;

          item.style.width = `${targetSize.toFixed(1)}px`;
          item.style.height = `${targetSize.toFixed(1)}px`;
          if (icon) {
            icon.style.transform = `scale(${targetScale.toFixed(2)})`;
          }
        } else {
          item.style.width = `${baseItemSize}px`;
          item.style.height = `${baseItemSize}px`;
          if (icon) {
            icon.style.transform = 'scale(1)';
          }
        }
      });
    }

    function resetItemSizes() {
      items.forEach(item => {
        item.style.width = `${baseItemSize}px`;
        item.style.height = `${baseItemSize}px`;
        const icon = item.querySelector('.dock-icon');
        if (icon) {
          icon.style.transform = 'scale(1)';
        }
      });
    }

    dock.addEventListener('mousemove', (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        updateItemSizes(e.clientX);
      });
    });

    dock.addEventListener('mouseleave', () => {
      if (rafId) cancelAnimationFrame(rafId);
      resetItemSizes();
    });
  }

  initDockMagnification();

  // 2. Force Dark Theme (Theme Toggling Removed)
  document.documentElement.classList.add('dark');

  // 3. Mobile Navigation Drawer
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuLinks = document.querySelectorAll('#mobile-menu a');
  const menuIconOpen = document.getElementById('menu-icon-open');
  const menuIconClose = document.getElementById('menu-icon-close');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      mobileMenu.classList.toggle('flex');
      menuIconOpen.classList.toggle('hidden');
      menuIconClose.classList.toggle('hidden');
    });

    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
        menuIconOpen.classList.remove('hidden');
        menuIconClose.classList.add('hidden');
      });
    });
  }

  // 4. Mouse-tracking Glow, 3D Interactive Tilt & Edge Proximity Gestures for Cards
  const cards = document.querySelectorAll('.card-glow-wrapper');
  cards.forEach(card => {
    let bounds;
    function rotateToMouse(e) {
      if (!bounds) bounds = card.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const leftX = mouseX - bounds.x;
      const topY = mouseY - bounds.y;
      const center = {
        x: leftX - bounds.width / 2,
        y: topY - bounds.height / 2
      };
      
      card.style.setProperty('--mouse-x', `${leftX}px`);
      card.style.setProperty('--mouse-y', `${topY}px`);

      // Detect proximity to card perimeter edges (within 45px of any edge)
      const edgeDist = Math.min(
        leftX,
        bounds.width - leftX,
        topY,
        bounds.height - topY
      );
      if (edgeDist < 45) {
        card.classList.add('edge-hovered');
      } else {
        card.classList.remove('edge-hovered');
      }

      // Gentle 3D perspective tilt on desktop screens with tactile edge compression
      if (window.innerWidth > 768) {
        const tiltX = -(center.y / (bounds.height / 2)) * 4;
        const tiltY = (center.x / (bounds.width / 2)) * 4;
        card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-4px)`;
      }
    }

    card.addEventListener('mouseenter', () => {
      bounds = card.getBoundingClientRect();
      card.addEventListener('mousemove', rotateToMouse);
    });

    card.addEventListener('mouseleave', () => {
      card.removeEventListener('mousemove', rotateToMouse);
      bounds = null;
      card.classList.remove('edge-hovered');
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  // 5. Intersection Observer for Scroll Reveal Animations (with Staggering)
  const revealElements = document.querySelectorAll('.reveal');

  // Auto-stagger grid items for cascading fluid reveals
  document.querySelectorAll('.grid').forEach(grid => {
    const gridReveals = grid.querySelectorAll(':scope > .reveal');
    gridReveals.forEach((el, index) => {
      el.style.transitionDelay = `${(index % 4) * 0.12}s`;
    });
  });

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Reveal only once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // 6. Navigation Link Highlighting, Scroll Progress & Back-to-Top
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link, #mobile-menu a');
  const scrollProgressBar = document.getElementById('scroll-progress');
  const backToTopBtn = document.getElementById('back-to-top');
  const progressCircle = backToTopBtn ? backToTopBtn.querySelector('circle') : null;
  const circumference = 2 * Math.PI * 25; // r=25 -> ~157.08

  if (progressCircle) {
    progressCircle.style.strokeDasharray = `${circumference}`;
    progressCircle.style.strokeDashoffset = `${circumference}`;
  }

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  window.addEventListener('scroll', () => {
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
    const totalDocHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = totalDocHeight > 0 ? Math.min(100, Math.max(0, (scrollPos / totalDocHeight) * 100)) : 0;

    // Top laser scroll progress
    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${scrollPercent}%`;
    }

    // Back to top floating button
    if (backToTopBtn) {
      if (scrollPos > 350) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }

      if (progressCircle) {
        const offset = circumference - (scrollPercent / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
      }
    }

    // Section highlight
    let current = '';
    if ((window.innerHeight + scrollPos) >= document.documentElement.scrollHeight - 15) {
      current = 'contact';
    } else {
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.offsetHeight;
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          current = section.getAttribute('id');
        }
      });
    }

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // 7. Contact Form Handling & Web3Forms Integration
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Get values
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const message = document.getElementById('message').value.trim();

      // Basic Validation
      if (!name || !email || !subject || !message) {
        showStatus('Please fill in all fields.', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        showStatus('Please enter a valid email address.', 'error');
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnHTML = submitBtn.innerHTML;

      // Extract form data
      const formData = new FormData(contactForm);
      const accessKey = formData.get('access_key');

      // Check if access key is still default placeholder
      if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
        showStatus('Please configure your free Web3Forms Access Key in index.html to receive messages.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Sending...
      `;

      try {
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: json
        });

        const data = await response.json();

        if (response.status === 200 && data.success) {
          showStatus('Thank you! Your message has been sent successfully.', 'success');
          contactForm.reset();
        } else {
          showStatus(data.message || 'Failed to send message. Please try again later.', 'error');
        }
      } catch (err) {
        console.error('Contact form submission error:', err);
        showStatus('A network error occurred. Please check your connection and try again.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      }
    });
  }

  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function showStatus(msg, type) {
    if (!formStatus) return;
    
    formStatus.textContent = msg;
    formStatus.className = 'mt-4 text-sm font-medium p-3 rounded-lg text-center transition-all duration-300';
    
    if (type === 'success') {
      formStatus.classList.add('bg-emerald-500/10', 'text-emerald-400', 'border', 'border-emerald-500/20');
    } else {
      formStatus.classList.add('bg-rose-500/10', 'text-rose-400', 'border', 'border-rose-500/20');
    }

    formStatus.style.opacity = '1';

    // Hide alert after 5 seconds
    setTimeout(() => {
      formStatus.style.opacity = '0';
      setTimeout(() => {
        formStatus.className = 'mt-4 text-sm font-medium text-center opacity-0 h-0 overflow-hidden';
      }, 300);
    }, 5000);
  }

  // 8. Premium Particle Network + Shooting Stars + Aurora Canvas
  const bgCanvas = document.getElementById('squares-canvas');
  if (bgCanvas) {
    const ctx = bgCanvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = window.innerWidth;
    let H = window.innerHeight;

    function setSize() {
      W = window.innerWidth;
      H = window.innerHeight;
      bgCanvas.width = W * dpr;
      bgCanvas.height = H * dpr;
      bgCanvas.style.width = W + 'px';
      bgCanvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    setSize();
    window.addEventListener('resize', setSize);

    // ── Mouse tracking ──────────────────────────────────────────────
    const mouse = { x: W / 2, y: H / 2, active: false };
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
    window.addEventListener('mouseleave', () => { mouse.active = false; });

    // ── Colour palette (deep-space: muted cool tones) ───────────────
    const COLOURS = [
      'rgba(0,160,195,',    // deep teal-cyan
      'rgba(65,80,210,',    // deep cobalt-indigo
      'rgba(110,45,190,',   // deep violet-purple
      'rgba(0,150,105,',    // deep teal-emerald
      'rgba(40,90,200,',    // cold steel-blue
    ];

    // ── Aurora breathing blobs (canvas version) ──────────────────────
    const blobs = [
      { x: 0.15, y: 0.20, r: 0.55, color: 'rgba(0,150,190,',   t: 0,    speed: 0.00018 },
      { x: 0.80, y: 0.55, r: 0.60, color: 'rgba(55,70,200,',   t: 2.1,  speed: 0.00014 },
      { x: 0.40, y: 0.85, r: 0.50, color: 'rgba(100,35,180,',  t: 4.3,  speed: 0.00021 },
      { x: 0.70, y: 0.15, r: 0.45, color: 'rgba(0,135,90,',    t: 6.0,  speed: 0.00017 },
    ];

    // ── Particles ────────────────────────────────────────────────────
    const PARTICLE_COUNT = Math.min(200, Math.floor(W * H / 6500));
    const LINK_DIST  = 200;
    const REPEL_DIST = 120;
    const REPEL_FORCE = 0.06;

    class Particle {
      constructor() { this.reset(true); }
      reset(init) {
        this.x  = Math.random() * W;
        this.y  = init ? Math.random() * H : -10;
        const spd = 0.18 + Math.random() * 0.28;
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * spd;
        this.vy = Math.sin(angle) * spd;
        this.radius  = 1.2 + Math.random() * 2.2;
        this.baseAlpha = 0.30 + Math.random() * 0.28;
        this.alpha   = 0;
        this.targetAlpha = this.baseAlpha;
        this.colBase = COLOURS[Math.floor(Math.random() * COLOURS.length)];
        this.pulseT  = Math.random() * Math.PI * 2;
        this.pulseSpd= 0.008 + Math.random() * 0.012;
      }
      update() {
        // Mouse repulsion
        if (mouse.active) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < REPEL_DIST && d > 0) {
            const force = (1 - d / REPEL_DIST) * REPEL_FORCE;
            this.vx += (dx / d) * force;
            this.vy += (dy / d) * force;
          }
        }
        // Damping
        this.vx *= 0.992;
        this.vy *= 0.992;
        this.x += this.vx;
        this.y += this.vy;
        // Pulse
        this.pulseT += this.pulseSpd;
        this.alpha += (this.targetAlpha - this.alpha) * 0.04;
        this.targetAlpha = this.baseAlpha + Math.sin(this.pulseT) * 0.2;
        // Wrap
        if (this.x < -20) this.x = W + 20;
        if (this.x > W + 20) this.x = -20;
        if (this.y < -20) this.y = H + 20;
        if (this.y > H + 20) this.y = -20;
      }
      draw() {
        // Glow
        const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 4);
        grd.addColorStop(0,   this.colBase + this.alpha + ')');
        grd.addColorStop(0.4, this.colBase + (this.alpha * 0.4) + ')');
        grd.addColorStop(1,   this.colBase + '0)');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        // Core dot
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.colBase + Math.min(this.alpha + 0.3, 1) + ')';
        ctx.fill();
      }
    }

    const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

    // ── Shooting stars / Meteors ─────────────────────────────────────
    const MAX_METEORS = 5;
    const meteors = [];

    class Meteor {
      constructor() { this.spawn(); }
      spawn() {
        this.x = Math.random() * W * 1.5;
        this.y = -20;
        const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.4;
        const spd = 6 + Math.random() * 10;
        this.vx = Math.cos(angle) * spd;
        this.vy = Math.sin(angle) * spd;
        this.len = 80 + Math.random() * 150;
        this.alpha = 0;
        this.fade = 0;
        this.col = COLOURS[Math.floor(Math.random() * COLOURS.length)];
        this.active = true;
        this.delay = Math.random() * 200;
      }
      update() {
        if (this.delay > 0) { this.delay--; return; }
        this.x += this.vx;
        this.y += this.vy;
        if (this.fade === 0 && this.alpha < 1) this.alpha = Math.min(1, this.alpha + 0.08);
        if (this.x > W + 200 || this.y > H + 200) {
          this.fade = 1;
          this.alpha -= 0.12;
          if (this.alpha <= 0) this.active = false;
        }
      }
      draw() {
        if (this.delay > 0 || this.alpha <= 0) return;
        const tailX = this.x - this.vx * (this.len / Math.abs(this.vx));
        const tailY = this.y - this.vy * (this.len / Math.abs(this.vy));
        const grd = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
        grd.addColorStop(0, this.col + this.alpha + ')');
        grd.addColorStop(1, this.col + '0)');
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grd;
        ctx.lineWidth = 1.8;
        ctx.shadowBlur = 7;
        ctx.shadowColor = this.col + '0.5)';
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Head glow
        const hGrd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 8);
        hGrd.addColorStop(0, this.col + this.alpha + ')');
        hGrd.addColorStop(1, this.col + '0)');
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = hGrd;
        ctx.fill();
      }
    }

    // Seed initial meteors
    for (let i = 0; i < MAX_METEORS; i++) {
      const m = new Meteor();
      m.delay += i * 60;
      meteors.push(m);
    }

    // ── Main render loop ─────────────────────────────────────────────
    let time = 0;

    function render() {
      time++;
      ctx.clearRect(0, 0, W, H);

      // ── 1. Pitch-black deep space base ─────────────────────────────
      ctx.fillStyle = '#000208';
      ctx.fillRect(0, 0, W, H);

      // ── 2. Aurora blobs (darker, cooler) ────────────────────────────
      ctx.save();
      blobs.forEach(b => {
        b.t += b.speed * 16;
        const bx = (b.x + Math.sin(b.t * 1.3) * 0.12) * W;
        const by = (b.y + Math.cos(b.t * 0.9) * 0.10) * H;
        const br = b.r * Math.max(W, H);
        const grd = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        grd.addColorStop(0,   b.color + '0.065)');
        grd.addColorStop(0.4, b.color + '0.025)');
        grd.addColorStop(1,   b.color + '0)');
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      });
      ctx.restore();

      // ── 3. Heavy vignette — bright centre, very dark edges ──────────
      const vig = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H) * 0.80);
      vig.addColorStop(0,   'rgba(0,2,10,0)');
      vig.addColorStop(0.45,'rgba(0,1,8,0.45)');
      vig.addColorStop(1,   'rgba(0,1,5,0.92)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      // ── 4. Particle links ───────────────────────────────────────────
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < LINK_DIST) {
            const opacity = (1 - dist / LINK_DIST) * 0.30;
            const grd = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grd.addColorStop(0, a.colBase + opacity + ')');
            grd.addColorStop(1, b.colBase + opacity + ')');
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = grd;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
        // Mouse link
        if (mouse.active) {
          const dx = particles[i].x - mouse.x;
          const dy = particles[i].y - mouse.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < LINK_DIST * 1.4) {
            const op = (1 - dist / (LINK_DIST * 1.4)) * 0.45;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = particles[i].colBase + op + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // ── 5. Update & draw particles ──────────────────────────────────
      particles.forEach(p => { p.update(); p.draw(); });

      // ── 6. Mouse cursor glow orb ────────────────────────────────────
      if (mouse.active) {
        const cGrd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 70);
        cGrd.addColorStop(0,   'rgba(0,150,190,0.07)');
        cGrd.addColorStop(0.5, 'rgba(55,70,200,0.03)');
        cGrd.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 80, 0, Math.PI * 2);
        ctx.fillStyle = cGrd;
        ctx.fill();
      }

      // ── 7. Shooting stars ───────────────────────────────────────────
      meteors.forEach((m, idx) => {
        m.update();
        m.draw();
        if (!m.active) meteors[idx] = new Meteor();
      });

      requestAnimationFrame(render);
    }

    render();
  }
});
