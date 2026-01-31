// handles scaling the image down

import BaseSection from "../engine/BaseSection.js";
import { Debug } from "../engine/Debug.js";
import { clamp, clamp01, mapRange } from "../engine/utils.js";

type PhotoScaleDownConfig = {
  el: string | HTMLElement;
}

export default class PhotoScaleDown extends BaseSection {
  // DOM collections
  sectionTrigger: HTMLElement;
  initialImages: HTMLElement[] = [];
  scaleDownImg: HTMLElement;
  scaleDownImgContainer: HTMLElement;
  itemImageWrap: HTMLElement;
  endingImage: HTMLElement;
  progressBarHeight!: number;
  range: number = 0;
  viewportWidth: number = 0;
  viewportHeight: number = 0;
  imageWrapHeight: number = 0;
  imageWrapWidth: number = 0;
  heightRange: number = 0;
  widthRange: number = 0;
  progressBar: HTMLElement;

  // image toggle on and off
  triggers!: number[];
  behindImageToggleCheckpoint!: number;

  // left side images only
  leftSideImages: HTMLElement[];

  constructor({ el }: PhotoScaleDownConfig ) {
    super({ el });

    // el = ".photo-overlap-section";

    /* -------------------------------------------------------------
     * DOM ELEMENTS
     * ------------------------------------------------------------- */
    this.sectionTrigger = document.querySelector<HTMLElement>(".photo-overlap-section-trigger")!;

    // All images that participate in the overlap animation
    this.initialImages = Array.from(this.sectionTrigger.querySelectorAll<HTMLElement>(".sticky-img-container"));
    this.leftSideImages = this.initialImages.slice(0, -1);

    this.scaleDownImg = document.querySelector("#scale-down-img");
    this.scaleDownImgContainer = document.querySelector(".big-absolute-img");

    this.itemImageWrap = document.querySelector(".single-item-image-wrap");

    this.endingImage = document.querySelector("#scale-down-img-after");

    this.progressBar = document.querySelector<HTMLElement>(".progress-container")!;


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

    this.progressBarHeight = this.progressBar!.getBoundingClientRect().height;

    this.start =
      window.scrollY +
      this.sectionTrigger.getBoundingClientRect().top +
      window.innerHeight * 1.38 +
      this.progressBarHeight;

    this.triggers = this.initialImages.map((_, i) => this.start + window.innerHeight * i);

    this.start = this.triggers[this.triggers.length - 1] + window.innerHeight;
    this.end = this.start + window.innerHeight;
    this.range = this.end - this.start;
    this.viewportHeight = window.innerHeight;
    this.viewportWidth = window.innerWidth;

    this.imageWrapHeight = this.itemImageWrap.getBoundingClientRect().height;
    this.imageWrapWidth = this.itemImageWrap.getBoundingClientRect().width;

    this.heightRange = window.innerHeight - this.imageWrapHeight;
    this.widthRange = window.innerWidth - this.imageWrapWidth;
  }

  update(scrollY: number): void {
    if (!this.enabled) return;

    const scaleRange = scrollY >= this.start && scrollY <= this.end;

    this.endingImage.classList.toggle("opacity", scaleRange);

    const t = clamp01(
        (scrollY - this.start) / window.innerHeight
    );

    const yPercent = mapRange(t, 0, 1, 0, 100);
    
    const heightChangePercent = (this.heightRange / this.viewportHeight) * 100;
    const widthChangePercent = (this.widthRange / this.viewportWidth) * 100;

    const scaleDownImgContainerHeightPercent = 100 - (yPercent * heightChangePercent);
    const scaleDownImgContainerWidthPercent = 100 - (yPercent * widthChangePercent);

    const scaleDownImgHeightStartingValue = 120; // in percentage
    const scaleDownImgHeightEndingValue = 150; // in percentage

    const heightChangeFinalPercent = (this.imageWrapHeight / this.viewportHeight) * 100;
    const widthChangeFinalPercent = (this.imageWrapWidth / this.viewportWidth) * 100;

    const scaleDownImgHeightPercent = scaleDownImgHeightStartingValue + yPercent * (scaleDownImgHeightEndingValue - scaleDownImgHeightStartingValue);

    this.scaleDownImgContainer.style.height = `${scaleDownImgContainerHeightPercent}%`;
    this.scaleDownImgContainer.style.minHeight = `${heightChangeFinalPercent}%`;
    this.scaleDownImgContainer.style.width = `${scaleDownImgContainerWidthPercent}%`;
	this.scaleDownImgContainer.style.minWidth = `${widthChangeFinalPercent}%`;

    // scale down image fitment / img inside the container
    this.scaleDownImg.style.height = `${scaleDownImgHeightPercent}%`;
  }
}
