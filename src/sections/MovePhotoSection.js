import StickyBaseSection from "../engine/StickyBaseSection";
import { Debug } from "../engine/Debug";
import { clamp01, mapRange } from "@utils";

export default class MovePhotoSection extends StickyBaseSection {
  constructor({ el }) {
    super({ el, anticipate: 1.5 });

    /* -------------------------------------------------------------
     * DECLARATIVE TIMELINE FOR PINNED PERIOD (t = 0 → 1)
     * ------------------------------------------------------------- */
    this.timeline = [
      { end: 0.28, name: "MAIN_MOVE",     textActive: false },
      { end: 0.52, name: "TEXT_REVEAL",   textActive: true  },
      { end: 0.78, name: "BEHIND_FADE",   textActive: true  },
      { end: 1.00, name: "LEFT_FADE_OUT", textActive: false },
      { end: Infinity, name: "COMPLETE",  textActive: false }
    ];

    /* -------------------------------------------------------------
     * DOM CACHING
     * ------------------------------------------------------------- */
    this.projectTextHeading = this.el.querySelector(".project-text-heading");
    this.sectionBoothDesignBody = this.el.querySelector(".body-text.home-scroll");
    this.sectionBoothEyebrow = this.el.querySelector(".section-header-text");
    this.sectionBoothNumbers = this.el.querySelectorAll(".home-scroll-item-number");

    // These come from the *previous* section
    this.homeScrollVisual = document.querySelector(".home-scroll-visual");
    this.lastImage = document.querySelector(".home-scroll-img.is-r-pad.wider");
    this.behindImageWrapper = document.querySelector(".home-scroll-img-behind-wrapper");

    // These come from the *next* section
    this.imageRevealSection = document.querySelector(".double-wide-reveal-img");
    this.leftSideImageHide = document.querySelector("#left-side-hide");

    // // This section moves FAST during reverse scroll; we give it a larger buffer.
    this.baseReleaseBuffer = 30;        // default from base is 20
    this.releaseMultiplier = 350;       // default from base is 300

    this.enabled = true;
  }

  /* -------------------------------------------------------------
   * MEASUREMENT (PinOffset added AFTER StickyBaseSection logic)
   * ------------------------------------------------------------- */
  measure() {
    super.measure();

    // custom timing offset into the pin start (old 138vh logic simplified)
    this.pinOffset = window.innerHeight * 2;

    // shift pin start to match your original flow
    this.start += this.pinOffset;

    // recompute end + length using StickyBaseSection height
    this.end = this.start + this.height;
    this.length = this.end - this.start;
  }

  /* -------------------------------------------------------------
   * PIN EVENT HOOKS
   * ------------------------------------------------------------- */
  onPin() {
    // Apply initial pinned state
    // this.homeScrollVisual.style.transform = "translate3d(0, 0, 0)";
    // this.behindImageWrapper.style.transform = "translate3d(-100%, 0, 0)";
    // this.lastImage.style.opacity = "100%";
    // this.imageRevealSection.style.zIndex = "-1";

    Debug.write("MovePhoto", "PIN STARTED");
  }

  onUnpin() {
    // Reset back to unpinned state
    // this.homeScrollVisual.style.transform = "";
    // this.behindImageWrapper.style.transform = "";
    // this.lastImage.style.opacity = "";
    // this.imageRevealSection.style.zIndex = "-1";

    Debug.write("MovePhoto", "PIN RELEASED");
    Debug.clear("MovePhoto");
  }

  /* -------------------------------------------------------------
   * DETERMINE CURRENT PHASE FROM TIMELINE
   * ------------------------------------------------------------- */
  resolvePhase(t) {
    for (let i = 0; i < this.timeline.length; i++) {
      if (t <= this.timeline[i].end) return this.timeline[i];
    }
    return this.timeline[this.timeline.length - 1];
  }

  /* -------------------------------------------------------------
   * MAIN TWEEN LOOP (runs when pinned, receives 0→1 progress t)
   * ------------------------------------------------------------- */
  onStickyUpdate(t) {
    const phase = this.resolvePhase(t);

    Debug.write("MovePhoto", `t=${t.toFixed(3)}, phase=${phase.name}`);

    this.setTextActive(phase.textActive);
    this.runPhaseAnimations(t, phase.name);
  }

  /* -------------------------------------------------------------
   * PHASE ANIMATION LOGIC
   * ------------------------------------------------------------- */
  runPhaseAnimations(t, phaseName) {
    switch (phaseName) {

      /* -------------------------------
       * IMAGE MOVE PHASE (0 → 0.28)
       * ------------------------------- */
      case "MAIN_MOVE": {
        // const localT = clamp01(t / this.timeline[0].end);

        // const x = mapRange(localT, 0, 1, 0, 100);
        // const behindX = 100 - x;
        // const opacity = mapRange(localT, 0, 1, 100, 0);

        // this.homeScrollVisual.style.transform = `translate3d(-${x}%, 0, 0)`;
        // this.behindImageWrapper.style.transform = `translate3d(-${behindX}%, 0, 0)`;
        // this.lastImage.style.opacity = `${opacity}%`;
        break;
      }

      /* -------------------------------
       * TEXT ACTIVATION + BEHIND IMAGE
       * ------------------------------- */
      case "TEXT_REVEAL":
        // this.homeScrollVisual.style.transform = "translate3d(-100%, 0, 0)";
        // this.behindImageWrapper.style.transform = "translate3d(0%, 0, 0)";
        break;

      case "BEHIND_FADE":
        // this.behindImageWrapper.style.opacity = "0";
        break;

      /* -------------------------------
       * LEFT SIDE FADE OUT
       * ------------------------------- */
      case "LEFT_FADE_OUT":
        // this.leftSideImageHide.style.opacity = "1";
        break;

      /* -------------------------------
       * FINAL Z-INDEX POP
       * ------------------------------- */
      case "COMPLETE":
        // this.imageRevealSection.style.zIndex = "3";
        break;
    }
  }

  /* -------------------------------------------------------------
   * TEXT ACTIVATION HELPER
   * ------------------------------------------------------------- */
  setTextActive(active) {
    const method = active ? "add" : "remove";

    this.sectionBoothDesignBody.classList[method]("is-active");
    this.sectionBoothEyebrow.classList[method]("is-active");
    this.sectionBoothNumbers[0].classList[method]("is-active");
    this.projectTextHeading.classList[method]("is-active");
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
