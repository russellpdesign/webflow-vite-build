import BaseSection from "../engine/BaseSection";
import { Debug } from "../engine/Debug";
import { clamp01, mapRange } from "@utils";

export default class PhotoOverlapSection extends BaseSection {
  constructor({ el }) {
    super({ el });
    /* -------------------------------------------------------------
     * DOM ELEMENTS
     * ------------------------------------------------------------- */
    // el = document.querySelector(".photo-overlap-section");
    console.log(this.el);

    this.stickyScrollerContainer = document.querySelector(".sticky-scroller-container");
    this.sectionTrigger = document.querySelector(".photo-overlap-section-trigger");
    this.initialImages = this.sectionTrigger.querySelectorAll(".sticky-img-container");
    this.itemNumberText = document.querySelectorAll(".home-scroll-item-number");
    this.progressBarHeight = document.querySelector(".progress-container").getBoundingClientRect().height;

    this.imageRevealSection = document.querySelector(".double-wide-reveal-img");
    this.leftSideImageHide = document.querySelector("#left-side-hide");

    this.enabled = true;

    window.addEventListener("resize", () => this.measure());
  }

  /* -------------------------------------------------------------
   * MEASURE
   * ------------------------------------------------------------- 
   * */
  measure() {
    super.measure();

    this.start = window.scrollY + this.sectionTrigger.getBoundingClientRect().top + ((window.innerHeight * 1.38) + this.progressBarHeight);
    //  ((window.innerHeight * .38) + this.progressBarHeight)
    this.triggers = Array(this.initialImages.length).fill(this.start);
    this.realTriggers = this.triggers.map((value, i) => { return value + (window.innerHeight * i) });
  }

  update(scrollY) {
    if(!this.enabled) return;

    console.log(`this is the start of the photoOverlap section: ${this.start}`);
    // console.table(`${this, el, this.el}`);

      // compute progress for image translation
    //   const t = clamp01((scrollY - (this.start * photoCount)) / (window.innerHeight));
    //   const yPercent = mapRange(t, 0, 1, 0, 100);
    //   const percentageTraveled = scrollY - this.start;

    //   // const xPercent = (percentageTraveled / this.wholeAmount) * 100;
    //   const imageTransformPercent = 100 - xPercent;
    //   const opacityPercent = 100 - ((percentageTraveled / this.wholeAmount) * 100);

//      if ( scrollY < this.start ) {
//       // translates the image container from right side to left
//       this.el.style.transform = `translate3d(-${xPercent}%, 0, 0)`;
//       this.behindImageWrapper.style.transform = `translate3d(-${imageTransformPercent}%, 0, 0)`;
//       // transforms the opacity from 100% to o% so image behind can show through
//       this.lastImage.style.opacity = `${opacityPercent}%`;
//       this.imageRevealSection.style.zIndex = "-1";

//       // translate vertically text from next section
//       this.projectTextSection.style.transform = `translate3d(0, -${xPercent}%, 0)`;

//       Debug.write("MovePhotoSection", "I should be at its original location");
//     }

//     if ( scrollY >= this.start ) {
//       Debug.write("MovePhotoSection", `I should move the right photo ${xPercent}%`);
//       // translates the image container from right side to left
//       this.el.style.transform = `translate3d(-${xPercent}%, 0, 0)`;
//       this.behindImageWrapper.style.transform = `translate3d(-${imageTransformPercent}%, 0, 0)`;
//       // transforms the opacity from 100% to o% so image behind can show through
//       this.lastImage.style.opacity = `${opacityPercent}%`;

//       // translate vertically text from next section
//       this.projectTextSection.style.transform = `translate3d(0, -${xPercent}%, 0)`;
//       this._deactivate(0);
//     }

//     if (scrollY >= this.end ) {
//       this._activate(0);
//       return;
//     }
//   }

//   _activate(i) {
//     this.sectionHeaderText[i]?.classList.add("is-active");
//     this.projectTextHeading[i]?.classList.add("is-active");
//     this.bodyText[i]?.classList.add("is-active");
//     this.itemNumberText[i]?.classList.add("is-active");
//   }

//   _deactivate(i) {
//     this.sectionHeaderText[i]?.classList.remove("is-active");
//     // this.projectTextHeading[i]?.classList.remove("is-active");
//     this.bodyText[i]?.classList.remove("is-active");
//     this.itemNumberText[i]?.classList.remove("is-active");
//   }

//   _deactivateAll() {
//     this.sectionHeaderText.forEach(el => el.classList.remove("is-active"));
//     this.projectTextHeading.forEach(el => el.classList.remove("is-active"));
//     this.bodyText.forEach(el => el.classList.remove("is-active"));
//     this.itemNumberText.forEach(el => el.classList.remove("is-active"));
//   }
  }
}