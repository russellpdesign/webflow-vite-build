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
  startScale: number = 0;
  progressBar: HTMLElement;
  scaleDownImgHeightStartingValue: number = 0;
  scaleDownImgHeightEndingValue: number = 0;
  opacityToggleStartingPoint: number = 0;
  opacityToggleEndpoint: number = 0;
  fixedBackground: HTMLElement;

  // image toggle on and off
  triggers!: number[];
  behindImageToggleCheckpoint!: number;

  // left side images only
  leftSideImages: HTMLElement[];

  //flags
  private endingImageHidden: boolean | null = null;

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
    this.scaleDownImgContainer = document.querySelector("#scale-down-img-container");

    this.itemImageWrap = document.querySelector(".single-item-image-wrap");

    this.endingImage = document.querySelector("#scale-down-img-after");

    this.progressBar = document.querySelector<HTMLElement>(".progress-container")!;

    this.fixedBackground = document.querySelector(".fixed-background");

    this.enabled = true;

    window.addEventListener("resize", () => this.measure());
  }

  measure(): void {
    super.measure();

    this.progressBarHeight = this.progressBar!.getBoundingClientRect().height;

    this.start =
      window.scrollY +
      this.sectionTrigger.getBoundingClientRect().top +
      window.innerHeight * 1.38 +
      this.progressBarHeight;

    this.range = this.end - this.startScale;
    this.viewportHeight = window.innerHeight;
    this.viewportWidth = window.innerWidth;

    this.triggers = this.initialImages.map((_, i) => this.start + this.viewportHeight * i);

    this.startScale = this.triggers[this.triggers.length - 1] + this.viewportHeight;
    this.end = this.startScale + this.viewportHeight;

    this.opacityToggleStartingPoint = this.startScale;
    this.opacityToggleEndpoint = this.end + (this.viewportHeight * 2);

    this.imageWrapHeight = this.itemImageWrap.getBoundingClientRect().height;
    this.imageWrapWidth = this.itemImageWrap.getBoundingClientRect().width;

    this.heightRange = this.viewportHeight - this.imageWrapHeight;
    this.widthRange = window.innerWidth - this.imageWrapWidth;

    this.scaleDownImgHeightStartingValue = 120; // in percentage hardcoded but can retreive like window.getComputedStyles(this.scaleDownImg); along with the parents styles and then converting to percentage. We know from webflow its 120%
    this.scaleDownImgHeightEndingValue = 150; // in percentage

    console.log(`this.startScale: ${this.startScale} this.end: ${this.end}, this.opacityToggleStartingPoint: ${this.opacityToggleStartingPoint}, this.opacityToggleEndpoint: ${this.opacityToggleEndpoint}, scrollY:`, window.scrollY)
  }

  update(scrollY: number): void {
    if (!this.enabled) return;

    const scaleProgress = clamp01(
        (scrollY - this.startScale) / this.viewportHeight
    );

    const yPercent = mapRange(scaleProgress, 0, 1, 0, 1);

    console.log(scaleProgress, yPercent)

    // Early exit if section is completely done
    if (scrollY >= this.end) {
        if (!this.endingImageHidden) {
        // Lock the ending image and container off
        this.endingImage.style.opacity = "0";
        this.scaleDownImgContainer.style.opacity = "0";
        this.fixedBackground.style.display = "none";

        this.endingImageHidden = true;
        }

        // Stop any further transforms to prevent stale render
        return;
    } else {
        // Section is active
        this.endingImageHidden = false;

        this.endingImage.style.opacity = "1";
        this.scaleDownImgContainer.style.opacity = "1";
        this.fixedBackground.style.display = "block";
    }
    
    const heightChangePercent = (this.heightRange / this.viewportHeight) * 100;
    const widthChangePercent = (this.widthRange / this.viewportWidth) * 100;

    const scaleDownImgContainerHeightPercent = 100 - scaleProgress * heightChangePercent;
    const scaleDownImgContainerWidthPercent = 100 - scaleProgress * widthChangePercent;

    const heightFinalPercent = (this.imageWrapHeight / this.viewportHeight) * 100;
    const widthFinalPercent = (this.imageWrapWidth / this.viewportWidth) * 100;

    this.scaleDownImgContainer.style.height = `${scaleDownImgContainerHeightPercent}%`;
    this.scaleDownImgContainer.style.minHeight = `${heightFinalPercent}%`;
    this.scaleDownImgContainer.style.width = `${scaleDownImgContainerWidthPercent}%`;
    this.scaleDownImgContainer.style.minWidth = `${widthFinalPercent}%`;

    // scale image inside container
    const scaleDownImgHeightPercent = this.scaleDownImgHeightStartingValue + scaleProgress * (this.scaleDownImgHeightEndingValue - this.scaleDownImgHeightStartingValue);
    this.scaleDownImg.style.height = `${scaleDownImgHeightPercent}%`;
  }
}
