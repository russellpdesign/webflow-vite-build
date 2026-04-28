import ScrollEngine from "../engine/ScrollEngine.ts";
import SmoothScroll from "../engine/SmoothScroll.js";
import HomeScrollSection from "../sections/HomeScrollSection.ts";
import MovePhotoSection from "../sections/MovePhotoSection.ts";
import PhotoOverlapSection from "../sections/PhotoOverlapSection.ts";
import PhotoScaleDown from "../sections/PhotoScaleDownSection.ts";
import HorizontalScrollSection from "../sections/HorizontalScrollSection.ts";

window.addEventListener("DOMContentLoaded", () => {
  // the lower the ease value, the more smoothing inertia there is
  const smooth = new SmoothScroll({ ease: 0.12 }); // overriding default of .08 as defined in class constructor method
  
  const engine = new ScrollEngine({ smooth });

  // By bind the engine to the window object, we can now type "engine" in the console and view every variable value at once without needing to inject individual logs
  window.engine = engine; // <-- expose the engine instance
  window.ScrollEngine = ScrollEngine; // <-- expose static class so console can access it

  // to bind a specific class instance we can use the below code
  // const movePhoto = new MovePhotoSection({ el: ".sticky-section.heroic-members-wrapper.reversed" });
  // engine.register(movePhoto);
  // // expose to console
  // window.movePhoto = movePhoto;

  engine.register(new HomeScrollSection({ el: ".home-scroll-section.is-don" }));
  engine.register(new MovePhotoSection({ el: ".home-scroll-visual" }));
  engine.register(new PhotoOverlapSection({ el: ".photo-overlap-section" }));
  engine.register(new PhotoScaleDown({ el: ".photo-overlap-section" }));
  engine.register(new HorizontalScrollSection({el: ".horizontal-scroll-product"}))

  engine.start();
});