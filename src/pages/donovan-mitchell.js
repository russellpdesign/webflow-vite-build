import ScrollEngine from "../engine/ScrollEngine.js";
import SmoothScroll from "../engine/SmoothScroll.js";
import HomeScrollSection from "../sections/HomeScrollSection.js";
// import PhotoTravelOver from "../sections/PhotoTravelOver.js";

window.addEventListener("DOMContentLoaded", () => {
  const smooth = new SmoothScroll({ ease: 0.08 });
  const engine = new ScrollEngine({ smooth });

  engine.register(new HomeScrollSection({ el: ".home-scroll-section.is-don" }));
  // engine.register(new PhotoTravelOver({ el: ".sticky-section.heroic-members-wrapper.reversed" }));

  engine.start();
});