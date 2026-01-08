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
    this.triggers = Array(this.initialImages.length).fill(this.start);
    this.realTriggers = this.triggers.map((value, i) => { return value + (window.innerHeight * i) });
    this.secondPhotoTrigger = this.realTriggers[1];
    this.thirdPhotoTrigger = this.realTriggers[2];
    this.fourthPhotoTrigger = this.thirdPhotoTrigger + window.innerHeight;
    this.end = this.fourthPhotoTrigger + window.innerHeight;
  }

  update(scrollY) {
    if(!this.enabled) return;

    this.initialImages.map((item) => { return item.style.willChange = "transform" });

    // console.log(`this is the start of the photoOverlap section: ${this.start} and each image should get triggered at ${this.realTriggers}`);

    if ( scrollY < this.start ) {
        Debug.write("PhotoOverlapSection", "Do nada");

        // compute progress for image translation even after scrollY is out of range of animation, ensures aligned final position
        const t = clamp01((scrollY - this.start) / (window.innerHeight));
        const yPercent = mapRange(t, 0, 1, 0, 100);
        this.initialImages[0].style.transform = `translate3d(0, -${yPercent}%, 0)`;
    }

    if (scrollY >= this.start && scrollY < this.secondPhotoTrigger) {
        // compute progress for image translation
        const t = clamp01((scrollY - this.start) / (window.innerHeight));
        const yPercent = mapRange(t, 0, 1, 0, 100);
        this.initialImages[0].style.transform = `translate3d(0, -${yPercent}%, 0)`;

        // for when scrolling back page, resolves previous animation alignment once scrollY is now in current if statement
        const tAfter = clamp01((scrollY - this.secondPhotoTrigger) / (window.innerHeight));
        const yPercentAfter = mapRange(tAfter, 0, 1, 0, 100);
        this.initialImages[1].style.transform = `translate3d(0, -${yPercentAfter}%, 0)`;
        Debug.write("PhotoOverlapSection", `Slide first photo up ${yPercent}`);
    }

    if (scrollY >= this.secondPhotoTrigger && scrollY < this.thirdPhotoTrigger) {
        // compute progress for section before
        const tBefore = clamp01((scrollY - this.start) / (window.innerHeight));
        const yPercentBefore = mapRange(tBefore, 0, 1, 0, 100);
        this.initialImages[0].style.transform = `translate3d(0, -${yPercentBefore}%, 0)`;

        // compute progress for image translation of current image
        const t = clamp01((scrollY - this.secondPhotoTrigger) / (window.innerHeight));
        const yPercent = mapRange(t, 0, 1, 0, 100);
        this.initialImages[1].style.transform = `translate3d(0, -${yPercent}%, 0)`;

        // compute progress for image in section after current - ensures a completely aligned top/bottom position even if scrolling very fast
        const tAfter = clamp01((scrollY - this.thirdPhotoTrigger) / (window.innerHeight));
        const yPercentAfter = mapRange(tAfter, 0, 1, 0, 100);
        this.initialImages[2].style.transform = `translate3d(0, -${yPercentAfter}%, 0)`;

        Debug.write("PhotoOverlapSection", `Slide second photo up ${yPercent}`);
    }

    if (scrollY >= this.thirdPhotoTrigger && scrollY < this.fourthPhotoTrigger) {
        // compute progress for image in previous section
        const tBefore = clamp01((scrollY - this.secondPhotoTrigger) / (window.innerHeight));
        const yPercentBefore = mapRange(tBefore, 0, 1, 0, 100);
        this.initialImages[1].style.transform = `translate3d(0, -${yPercentBefore}%, 0)`;

        // compute progress for image translation
        const t = clamp01((scrollY - this.thirdPhotoTrigger) / (window.innerHeight));
        const yPercent = mapRange(t, 0, 1, 0, 100);
        this.initialImages[2].style.transform = `translate3d(0, -${yPercent}%, 0)`;

        // // compute progress for next image, for when scrolling back up page and alignment
        // const tAfter = clamp01((scrollY - this.fourthPhotoTrigger) / (window.innerHeight));
        // const yPercentAfter = mapRange(tAfter, 0, 1, 0, 100);
        // this.initialImages[3].style.transform = `translate3d(0, -${yPercentAfter}%, 0)`;


        Debug.write("PhotoOverlapSection", `Slide third photo up ${yPercent}`);
    }

    if (scrollY >= this.fourthPhotoTrigger) {
        // compute progress for image in previous section
        const tBefore = clamp01((scrollY - this.fourthPhotoTrigger) / (window.innerHeight));
        const yPercentBefore = mapRange(tBefore, 0, 1, 0, 100);
        this.initialImages[2].style.transform = `translate3d(0, -${yPercentBefore}%, 0)`;

        // // compute progress for image translation
        // const t = clamp01((scrollY - this.fourthPhotoTrigger) / (window.innerHeight));
        // const yPercent = mapRange(t, 0, 1, 0, 100);
        // this.initialImages[3].style.transform = `translate3d(0, -${yPercent}%, 0)`;

    //     const tAfter = clamp01((scrollY - this.end) / (window.innerHeight));
    //     const yPercentAfter = mapRange(tAfter, 0, 1, 0, 100);
    //     this.initialImages[4].style.transform = `translate3d(0, -${yPercentAfter}%, 0)`;

    //     Debug.write("PhotoOverlapSection", `Slide fourth photo up ${yPercent}`);
    }
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