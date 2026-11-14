export function initProjectCarousel() {
  let slides = document.querySelectorAll("#projects .project-slide");
  const counter = document.getElementById("projectCounter");
  const prevBtn = document.getElementById("prevProject");
  const nextBtn = document.getElementById("nextProject");
  const section = document.getElementById("projects");

  if (!slides.length || !prevBtn || !nextBtn) return;

  let current = 0;
  let animating = false;
  let total = slides.length;
  section?.addEventListener('projectsUpdated', () => {
    const active = slides[current];
    slides = document.querySelectorAll('#projects .project-slide');
    total = slides.length;
    current = Math.max(0, Array.from(slides).indexOf(active));
    slides.forEach((slide, index) => slide.classList.toggle('active', index === current));
    if (counter) counter.textContent = `${current + 1} / ${total}`;
  });

  function triggerAnimation(slide) {
    slide.classList.remove("animate-in");
    void slide.offsetWidth;
    slide.classList.add("animate-in");
  }

  function showSlide(index) {
    if (animating) return;
    animating = true;
    slides[current].classList.remove("active", "animate-in");
    current = (index + total) % total;
    slides[current].classList.add("active");
    triggerAnimation(slides[current]);
    if (counter) counter.textContent = `${current + 1} / ${total}`;
    setTimeout(() => (animating = false), 400);
  }

  if (section) {
    new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) triggerAnimation(slides[current]);
      },
      { threshold: 0.25 },
    ).observe(section);
  }

  prevBtn.addEventListener("click", () => showSlide(current - 1));
  nextBtn.addEventListener("click", () => showSlide(current + 1));

  document.addEventListener("keydown", (e) => {
    if (!section) return;
    const { top, bottom } = section.getBoundingClientRect();
    if (top >= window.innerHeight || bottom <= 0) return;
    if (e.key === "ArrowLeft") showSlide(current - 1);
    if (e.key === "ArrowRight") showSlide(current + 1);
  });

  const allowSwipe = !window.matchMedia("(hover: none)").matches;
  if (allowSwipe) {
    let touchStartX = 0;
    section?.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
      },
      { passive: true },
    );

    section?.addEventListener(
      "touchend",
      (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) showSlide(current + (dx < 0 ? 1 : -1));
      },
      { passive: true },
    );
  }

  if (counter) counter.textContent = `1 / ${total}`;
}
