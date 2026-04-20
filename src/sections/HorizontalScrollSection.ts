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

    //  el = ".horizontal-scroll-product";

    /* -------------------------------------------------------------
     * DOM ELEMENTS
     * ------------------------------------------------------------- */

    // All images that participate in the overlap animation
    this.endingImage = document.querySelector("#scale-down-img-after");

    this.progressBar = document.querySelector<HTMLElement>(".progress-container")!;

    this.bigTitle = document.querySelector(".product-title-big");

    this.supportingElements = [
      this.mediumBigTexts = document.querySelectorAll(".medium-big-text"),
      this.productDescs = document.querySelectorAll(".product-desc"),
      this.dropdownHeaders = document.querySelectorAll(".dropdown-header-container"),
    ];

    this.bigText = document.querySelectorAll(".big-text");

    this.horizontalScrollSectContainer = document.querySelector(".horizontal-section-container");

    this.scrollSections = document.querySelectorAll("#horizontal-scroll");

    this.enabled = true;

    window.addEventListener("resize", () => this.measure());
  }

  measure(): void {
    super.measure();

    this.progressBarHeight = this.progressBar!.getBoundingClientRect().height;

    this.viewportHeight = window.innerHeight;

    this.start = this.el.getBoundingClientRect().top + scrollY;

    console.log(`horizontal scroll section starting point = ${this.start}`)
  }

update(scrollY: number): void {
    if (!this.enabled) return;


    for(let i = 1; i < this.scrollSections.length + 1; i++ ) {
      const scrollStart = this.start + (this.viewportHeight * i);
      const scrollRange = scrollY >= scrollStart && scrollY <= this.start + (this.viewportHeight * i);

      const t = clamp01((scrollY - scrollStart ) / this.viewportHeight);
      const slideProgress = mapRange(t, 0, 100, 0, 100);
      this.horizontalScrollSectContainer.style.transform = `translateX(${slideProgress}vw)`;
    }

    // // Normalize scroll progress over the viewport height
    
    // const scaleProgress = mapRange(t, 0, 1, 0, 1);
    // const marginTopShrink = 100 - (scaleProgress * 100);

    // // scale container transforms
    // const heightChangePercent = (this.heightRange / this.viewportHeight) * 100;
    // const widthChangePercent = (this.widthRange / this.viewportWidth) * 100;

    // const scaleDownImgContainerHeightPercent = 100 - scaleProgress * heightChangePercent;
    // const scaleDownImgContainerWidthPercent = 100 - scaleProgress * widthChangePercent;

    // const minHeightPercent = (this.imageWrapHeight / this.viewportHeight) * 100;
    // const minWidthPercent = (this.imageWrapWidth / this.viewportWidth) * 100;
    
    // // scaledown image height (inside container)
    // const scaleDownImgHeightPercent = this.scaleDownImgHeightStartingValue - (scaleProgress * (-((this.scaleDownImgHeightEndingValue - this.scaleDownImgHeightStartingValue) / 100)) * 100);

    // // -------------------------------------------------------------
    // // 2️⃣ Hard toggle the ending image using display
    // // -------------------------------------------------------------
    // const endingImageVisible = scrollY > this.opacityToggleEndpoint;

    // this.endingImage.style.display = endingImageVisible ? "block" : "none";

    // // ensure the container for scaling image is shown only while scaling
    // // this.scaleDownImgContainer.style.display = endingImageVisible ? "none" : "flex";

    // // -------------------------------------------------------------
    // // 3️⃣ Apply scaling / transforms to container and inner image
    // // -------------------------------------------------------------
    // this.scaleDownImgContainer.style.height = `${scaleDownImgContainerHeightPercent}%`;
    // this.scaleDownImgContainer.style.minHeight = `${minHeightPercent}%`;
    // this.scaleDownImgContainer.style.width = `${scaleDownImgContainerWidthPercent}%`;
    // this.scaleDownImgContainer.style.minWidth = `${minWidthPercent}%`;

    // // while we are scaling the image, we transform our big title headline from our section below up using margin top so we get smoothing effect (versus pure scroll)
    // this.bigTitle.style.marginTop = `${marginTopShrink}vh`;

    // // we enable the other supporting text and dropdown elements once scale down finishes
    // const transitionHorizontalScrollSection = scrollY >= this.end;

    // this.bigText[0].classList.toggle("active", transitionHorizontalScrollSection);

    // this.supportingElements.forEach(nodeList => {
    //   nodeList.forEach(el => {
    //     el.classList.toggle("active", transitionHorizontalScrollSection);
    //   });
    // });

    // // Ending image
    // const showEndingImage = scrollY >= this.opacityToggleEndpoint;

    // // this.endingImage.style.visibility = showEndingImage ? "visible" : "hidden";
    // this.endingImage.style.pointerEvents = showEndingImage ? "auto" : "none";
    // this.scaleDownImgContainer.style.position = showEndingImage ? "absolute" : "none";

    // // Scaling image container
    // // this.scaleDownImgContainer.style.visibility = showEndingImage ? "hidden" : "visible";
    // this.scaleDownImgContainer.style.pointerEvents = showEndingImage ? "none" : "auto";

    // //z index handling
    // this.scaleDownImgContainer.style.zIndex = showEndingImage ? "0" : "2";
    // this.endingImage.style.zIndex = showEndingImage ? "2" : "0";

    // this.scaleDownImg.style.height = `${scaleDownImgHeightPercent}%`;
    }
}