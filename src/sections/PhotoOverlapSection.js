import BaseSection from "../engine/BaseSection";
import { Debug } from "../engine/Debug";
import { clamp01, mapRange } from "@utils";

export default class MovePhotoSection extends BaseSection {
  constructor({ el }) {
    super({ el });
    /* -------------------------------------------------------------
     * DOM ELEMENTS
     * ------------------------------------------------------------- */
    // el = document.querySelector(".home-scroll-visual")

    this.homeScrollSection = document.querySelector(".home-scroll-section.is-don");
    this.triggers = document.querySelectorAll(".overview_trigger");

    this.sticky100vh =  document.querySelector(".sticky-section-100vh");
    this.stickySection = document.querySelector(".sticky-section.heroic-members-wrapper.reversed");

    // Elements from previous sections
    this.lastImage = document.querySelector(".home-scroll-img.is-r-pad.wider");
    this.behindImageWrapper = document.querySelector(".home-scroll-img-behind-wrapper");

    // Elements from section after image translates left to right
    this.projectTextSection = document.querySelector(".project-text-section.is-sticky.heroic-members");
    this.sectionHeaderText = this.projectTextSection.querySelectorAll(".section-header-text");
    this.projectTextHeading = this.projectTextSection.querySelectorAll(".project-text-heading");
    this.bodyText = this.projectTextSection.querySelectorAll(".body-text.home-scroll");
    this.itemNumberText = this.projectTextSection.querySelectorAll(".home-scroll-item-number");

    // Elements from upcoming sections
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
    // super.measure();
    this.triggersHeight = this.triggers[0]?.getBoundingClientRect().height * this.triggers.length;
    this.sectionLength = this.triggersHeight;
    this.sticky100Height = this.sticky100vh.getBoundingClientRect().height;
    this.lastSectionsEnd = this.homeScrollSection.getBoundingClientRect().top - document.body.getBoundingClientRect().top;
    this.stickySectionHeight = this.stickySection.getBoundingClientRect().height;
    this.wholeAmount = this.sticky100Height * 1.38;

    this.start = this.lastSectionsEnd + this.sectionLength;
    this.end = this.start + this.wholeAmount;
  }

  update(scrollY) {
    if(!this.enabled) return;

      // compute progress for image translation
      const t = clamp01((scrollY - this.start) / (this.wholeAmount));
      const xPercent = mapRange(t, 0, 1, 0, 100);
      const percentageTraveled = scrollY - this.start;

      // const xPercent = (percentageTraveled / this.wholeAmount) * 100;
      const imageTransformPercent = 100 - xPercent;
      const opacityPercent = 100 - ((percentageTraveled / this.wholeAmount) * 100);

     if ( scrollY < this.start ) {
      // translates the image container from right side to left
      this.el.style.transform = `translate3d(-${xPercent}%, 0, 0)`;
      this.behindImageWrapper.style.transform = `translate3d(-${imageTransformPercent}%, 0, 0)`;
      // transforms the opacity from 100% to o% so image behind can show through
      this.lastImage.style.opacity = `${opacityPercent}%`;
      this.imageRevealSection.style.zIndex = "-1";

      // translate vertically text from next section
      this.projectTextSection.style.transform = `translate3d(0, -${xPercent}%, 0)`;

      Debug.write("MovePhotoSection", "I should be at its original location");
    }

    if ( scrollY >= this.start ) {
      Debug.write("MovePhotoSection", `I should move the right photo ${xPercent}%`);
      // translates the image container from right side to left
      this.el.style.transform = `translate3d(-${xPercent}%, 0, 0)`;
      this.behindImageWrapper.style.transform = `translate3d(-${imageTransformPercent}%, 0, 0)`;
      // transforms the opacity from 100% to o% so image behind can show through
      this.lastImage.style.opacity = `${opacityPercent}%`;

      // translate vertically text from next section
      this.projectTextSection.style.transform = `translate3d(0, -${xPercent}%, 0)`;
      this._deactivate(0);
    }

    if (scrollY >= this.end ) {
      this._activate(0);
      return;
    }
  }

  _activate(i) {
    this.sectionHeaderText[i]?.classList.add("is-active");
    this.projectTextHeading[i]?.classList.add("is-active");
    this.bodyText[i]?.classList.add("is-active");
    this.itemNumberText[i]?.classList.add("is-active");
  }

  _deactivate(i) {
    this.sectionHeaderText[i]?.classList.remove("is-active");
    // this.projectTextHeading[i]?.classList.remove("is-active");
    this.bodyText[i]?.classList.remove("is-active");
    this.itemNumberText[i]?.classList.remove("is-active");
  }

  _deactivateAll() {
    this.sectionHeaderText.forEach(el => el.classList.remove("is-active"));
    this.projectTextHeading.forEach(el => el.classList.remove("is-active"));
    this.bodyText.forEach(el => el.classList.remove("is-active"));
    this.itemNumberText.forEach(el => el.classList.remove("is-active"));
  }
}