import BaseSection from "../engine/BaseSection.js";
import { Debug } from "../engine/Debug";
import { clamp01, mapRange } from "@utils";

export default class MovePhotoSection extends BaseSection {
  constructor({ el }) {
    super({ el });
    /* -------------------------------------------------------------
     * DOM ELEMENTS
     * ------------------------------------------------------------- */
    // el = document.querySelector(".home-scroll-visual")

    // Elements in our desired section
    this.homeScrollSection = document.querySelector(".home-scroll-section.is-don");
    this.triggers = document.querySelectorAll(".overview_trigger");

    this.sticky100vh =  document.querySelector(".sticky-section-100vh");
    this.stickySection = document.querySelector(".sticky-section.heroic-members-wrapper.reversed");

    // Elements from previous sections
    this.lastImage = document.querySelector(".home-scroll-img.is-r-pad.wider");
    this.behindImageWrapper = document.querySelector(".home-scroll-img-behind-wrapper");

    // Elements from section after image translates left to right (text animations)
    this.projectTextSection = document.querySelector(".project-text-section.is-sticky.heroic-members");
    this.sectionHeaderText = this.projectTextSection.querySelectorAll(".section-header-text");
    this.projectTextHeading = this.projectTextSection.querySelectorAll(".project-text-heading");
    this.bodyText = this.projectTextSection.querySelectorAll(".body-text.home-scroll");
    this.itemNumberText = this.projectTextSection.querySelectorAll(".home-scroll-item-number");

    // Elements from upcoming sections (for controlling z-indexing)
    this.imageRevealSection = document.querySelector(".double-wide-reveal-img");
    this.leftSideImageHide = document.querySelector("#left-side-hide");

    this.enabled = true;

    // put here to trigger new measuring since our animation is dependent on accurate real-time measurements
    window.addEventListener("resize", () => this.measure());
  }

  /* -------------------------------------------------------------
   * MEASURE
   * ------------------------------------------------------------- 
   * */
  measure() {
    super.measure();
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

    // console.log(`This is the end of the movephotosection: ${this.end}`)

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

      // Debug.write("MovePhotoSection", "I should be at its original location");
    }

    if ( scrollY >= this.start ) {
      // Debug.write("MovePhotoSection", `I should move the right photo ${xPercent}%`);
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
      if (!isActive) {this._activate(0);}
      else return;
    }
  }

  _activate(i) {
    this.sectionHeaderText[i]?.classList.add("is-active");
    this.projectTextHeading[i]?.classList.add("is-active");
    this.bodyText[i]?.classList.add("is-active");
    this.itemNumberText[i]?.classList.add("is-active");
    isActive = true;
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


// OLD

// import BaseSection from "../engine/BaseSection.js";
// import { clamp, clamp01, mapRange } from "@utils";
// import { Debug } from "@engine/Debug";

// export default class MovePhotoSection extends BaseSection {
//   constructor({ el }) {
//     super({ el });

//     this.homeScrollSection = document.querySelector(".home-scroll-section.is-don");
//     // To get height of section we measure the height of all the triggers (since it takes one trigger per one 100vh sticky section in this type of section)
//     this.triggers = document.querySelectorAll(".overview_trigger");
//     this.triggersHeight = this.triggers[0].getBoundingClientRect().height * this.triggers.length;
//     // set that value to our sectionLength to make our code more readable
//     this.sectionLength = this.triggersHeight;
//     this.lastSectionsEnd = this.homeScrollSection.getBoundingClientRect().top + window.scrollY;
//     this.viewportHeight = window.innerHeight;

//     // items relevant to our section
//     // this.boothSection = document.querySelector(".sticky-section.heroic-members-wrapper.reversed");
//     this.stickySectionHeight = this.el.getBoundingClientRect().height;
//     this.projectTextHeading = this.el.querySelector(".project-text-heading");
//     this.sectionBoothDesignBodyText = this.el.querySelector(".body-text.home-scroll");
//     this.sectionBoothDesignEyebrowText = this.el.querySelector(".section-header-text");
//     this.sectionBoothNumberText = this.el.querySelectorAll(".home-scroll-item-number");
//     this.sticky100vh =  document.querySelector(".sticky-section-100vh");
//     this.homeScrollVisual = document.querySelector(".home-scroll-visual");
//     this.lastImage = document.querySelector(".home-scroll-img.is-r-pad.wider");
//     this.behindImageWrapper = document.querySelector(".home-scroll-img-behind-wrapper");

//     this.leftSideImageHide = document.querySelector("#left-side-hide");
// 	  this.imageRevealSection = document.querySelector(".double-wide-reveal-img");

//     this.enabled = true;

//     window.addEventListener("resize", () => this.measure());
//   }

//   measure() {
//     const rect = this.sticky100vh.getBoundingClientRect();
//     const absoluteTop = rect.top + window.scrollY;

//     this.start = absoluteTop - this.viewportHeight;

//     this.sticky100Height = this.sticky100vh.getBoundingClientRect().height;

//     this.end = this.start + (this.sticky100Height * 1.38);

//     // secondary breakpoints
//     this.photoRemoveCheckpoint = this.end + (this.viewportHeight * 1.5);
//     this.rightSideRevealCheckpoint = this.end + (this.viewportHeight * 3); // 3 is amount of sections (not including spacer, since we use that moment to animate in right side)
//     this.zedIndexSwitchCheckpoint = this.rightSideRevealCheckpoint + (this.viewportHeight * .9);
//   }

//   update(scrollY) {

//     const rawY = window.scrollY;

//     // console.table("MovePhotoSection measured:", {
//     //   current: scrollY,
//     //   start: this.start,
//     //   end: this.end,
//     //   photoRemoveCheckpoint: this.photoRemoveCheckpoint,
//     //   rightSideRevealCheckpoint: this.rightSideRevealCheckpoint,
//     //   zedIndexSwitchCheckpoint: this.zedIndexSwitchCheckpoint
//     // });
//     // const t = clamp01((scrollY - this.start) / (this.end - this.start));
//     // const xPercent = mapRange(t, 0, 1, 0, 200);

//     // BEFORE START
//     if (scrollY < this.start) {
//        this.imageRevealSection.style.zIndex = "-1"; 
//        this.homeScrollVisual.style.transform = `translate3d(0%, 0, 0)`;
//        this.behindImageWrapper.style.transform = "translate3d(-100%, 0, 0)";
//        return;
//     }

//     if ( scrollY > this.start && scrollY < this.end) {
//         const t = clamp01((scrollY - this.start) / (this.end - this.start));

//         const xPercent = mapRange(t, 0, 1, 0, 100);
//         const opacityPercent = mapRange(t, 0, 1, 100, 0);
//         const behindImageXPercent = 100 - xPercent;

//         console.log(t, xPercent, opacityPercent, behindImageXPercent);

//         // translates the image container from right side to left
//         this.homeScrollVisual.style.transform = `translate3d(-${xPercent}%, 0, 0)`;
//         this.behindImageWrapper.style.transform = `translate3d(-${behindImageXPercent}%, 0, 0)`;
//         this.lastImage.style.opacity = `${opacityPercent}%`;
//     }
    
//     if ( rawY > this.start && rawY < this.end) {
//         this.sectionBoothDesignBodyText.classList.remove("is-active");
//         this.sectionBoothDesignEyebrowText.classList.remove("is-active");
//         this.sectionBoothNumberText[0].classList.remove("is-active");
//         this.imageRevealSection.style.zIndex = "-1";
//     }

//    if ( scrollY > this.end && scrollY < this.photoRemoveCheckpoint ) {
//         this.homeScrollVisual.style.transform = "translate3d(-100%, 0, 0)";
//         this.behindImageWrapper.style.transform = "translate3d(0%, 0, 0)";
//         // return;
//     }

//     if ( rawY > this.end && rawY < this.photoRemoveCheckpoint) {
//         this.sectionBoothDesignBodyText.classList.add("is-active");
//         this.sectionBoothDesignEyebrowText.classList.add("is-active");
//         this.sectionBoothNumberText[0].classList.add("is-active");
//         this.projectTextHeading.classList.add("is-active");
        
//         this.lastImage.style.opacity = "0";
//         this.behindImageWrapper.style.opacity = "1";
//         this.imageRevealSection.style.zIndex = "-1";
//     }

//    // once a photo from the next section has overlayed our right to left traveling photo, we need to set its opacity to 0 so that the next sections sticky photo reveal works
//     if ( scrollY > this.photoRemoveCheckpoint && scrollY < this.rightSideRevealCheckpoint ) {
//         this.homeScrollVisual.style.transform = "translate3d(-100%, 0, 0)";
//         this.behindImageWrapper.style.transform = "translate3d(0%, 0, 0)";
//     }

//      if ( rawY > this.photoRemoveCheckpoint && rawY < this.rightSideRevealCheckpoint ) {  
//         this.sectionBoothDesignBodyText.classList.add("is-active");
//         this.sectionBoothDesignEyebrowText.classList.add("is-active");
//         this.sectionBoothNumberText[0].classList.add("is-active");
//         this.projectTextHeading.classList.add("is-active");
//         this.behindImageWrapper.style.opacity = "0";
//         this.lastImage.style.opacity = "0";
//         this.imageRevealSection.style.zIndex = "-1";
//         return;
//     }
    
//     // now we need to remove the left side sticky scroll container using opacity: 0 in time when the section below scrolls into place right unederneath it
//     if ( rawY > this.rightSideRevealCheckpoint && rawY < this.zedIndexSwitchCheckpoint) {
//         this.sectionBoothDesignBodyText.classList.remove("is-active");
//         this.sectionBoothDesignEyebrowText.classList.remove("is-active");
//         this.sectionBoothNumberText[0].classList.remove("is-active");
//         this.projectTextHeading.classList.remove("is-active");
//         this.leftSideImageHide.style.opacity = "1";
//         this.lastImage.style.opacity = "0";
//         this.imageRevealSection.style.zIndex = "-1";
//         return;
//     }
    
//     if ( rawY > this.zedIndexSwitchCheckpoint ) {
//         console.log("I am revealing the image and waiting until the very top to switch the zed indexes");
//         this.imageRevealSection.style.zIndex = "3";
//         this.leftSideImageHide.style.opacity = "0";
//         this.lastImage.style.opacity = "0";
//       } else {
//         this.imageRevealSection.style.zIndex = "-1";
//       }
//   }
// }
