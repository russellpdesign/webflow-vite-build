import BaseSection from "../engine/BaseSection.js";

export default class MovePhotoSection extends BaseSection {
  constructor({ el }) {
    super({ el });

    this.homeScrollSection = document.querySelector(".home-scroll-section.is-don");
    // To get height of section we measure the height of all the triggers (since it takes one trigger per one 100vh sticky section in this type of section)
    this.triggers = document.querySelectorAll(".overview_trigger");
    this.triggersHeight = triggers[0].getBoundingClientRect().height * triggers.length;
    // set that value to our sectionLength to make our code more readable
    this.sectionLength = triggersHeight;
    this.lastSectionsEnd = homeScrollSection.getBoundingClientRect().top - document.body.getBoundingClientRect().top;
    this.start = lastSectionsEnd + sectionLength;
    this.viewportHeight = window.innerHeight;
    this.stickySection = document.querySelector(".sticky-section.heroic-members-wrapper.reversed");
    this.stickySectionHeight = stickySection.getBoundingClientRect().height;
    this.sticky100vh =  document.querySelector(".sticky-section-100vh");
    this.sticky100Height = sticky100vh.getBoundingClientRect().height;
    this.end = start + (sticky100Height * 1.38);
    this.homeScrollVisual = document.querySelector(".home-scroll-visual");
    this.lastImage = document.querySelector(".home-scroll-img.is-r-pad.wider");
    this.behindImageWrapper = document.querySelector(".home-scroll-img-behind-wrapper");
    this.sectionBoothDesign = document.querySelector(".sticky-section.heroic-members-wrapper.reversed");
    this.projectTextHeading = sectionBoothDesign.querySelector(".project-text-heading");
    this.sectionBoothDesignBodyText = sectionBoothDesign.querySelector(".body-text.home-scroll");
    this.sectionBoothDesignEyebrowText = sectionBoothDesign.querySelector(".section-header-text");
    this.sectionBoothNumberText = sectionBoothDesign.querySelectorAll(".home-scroll-item-number");
    this.leftSideImageHide = document.querySelector("#left-side-hide");
	this.imageRevealSection = document.querySelector(".double-wide-reveal-img");

    window.addEventListener("resize", () => this.measure());
  }

  measure() {
    this.start = this.sticky100vh.getBoundingClientRect().top - document.documentElement.getBoundingClientRect().top;
    this.end   = this.start + (this.sticky100Height * 1.38);

    // secondary breakpoints
    this.photoRemoveCheckpoint = this.end + (this.viewportHeight * 1.5);
    this.rightSideRevealCheckpoint = this.end + (this.viewportHeight * 3); // 3 is amount of sections (not including spacer, since we use that moment to animate in right side)
    this.zedIndexSwitchCheckpoint = this.rightSideRevealCheckpoint + (this.viewportHeight * .9);

    console.log(`start: ${this.start} end: ${this.end} photoRemoveCheckpoint: ${this.photoRemoveCheckpoint} rightSideRevealCheckpoint: ${this.rightSideRevealCheckpoint} zedIndexSwitchCheckpoint = ${this.zedIndexSwitchCheckpoint}`);
  }

  update(scrollY) {

    // const t = clamp01((scrollY - this.start) / (this.end - this.start));
    // const xPercent = mapRange(t, 0, 1, 0, 200);

    // BEFORE START
    if (scrollY < this.start) {
       this.imageRevealSection.style.zIndex = "-1"; 
       this.homeScrollVisual.style.transform = `translate3d(0%, 0, 0)`;
       this.behindImageWrapper.style.transform = "translate3d(-100%, 0, 0)";
       // return;
    }

    if (scrollY >= this.start) {
        this.percentageTraveled = scrollY - this.start;
        // The .38 comes from the previous sections padding of 38vh
        this.wholeAmount = this.sticky100Height * 1.38;
        this.xPercent = (this.percentageTraveled / this.wholeAmount) * 100;

        this.imageTransformPercent = 100 - this.xPercent;
        // translates the image container from right side to left
        this.homeScrollVisual.style.transform = `translate3d(-${this.xPercent}%, 0, 0)`;
        this.behindImageWrapper.style.transform = `translate3d(-${this.imageTransformPercent}%, 0, 0)`;

        // transforms the opacity from 100% to o% so image behind can show through
        this.opacityPercent = 100 - ((this.percentageTraveled / this.wholeAmount) * 100);
        this.lastImage.style.opacity = `${this.opacityPercent}%`;
        
        this.sectionBoothDesignBodyText.classList.remove("is-active");
        this.sectionBoothDesignEyebrowText.classList.remove("is-active");
        this.sectionBoothNumberText[0].classList.remove("is-active");
        // return;
    }

   if ( scrollY >= this.end ) {
    	this.lastImage.style.opacity = "0";
        this.homeScrollVisual.style.transform = "translate3d(-100%, 0, 0)";
        this.behindImageWrapper.style.transform = "translate3d(0%, 0, 0)";
        // force it in position once past (x = 100%, y is scrolldistance from end / viewportHeight since the image needs to scroll off screen as we scroll)
        this.yDistanceTraveled = scrollY - this.end;
        this.yPercent = (this.yDistanceTraveled / this.viewportHeight) * 100;
        // homeScrollVisual.style.transform = `translate3d(-100%, -${yPercent}%, 0)`;
        // lastImage.style.opacity = '0%';
        
        this.sectionBoothDesignBodyText.classList.add("is-active");
        this.sectionBoothDesignEyebrowText.classList.add("is-active");
        this.sectionBoothNumberText[0].classList.add("is-active");
        this.projectTextHeading.classList.add("is-active");
        
        // console.log("Stop animating the image and allow it to be scrolled!");
        this.behindImageWrapper.style.opacity = "1";
        // return;
    }

   // once a photo from the next section has overlayed our right to left traveling photo, we need to set its opacity to 0 so that the next sections sticky photo reveal works
    if ( scrollY > this.photoRemoveCheckpoint ) {
        this.behindImageWrapper.style.opacity = "0";
        this.leftSideImageHide.style.opacity = "1";
    }

     // once a photo from the next section has overlayed our right to left traveling photo, we need to set its opacity to 0 so that the next sections sticky photo reveal works
    if (scrollY > this.photoRemoveCheckpoint ) {
        this.behindImageWrapper.style.opacity = "0";
        this.leftSideImageHide.style.opacity = "1";
    }
    
    // now we need to remove the left side sticky scroll container using opacity: 0 in time when the section below scrolls into place right unederneath it
    if ( scrollY > this.rightSideRevealCheckpoint ) {
    // console.log("Animate text - remove is-active class on all")
    
    this.sectionBoothDesignBodyText.classList.remove("is-active");
    this.sectionBoothDesignEyebrowText.classList.remove("is-active");
    this.sectionBoothNumberText[0].classList.remove("is-active");
    this.projectTextHeading.classList.remove("is-active");
    this.leftSideImageHide.style.opacity = "0%";
    }
    
    if ( scrollY > this.zedIndexSwitchCheckpoint ) {
      console.log("I am revealing the image and waiting until the very top to switch the zed indexes");
      this.imageRevealSection.style.zIndex = "3";
      }
    
    if ( scrollY < this.zedIndexSwitchCheckpoint ) {
        this.imageRevealSection.style.zIndex = "-1";
        }
    }

}