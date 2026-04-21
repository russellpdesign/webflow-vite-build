// handles scaling the image down
// handles the transition into the horizontal scroll section where
// our text animates up into the viewport via margin top translation
// our supporting horizontl scroll section text elements are toggled on off respectively
// the headline is on when it scrolls into view and is toggled off
// the supporting elements (eyebrow, description text, dropdown menu)
// once the horizontal scroll section is in view, that is where the scope of this document ends

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
  supportingElements: HTMLElement[][];

  // image toggle on and off
  triggers!: number[];
  behindImageToggleCheckpoint!: number;

  // left side images only
  leftSideImages: HTMLElement[];

  //flags
  private endingImageHidden: boolean | null = null;
  private showSupportingElements: boolean | null = null;
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

    // this is actually the parent container of big-text
    this.bigTitle = document.querySelector(".product-title-big");

    // for our fist section, index 0, second 1, third 2
    this.bigTexts = document.querySelectorAll(".big-text");
    this.mediumBigTexts = document.querySelectorAll(".medium-big-text");
    this.productDescs = document.querySelectorAll(".product-desc");

    // for our first section, this is index 0-2, second 3-5, third 6-8
    this.dropdownHeaders = document.querySelectorAll(".dropdown-header-container");

    console.log(this.dropdownHeaders[0]);

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
    this.opacityToggleEndpoint = this.end + (this.viewportHeight * .5);

    this.imageWrapHeight = this.itemImageWrap.getBoundingClientRect().height;
    this.imageWrapWidth = this.itemImageWrap.getBoundingClientRect().width;

    this.heightRange = this.viewportHeight - this.imageWrapHeight;
    this.widthRange = window.innerWidth - this.imageWrapWidth;

    this.scaleDownImgHeightStartingValue = 120; // in percentage hardcoded but can retreive like window.getComputedStyles(this.scaleDownImg); along with the parents styles and then converting to percentage. We know from webflow its 120%
    this.scaleDownImgHeightEndingValue = 150; // in percentage
  }

update(scrollY: number): void {
    if (!this.enabled) return;

    // Normalize scroll progress over the viewport height
    const t = clamp01((scrollY - this.startScale) / this.viewportHeight);
    const scaleProgress = mapRange(t, 0, 1, 0, 1);
    const marginTopShrink = 100 - (scaleProgress * 100);

    // scale container transforms
    const heightChangePercent = (this.heightRange / this.viewportHeight) * 100;
    const widthChangePercent = (this.widthRange / this.viewportWidth) * 100;

    const scaleDownImgContainerHeightPercent = 100 - scaleProgress * heightChangePercent;
    const scaleDownImgContainerWidthPercent = 100 - scaleProgress * widthChangePercent;

    const minHeightPercent = (this.imageWrapHeight / this.viewportHeight) * 100;
    const minWidthPercent = (this.imageWrapWidth / this.viewportWidth) * 100;
    
    // scaledown image height (inside container)
    const scaleDownImgHeightPercent = this.scaleDownImgHeightStartingValue - (scaleProgress * (-((this.scaleDownImgHeightEndingValue - this.scaleDownImgHeightStartingValue) / 100)) * 100);

    // -------------------------------------------------------------
    // 2️⃣ Hard toggle the ending image using display
    // -------------------------------------------------------------
    const endingImageVisible = scrollY > this.opacityToggleEndpoint;

    // this.endingImage.style.display = endingImageVisible ? "block" : "none";

    // ensure the container for scaling image is shown only while scaling
    // this.scaleDownImgContainer.style.display = endingImageVisible ? "none" : "flex";

    // -------------------------------------------------------------
    // 3️⃣ Apply scaling / transforms to container and inner image
    // -------------------------------------------------------------
    this.scaleDownImgContainer.style.height = `${scaleDownImgContainerHeightPercent}%`;
    this.scaleDownImgContainer.style.minHeight = `${minHeightPercent}%`;
    this.scaleDownImgContainer.style.width = `${scaleDownImgContainerWidthPercent}%`;
    this.scaleDownImgContainer.style.minWidth = `${minWidthPercent}%`;

    // we enable the other supporting text and dropdown elements once scale down finishes
    const transitionHorizontalScrollSection = scrollY >= this.end;

    // while we are scaling the image, we transform our big title headline from our section below up using margin top so we get smoothing effect (versus pure scroll)
    this.bigTitle.style.marginTop = `${marginTopShrink}vh`;

    // once we've scrolled into position we toggle active on our supporting elements
    this.bigTexts[0].classList.toggle("active", transitionHorizontalScrollSection);
    this.mediumBigTexts[0].classList.toggle("active", transitionHorizontalScrollSection);
    this.productDescs[0].classList.toggle("active", transitionHorizontalScrollSection);
    for(let i = 0; i<= 3; i++) {
      let item = this.dropdownHeaders[i];
      item.classList.toggle("active", transitionHorizontalScrollSection) 
    };

    // Ending image
    const showEndingImage = scrollY >= this.opacityToggleEndpoint;

    // this.endingImage.style.visibility = showEndingImage ? "visible" : "hidden";
    // this.endingImage.style.pointerEvents = showEndingImage ? "auto" : "none";
    this.scaleDownImgContainer.style.position = showEndingImage ? "absolute" : "none";

    // Scaling image container
    // this.scaleDownImgContainer.style.visibility = showEndingImage ? "hidden" : "visible";
    this.scaleDownImgContainer.style.pointerEvents = showEndingImage ? "none" : "auto";

    //z index handling
    this.scaleDownImgContainer.style.zIndex = showEndingImage ? "0" : "2";
    // this.endingImage.style.zIndex = showEndingImage ? "2" : "0";

    this.scaleDownImg.style.height = `${scaleDownImgHeightPercent}%`;
    }
}
