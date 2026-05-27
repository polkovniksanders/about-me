export function initAnimations(): void {
  // Respect prefers-reduced-motion at JS level (CSS handles it too — defense in depth)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll<HTMLElement>('[data-animate]').forEach((el) => {
      el.classList.add('is-visible');
    });
    return;
  }

  // Singleton observer — one instance for all animated elements, not per-element
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // fire once — prevents repeated callbacks
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  // JS hook via data-attribute (not BEM class — BEM is for styling, data-* for JS)
  document.querySelectorAll<HTMLElement>('[data-animate]').forEach((el) => {
    observer.observe(el);
  });

  initNavScrollSpy();
}

function initNavScrollSpy(): void {
  const nav = document.querySelector<HTMLElement>('.nav');
  const navLinks = document.querySelectorAll<HTMLAnchorElement>('.nav__link');
  const sections = document.querySelectorAll<HTMLElement>('section[id]');

  // Sticky nav background on scroll — passive listener for INP
  let rafId: number;
  window.addEventListener(
    'scroll',
    () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        nav?.classList.toggle('is-scrolled', window.scrollY > 80);
      });
    },
    { passive: true }
  );

  // Scroll-spy: highlight nav link for current section
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.toggle(
              'is-active',
              link.getAttribute('href') === `#${entry.target.id}`
            );
          });
        }
      });
    },
    { rootMargin: '-30% 0px -60% 0px' }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}
