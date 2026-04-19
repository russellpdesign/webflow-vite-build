import BaseSection from "../engine/BaseSection.js";
import { Debug } from "../engine/Debug.js";
import { clamp, clamp01, mapRange } from "../engine/utils.js";

export default class HorizontalScrollSection extends BaseSection {
  // DOM collections
  progressBarHeight!: number;
  range: number = 0;
  viewportWidth: number = 0;
  viewportHeight: number = 0;
  supportingElements: HTMLElement[][];

  //flags


  constructor({ el }: HorizontalScrollSection ) {
    super({ el });

    // el = ".photo-overlap-section";

    /* -------------------------------------------------------------
     * DOM ELEMENTS
     * ------------------------------------------------------------- */

    // All images that participate in the overlap animation
    this.endingImage = document.querySelector("#scale-down-img-after");

    this.progressBar = document.querySelector<HTMLElement>(".progress-container")!;

    this.bigTitle = document.querySelector(".product-title-big")

    this.supportingElements = [
      this.mediumBigTexts = document.querySelectorAll(".medium-big-text"),
      this.productDescs = document.querySelectorAll(".product-desc"),
      this.dropdownHeaders = document.querySelectorAll(".dropdown-header-container"),
    ];

    this.bigText = document.querySelectorAll(".big-text");

    this.enabled = true;

    window.addEventListener("resize", () => this.measure());
  }

  measure(): void {
    super.measure();

    this.progressBarHeight = this.progressBar!.getBoundingClientRect().height;

    this.start = this.el.getBoundingClientRect().top + this.viewportHeight;

    console.log(`horizontal scroll section starting point = ${this.start}`)

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

    // this.showtimeTriggers = this.supportingElements.map((_, i) => this.start + window.innerHeight * i);

    this.supportingElements.forEach(item => console.log(...item))
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

    this.endingImage.style.display = endingImageVisible ? "block" : "none";

    // ensure the container for scaling image is shown only while scaling
    // this.scaleDownImgContainer.style.display = endingImageVisible ? "none" : "flex";

    // -------------------------------------------------------------
    // 3️⃣ Apply scaling / transforms to container and inner image
    // -------------------------------------------------------------
    this.scaleDownImgContainer.style.height = `${scaleDownImgContainerHeightPercent}%`;
    this.scaleDownImgContainer.style.minHeight = `${minHeightPercent}%`;
    this.scaleDownImgContainer.style.width = `${scaleDownImgContainerWidthPercent}%`;
    this.scaleDownImgContainer.style.minWidth = `${minWidthPercent}%`;

    // while we are scaling the image, we transform our big title headline from our section below up using margin top so we get smoothing effect (versus pure scroll)
    this.bigTitle.style.marginTop = `${marginTopShrink}vh`;

    // we enable the other supporting text and dropdown elements once scale down finishes
    const transitionHorizontalScrollSection = scrollY >= this.end;

    this.bigText[0].classList.toggle("active", transitionHorizontalScrollSection);

    this.supportingElements.forEach(nodeList => {
      nodeList.forEach(el => {
        el.classList.toggle("active", transitionHorizontalScrollSection);
      });
    });

    // Ending image
    const showEndingImage = scrollY >= this.opacityToggleEndpoint;

    // this.endingImage.style.visibility = showEndingImage ? "visible" : "hidden";
    this.endingImage.style.pointerEvents = showEndingImage ? "auto" : "none";
    this.scaleDownImgContainer.style.position = showEndingImage ? "absolute" : "none";

    // Scaling image container
    // this.scaleDownImgContainer.style.visibility = showEndingImage ? "hidden" : "visible";
    this.scaleDownImgContainer.style.pointerEvents = showEndingImage ? "none" : "auto";

    //z index handling
    this.scaleDownImgContainer.style.zIndex = showEndingImage ? "0" : "2";
    this.endingImage.style.zIndex = showEndingImage ? "2" : "0";

    this.scaleDownImg.style.height = `${scaleDownImgHeightPercent}%`;
    }
}