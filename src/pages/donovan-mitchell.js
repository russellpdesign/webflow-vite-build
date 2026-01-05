import ScrollEngine from "../engine/ScrollEngine.js";
import SmoothScroll from "../engine/SmoothScroll.js";
import HomeScrollSection from "../sections/HomeScrollSection.js";
import MovePhotoSection from "../sections/MovePhotoSection.js";

window.addEventListener("DOMContentLoaded", () => {
  // the lower the ease value, the more smoothing inertia there is
  const smooth = new SmoothScroll({ ease: 0.07 }); // overriding default of .08 as defined in class constructor method
  
  const engine = new ScrollEngine({ smooth });
  window.engine = engine;          // <-- expose the engine instance
  window.ScrollEngine = ScrollEngine; // <-- expose static class so console can access it

  // const movePhoto = new MovePhotoSection({ el: ".sticky-section.heroic-members-wrapper.reversed" });
  // engine.register(movePhoto);
  // // expose to console
  // window.movePhoto = movePhoto;

//  const section = new HomeScrollSection({ el: ".home-scroll-section.is-don" });

  engine.register(new HomeScrollSection({ el: ".home-scroll-section.is-don" }));
  // engine.register(new MovePhotoSection({ el: ".home-scroll-visual" }));

  engine.start();
});