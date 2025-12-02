import ScrollEngine from "../engine/ScrollEngine.js";
import SmoothScroll from "../engine/SmoothScroll.js";
import HomeScrollSection from "../sections/HomeScrollSection.js";

window.addEventListener("DOMContentLoaded", () => {
  const smooth = new SmoothScroll({ ease: 0.08 });
  const engine = new ScrollEngine({ smooth });

  // create instance with selector or element
  const homeSection = new HomeScrollSection({ el: ".home-scroll-section.is-don" });

  engine.register(homeSection);

  // measure right away and whenever resize occurs (engine does this in examples)
  engine.measureAll();
  engine.start();
});