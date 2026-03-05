/* =============================================
   ANIMATIONS.JS
   Scroll-triggered reveal, skill bars, particles
   ============================================= */

// ---- Intersection Observer for reveal ----
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  let revealCount = 0;
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = (revealCount % 6) * 80;
          revealCount++;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  els.forEach((el) => obs.observe(el));
}

// ---- Skill bar animation ----
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar');
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const width = bar.getAttribute('data-width');
          bar.style.width = width + '%';
          obs.unobserve(bar);
        }
      });
    },
    { threshold: 0.4 }
  );
  bars.forEach((bar) => obs.observe(bar));
}

// ---- Particle canvas ----
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let raf;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.r = Math.random() * 2.5 + 1;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.alpha = Math.random() * 0.5 + 0.2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(79, 142, 247, ${this.alpha})`;
      ctx.fill();
    }
  }

  function buildParticles() {
    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 12000));
    particles = Array.from({ length: count }, () => new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(79, 142, 247, ${0.12 * (1 - dist / 120)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => { p.update(); p.draw(); });
    drawConnections();
    raf = requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
    buildParticles();
  });

  resize();
  buildParticles();
  animate();
}

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initSkillBars();
  initParticles();
});
