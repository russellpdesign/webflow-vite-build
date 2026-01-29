import BaseSection from "../engine/BaseSection.js";
import { Debug } from "../engine/Debug.js";
import { clamp01, mapRange } from "@utils";
import { ElementConfig } from "../engine/types"

export default class PhotoOverlapDeclarative extends BaseSection {

  constructor({ el }: ElementConfig ) {
    super({ el });

    /* -------------------------------------------------------------
     * DOM ELEMENTS
     * ------------------------------------------------------------- */
    this.sectionTrigger = document.querySelector(".photo-overlap-section-trigger");

    // All images that participate in the overlap animation
    this.initialImages = [...this.sectionTrigger.querySelectorAll(".sticky-img-container")];

    // this.textElements = [...this.sectionTrigger.querySelectorAll("")]

    // Used to offset the start position so animation aligns visually with the progress UI
    this.progressBarHeight = document.querySelector(".progress-container").getBoundingClientRect().height;

    this.enabled = true;

    window.addEventListener("resize", () => this.measure());
  }

  /* -------------------------------------------------------------
   * MEASURE
   * -------------------------------------------------------------
   * Calculates all scroll trigger points.
   * Each image gets its own trigger spaced by 1 viewport height.
   * ------------------------------------------------------------- */
  measure() {
    super.measure();

    this.start =
      window.scrollY +
      this.sectionTrigger.getBoundingClientRect().top +
      window.innerHeight * 1.38 +
      this.progressBarHeight;

    // Declarative trigger generation: Each image animates over exactly one viewport height - the image dom node value is not important aka "_", just creating the trigger values array is priority
    this.triggers = this.initialImages.map((_, i) => this.start + window.innerHeight * i);

    // Used by the engine for section bounds
    // this.end = this.triggers[this.triggers.length - 1] + window.innerHeight;
    this.end = this.initialImages[this.initialImages.length - 1].getBoundingClientRect().bottom + window.scrollY;

    // Debug.write("PhotoOverlapSection", {
    //   start: Math.round(this.start),
    //   triggers: this.triggers.map(v => Math.round(v)),
    //   end: Math.round(this.end),
    // });

  }

  update(scrollY) {
    if (!this.enabled) return;

    this.initialImages.forEach((image, index) => {
      // Performance hints
      image.style.willChange = "transform";
      image.style.transformStyle = "preserve-3d";

      const trigger = this.triggers[index];

      // Normalized progress for this image
      const t = clamp01(
        (scrollY - trigger) / window.innerHeight
      );

      const yPercent = mapRange(t, 0, 1, 0, 100);

      this.totalProgress = (scrollY / this.end).toFixed(2);

      image.style.transform = `translate3d(0, -${yPercent}%, 0)`;
    });
  }
}
