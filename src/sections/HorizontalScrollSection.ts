import BaseSection from "../engine/BaseSection.js";
import { Debug } from "../engine/Debug.js";
import { clamp, clamp01, mapRange } from "../engine/utils.js";

export default class HorizontalScrollSection extends BaseSection {
  // DOM collections
  progressBarHeight!: number;
  range: number = 0;
  viewportWidth: number = 0;
  viewportHeight: number = 0;

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

    // for our fist section, index 0, second 1, third 2
    this.bigTexts = document.querySelectorAll(".big-text");
    this.mediumBigTexts = document.querySelectorAll(".medium-big-text");
    this.productDescs = document.querySelectorAll(".product-desc");

    // for our first section, this is index 0-2, second 3-5, third 6-8
    this.dropdownHeaders = document.querySelectorAll(".dropdown-header-container");

    this.bigText = document.querySelectorAll(".big-text");

    this.horizontalScrollSectContainer = document.querySelector(".horizontal-section-container");

    this.scrollSections = document.querySelectorAll("#horizontal_scroll");

    this.firstImage = document.querySelector(".sticky-big-img-reveal");

    console.log(`The amount of sections in our horizontal scroll section is: ${this.scrollSections.length}`);

    this.enabled = true;

    window.addEventListener("resize", () => this.measure());
  }

  measure(): void {
    super.measure();

    this.progressBarHeight = this.progressBar!.getBoundingClientRect().height;

    this.viewportHeight = window.innerHeight;

    this.start = this.el.getBoundingClientRect().top + scrollY;

    this.scrollStart1 = this.start + this.viewportHeight * 2;
    this.scrollEnd1 = this.start + (this.viewportHeight * 3);
    this.scrollStart2 = this.start + (this.viewportHeight * 5);
    this.scrollEnd2 = this.start + (this.viewportHeight * 6);
    this.scrollStart3 = this.start + (this.viewportHeight * 8);
    this.scrollEnd3 = this.start + (this.viewportHeight * 9);



    console.log(`start scrolling 1 here: ${this.scrollStart1} then stop scrolling here: ${this.scrollEnd1}`)
    console.log(`start scrolling 2 here: ${this.scrollStart2} then stop scrolling here: ${this.scrollEnd2}`)
    console.log(`start scrolling 3 here: ${this.scrollStart3} then stop scrolling here: ${this.scrollEnd3}`)
  }

update(scrollY: number): void {
    if (!this.enabled) return;

    this.beforeScroll = scrollY <= this.scrollStart1;
    this.scrollRange1 = scrollY >= this.scrollStart1 && scrollY <= this.scrollEnd1;
    this.scrollGap1 = scrollY >= this.scrollEnd1 && scrollY <= this.scrollStart2; // we are sitting in second section
    this.scrollRange2 = scrollY >= this.scrollStart2 && scrollY <= this.scrollEnd2;
    this.scrollGap2 = scrollY >= this.scrollEnd2 && scrollY <= this.scrollStart3;
    this.scrollRange3 = scrollY >= this.scrollStart3 && scrollY <= this.scrollEnd3;
    this.afterScroll = scrollY >= this.scrollEnd3;

      if (this.beforeScroll) {
        this.horizontalScrollSectContainer.style.transform = `translateX(0vw)`;
        this.firstImage.style.transform = `translateX(0vw)`;
      } if (this.scrollRange1) {
        const t = clamp01((scrollY - this.scrollStart1) / this.viewportHeight);
        this.slideProgress = mapRange(t, 0, 1, 0, 100);
        // this.scrollPosition1 = this.slideProgress1;
        console.log(t, this.slideProgress);
        this.horizontalScrollSectContainer.style.transform = `translateX(-${this.slideProgress}vw)`;
        this.firstImage.style.transform = `translateX(-${this.slideProgress}vw)`;
      } if (this.scrollGap1) {
        this.horizontalScrollSectContainer.style.transform = `translateX(-100vw)`;
        console.log("I am scrolling while in the second section");
      } if(this.scrollRange2) {
        const t = clamp01((scrollY - this.scrollStart2) / this.viewportHeight);
        this.slideProgress = mapRange(t, 0, 1, 100, 200);
        console.log(t, this.slideProgress);
        console.log("I should scroll to the third section");
        this.horizontalScrollSectContainer.style.transform = `translateX(-${this.slideProgress}vw)`;
      } if (this.scrollGap2) {
        this.horizontalScrollSectContainer.style.transform = `translateX(-200vw)`;
      } if(this.scrollRange3) {
        // const t = clamp01((scrollY - this.scrollStart3) / this.viewportHeight);
        // this.slideProgress3 = mapRange(t, 0, 1, 200, 300)
        // this.horizontalScrollSectContainer.style.transform = `translateX(-${this.slideProgress3}vw)`;
      } if (this.afterScroll) {
        // this.horizontalScrollSectContainer.style.transform = `translateX(-300vw)`;
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