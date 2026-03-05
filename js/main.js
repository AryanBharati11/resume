/* =============================================
   MAIN.JS
   Navigation, typing animation, dark mode,
   back to top, footer year
   ============================================= */

// ---- Loader ----
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }, 600);
});

// ---- Navbar scroll behavior ----
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  navbar.classList.toggle('scrolled', scrollY > 20);
  backToTop.classList.toggle('visible', scrollY > 400);
  updateActiveNav();
});

// ---- Active nav highlight ----
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  let current = '';
  sections.forEach((sec) => {
    const top = sec.offsetTop - 90;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });
  navLinks.forEach((link) => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
}

// ---- Back to top ----
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ---- Mobile nav toggle ----
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close menu on link click
navLinks.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// ---- Dark / Light Mode Toggle ----
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
});

// ---- Typing Animation ----
const ROLES = [
  'Electronics Engineer',
  'VLSI Enthusiast',
  'PCB Designer',
  'FPGA Programmer',
  'Embedded Systems Dev',
];

let roleIdx = 0;
let charIdx = 0;
let isDeleting = false;
const typingEl = document.getElementById('typingText');

function typeRole() {
  if (!typingEl) return;
  const current = ROLES[roleIdx];
  if (isDeleting) {
    typingEl.textContent = current.substring(0, charIdx - 1);
    charIdx--;
  } else {
    typingEl.textContent = current.substring(0, charIdx + 1);
    charIdx++;
  }

  let delay = isDeleting ? 60 : 100;
  if (!isDeleting && charIdx === current.length) {
    delay = 1800;
    isDeleting = true;
  } else if (isDeleting && charIdx === 0) {
    isDeleting = false;
    roleIdx = (roleIdx + 1) % ROLES.length;
    delay = 300;
  }
  setTimeout(typeRole, delay);
}

setTimeout(typeRole, 1200);

// ---- Footer year ----
const footerYear = document.getElementById('footerYear');
if (footerYear) footerYear.textContent = new Date().getFullYear();

// ---- Download CV button (generates print view) ----
const downloadBtn = document.getElementById('downloadBtn');
if (downloadBtn) {
  downloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.print();
  });
}
