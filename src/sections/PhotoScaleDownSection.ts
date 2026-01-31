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

    this.triggers = this.initialImages.map((_, i) => this.start + window.innerHeight * i);

    this.startScale = this.triggers[this.triggers.length - 1] + window.innerHeight;
    this.end = this.startScale + window.innerHeight;

    this.opacityToggleEndpoint = this.end + ( this.viewportHeight * .5 );
    this.opacityToggleStartingPoint = this.start - this.viewportHeight;
    this.range = this.end - this.startScale;
    this.viewportHeight = window.innerHeight;
    this.viewportWidth = window.innerWidth;

    this.imageWrapHeight = this.itemImageWrap.getBoundingClientRect().height;
    this.imageWrapWidth = this.itemImageWrap.getBoundingClientRect().width;

    this.heightRange = window.innerHeight - this.imageWrapHeight;
    this.widthRange = window.innerWidth - this.imageWrapWidth;

    this.scaleDownImgHeightStartingValue = 120; // in percentage hardcoded but can retreive like window.getComputedStyles(this.scaleDownImg); along with the parents styles and then converting to percentage. We know from webflow its 120%
    this.scaleDownImgHeightEndingValue = 150; // in percentage

    console.log(this.startScale, this.end, this.range, this.viewportHeight, this.viewportWidth, this.imageWrapHeight, this.imageWrapWidth, this.heightRange, this.widthRange)
  }

  update(scrollY: number): void {
    if (!this.enabled) return;

    // toggle image in our next section off at start of scale and back on when we land over it
    const shouldHide = scrollY >= this.opacityToggleStartingPoint && scrollY <= this.opacityToggleEndpoint;
    this.endingImage.style.opacity = shouldHide ? "0" : "1";
    this.scaleDownImgContainer.style.opacity = shouldHide ? "1" : "0";
    this.endingImageHidden = shouldHide;

    const t = clamp01(
        (scrollY - this.startScale) / this.viewportHeight
    );

    const yPercent = mapRange(t, 0, 1, 0, 1);
    
    const heightChangePercent = (this.heightRange / this.viewportHeight) * 100;
    const widthChangePercent = (this.widthRange / this.viewportWidth) * 100;

    const scaleDownImgContainerHeightPercent = 100 - (yPercent * heightChangePercent);
    const scaleDownImgContainerWidthPercent = 100 - (yPercent * widthChangePercent);

    const heightChangeFinalPercent = (this.imageWrapHeight / this.viewportHeight) * 100;
    const widthChangeFinalPercent = (this.imageWrapWidth / this.viewportWidth) * 100;

    const scaleDownImgHeightPercent = this.scaleDownImgHeightStartingValue - (yPercent * (-((this.scaleDownImgHeightEndingValue - this.scaleDownImgHeightStartingValue) / 100)) * 100);

    // cleaner formula but not as readable for troubleshooting
    // const scaleDownImgHeightPercentSimplified = this.scaleDownImgHeightStartingValue + yPercent * (this.scaleDownImgHeightEndingValue - this.scaleDownImgHeightStartingValue);

    this.scaleDownImgContainer.style.height = `${scaleDownImgContainerHeightPercent}%`;
    this.scaleDownImgContainer.style.minHeight = `${heightChangeFinalPercent}%`;
    this.scaleDownImgContainer.style.width = `${scaleDownImgContainerWidthPercent}%`;
	this.scaleDownImgContainer.style.minWidth = `${widthChangeFinalPercent}%`;

    // scale down image fitment / img inside the container
    this.scaleDownImg.style.height = `${scaleDownImgHeightPercent}%`;
  }
}
