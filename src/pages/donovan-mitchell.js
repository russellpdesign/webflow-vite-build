import ScrollEngine from "../engine/ScrollEngine.js";
import SmoothScroll from "../engine/SmoothScroll.js";
import HomeScrollSection from "../sections/HomeScrollSection.js";
import PhotoMoveSection from "../sections/MovePhotoSection.js";

window.addEventListener("DOMContentLoaded", () => {
  // the lower the ease value, the more easing there is
  const smooth = new SmoothScroll({ ease: 0.09 });
  const engine = new ScrollEngine({ smooth });

//  const section = new HomeScrollSection({ el: ".home-scroll-section.is-don" });

  engine.register(new HomeScrollSection({ el: ".home-scroll-section.is-don" }));
  engine.register(new PhotoMoveSection({ el: ".sticky-section.heroic-members-wrapper.reversed" }));

  engine.start();
});