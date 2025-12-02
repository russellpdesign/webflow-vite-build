import ScrollEngine from "../engine/ScrollEngine.js";
import SmoothScroll from "../engine/SmoothScroll.js";
import HomeScrollSection from "../sections/HomeScrollSection.js";

window.addEventListener("DOMContentLoaded", () => {
  const smooth = new SmoothScroll({ ease: 0.08 });
  const engine = new ScrollEngine({ smooth });

  const section = new HomeScrollSection({
    el: ".home-scroll-section.is-don"
  });

  engine.register(section);
  engine.start();
});