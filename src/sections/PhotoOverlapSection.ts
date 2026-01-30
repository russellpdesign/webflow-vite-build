import BaseSection from "../engine/BaseSection.js";
import { Debug } from "../engine/Debug.js";
import { clamp, clamp01, mapRange } from "../engine/utils.js";

type PhotoOverlapDeclarativeConfig = {
  el: string | HTMLElement;
}

export default class PhotoOverlapDeclarative extends BaseSection {
  // DOM collections
  sectionTrigger: HTMLElement;
  initialImages: HTMLElement[] = [];
  progressBar: HTMLElement;
  progressBarHeight!: number;
  totalProgress!: string;
  behindImageWrapper!: HTMLElement;

  triggers!: number[];
  behindImageToggleCheckpoint!: number;

  private imageOff: boolean = false;

  constructor({ el }: PhotoOverlapDeclarativeConfig ) {
    super({ el });

    /* -------------------------------------------------------------
     * DOM ELEMENTS
     * ------------------------------------------------------------- */
    this.sectionTrigger = document.querySelector<HTMLElement>(".photo-overlap-section-trigger")!;

    // All images that participate in the overlap animation
    this.initialImages = Array.from(
      this.sectionTrigger.querySelectorAll<HTMLElement>(".sticky-img-container")
    );

    this.progressBar = document.querySelector<HTMLElement>(".progress-container")!;

    this.behindImageWrapper = document.querySelector<HTMLElement>(".home-scroll-img-behind-wrapper")!;

    // this.textElements = [...this.sectionTrigger.querySelectorAll("")]

    this.enabled = true;

    window.addEventListener("resize", () => this.measure());
  }

  /* -------------------------------------------------------------
   * MEASURE
   * -------------------------------------------------------------
   * Calculates all scroll trigger points.
   * Each image gets its own trigger spaced by 1 viewport height.
   * ------------------------------------------------------------- */
  measure(): void {
    super.measure();

    // Used to offset the start position so animation aligns visually with the progress UI
    this.progressBarHeight = this.progressBar!.getBoundingClientRect().height;

    this.start =
      window.scrollY +
      this.sectionTrigger.getBoundingClientRect().top +
      window.innerHeight * 1.38 +
      this.progressBarHeight;

    // Declarative trigger generation: Each image animates over exactly one viewport height - the image dom node value is not important aka "_", just creating the trigger values array is priority
    this.triggers = this.initialImages.map((_, i) => this.start + window.innerHeight * i);

    this.behindImageToggleCheckpoint = this.triggers[1];

    this.imageOff = scrollY >= this.behindImageToggleCheckpoint;

    // Used by the engine for section bounds
    // this.end = this.triggers[this.triggers.length - 1] + window.innerHeight;
    this.end = this.initialImages[this.initialImages.length - 1].getBoundingClientRect().bottom + window.scrollY;

    this.initialImages.forEach((image, _) => {
      // Performance hints
      image.style.willChange = "transform";
    });

    // Debug.write("PhotoOverlapSection", {
    //   start: Math.round(this.start),
    //   triggers: this.triggers.map(v => Math.round(v)),
    //   end: Math.round(this.end),
    // });
  }

  update(scrollY: number): void {
    if (!this.enabled) return;

    this.initialImages.forEach((image, index) => {
      const trigger = this.triggers[index];

      // Normalized progress for this image
      const t = clamp01(
        (scrollY - trigger) / window.innerHeight
      );

      const yPercent = mapRange(t, 0, 1, 0, 100);

      // this.totalProgress = (scrollY / this.end).toFixed(2);

      image.style.transform = `translate3d(0, -${yPercent}%, 0)`;
    });

    if (this.imageOff) {
      this.behindImageWrapper.style.setProperty("opacity", "0");
      this.imageOff = true;
    }

  }
}
