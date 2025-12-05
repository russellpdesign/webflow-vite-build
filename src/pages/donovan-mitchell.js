import ScrollEngine from "../engine/ScrollEngine.js";
import SmoothScroll from "../engine/SmoothScroll.js";
import HomeScrollSection from "../sections/HomeScrollSection.js";
import MovePhotoSection from "../sections/MovePhotoSection.js";

window.addEventListener("DOMContentLoaded", () => {
  // the lower the ease value, the more easing there is
  const smooth = new SmoothScroll({ ease: 0.09 });
  
  const engine = new ScrollEngine({ smooth });
  window.engine = engine;          // <-- expose the engine instance
  window.ScrollEngine = ScrollEngine; // <-- expose static class so console can access it

  const movePhoto = new MovePhotoSection({ el: ".sticky-section.heroic-members-wrapper.reversed" });
  engine.register(movePhoto);

  // expose to console
  window.movePhoto = movePhoto;

//  const section = new HomeScrollSection({ el: ".home-scroll-section.is-don" });

  engine.register(new HomeScrollSection({ el: ".home-scroll-section.is-don" }));

  engine.start();
});