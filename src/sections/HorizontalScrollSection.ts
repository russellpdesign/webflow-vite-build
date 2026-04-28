import BaseSection from "../engine/BaseSection.js";
import { Debug } from "../engine/Debug.js";
import { clamp, clamp01, mapRange } from "../engine/utils.js";

type HorizontalScrollSectionConfig = {
  el: string | HTMLElement;
};

export default class HorizontalScrollSection extends BaseSection {
  // DOM collections
  progressBarHeight!: number;
  range: number = 0;
  viewportWidth: number = 0;
  viewportHeight: number = 0;
  //flags
  private activeSectionIndex: number | null = null;
  private _willChangeActivated = false;

  constructor({ el }: HorizontalScrollSectionConfig ) {
    super({ el });

    //  el = ".horizontal-scroll-product";

    /* -------------------------------------------------------------
     * DOM ELEMENTS
     * ------------------------------------------------------------- */

    // PREVIOUS SECTION ELEMENTS FOR TRANSITION PHASE

    // helps anchor our triggers to the start of the previous section
    this.previousSectionTrigger = document.querySelector<HTMLElement>(".photo-overlap-section-trigger")!;
    // All images that participate in the overlap animation
    this.initialImages = Array.from(this.previousSectionTrigger.querySelectorAll<HTMLElement>(".sticky-img-container"));
    // this is the parent of the actual scaled image container. It ensures our image scales center-wise because it's parent is absolute + is centering children w/ flexbox.
    this.firstImage = document.querySelector(".sticky-big-img-reveal");
    // not really exclusive to our previous section, but to our previous sections mathematics.
    this.progressBar = document.querySelector<HTMLElement>(".progress-container")!;

    // CURRENT SECTION ELEMENTS

    // this is our big section div (we animate transformX to mimic horizontal scrolling)
    this.horizontalScrollSectContainer = document.querySelector(".horizontal-section-container");
    // these are our individual three sections inside of our bigger container
    this.scrollSections = document.querySelectorAll("#horizontal_scroll");
    // this is the parent container of our big title text element, which we animate the margin top from 100-0 to mimic the act of scrolling and give it smoothing effect.
    this.bigTitles = document.querySelectorAll(".product-title-big");

    // these are our individual text elements, for activating / deactivating by toggling "active" class
    this.bigTexts = document.querySelectorAll(".big-text");
    this.mediumBigTexts = document.querySelectorAll(".medium-big-text");
    this.productDescs = document.querySelectorAll(".product-desc");
    // this is our dropdown container, which we set pointer events to none or auto to toggle on hover interaction when needed
    this.dropdownWrappers = document.querySelectorAll(".dropdown-wrapper");
    // these are our dropdown row headers, which we animate on entering in a new section with a time delay stagger
    this.dropdownHeaders = document.querySelectorAll(".dropdown-header-container");
    // this is the image in our first horizontal scroll section, which is actually hidden but used as a reference for determining how our previous image scales and sizes down.
    this.endingImage = document.querySelector("#scale-down-img-after");

    console.log(`The amount of sections in our horizontal scroll section is: ${this.scrollSections.length}`);

    this.enabled = true;

    window.addEventListener("resize", () => console.log("Horizontal Scroll Section: window was resized!"));
    // window.addEventListener("resize", () => this.measure());
  }

  measure(): void {
    super.measure();
    
    // helper variables
    this.viewportHeight = window.innerHeight;
    this.progressBarHeight = this.progressBar!.getBoundingClientRect().height;

    // Previous Section - animation variables
    this.previousSectionTriggerStart =
      window.scrollY +
      this.previousSectionTrigger.getBoundingClientRect().top +
      window.innerHeight * 1.38 +
      this.progressBarHeight;

    this.triggers = this.initialImages.map((_, i) => this.previousSectionTriggerStart + this.viewportHeight * i);

    this.startScale = this.triggers[this.triggers.length - 1] + this.viewportHeight;
    this.scaleEnd = this.startScale + this.viewportHeight;

    // Current Section - animation variables
    this.start = this.el.getBoundingClientRect().top + scrollY;

    // how much distance we scroll while not moving our section
    this.sectionScrollingVerticalDistance = this.viewportHeight * 2;
    // how much vertical distance we scroll while scrolling the parent section over -100% vwin order to view our next section
    this.sectionScrollRangeDistance = this.viewportHeight;

    this.sectionTransitionIn = this.startScale;
    this.sectionTransitionEnd = this.endScale;
    this.section1 = this.start;
    this.scrollStart1 = this.start + this.viewportHeight * 2;
    this.scrollEnd1 = this.start + (this.viewportHeight * 3);
    this.scrollGap1Start = this.start + (this.viewportHeight * 3);
    this.scrollGap1End = this.start + (this.viewportHeight * 5);
    this.scrollStart2 = this.start + (this.viewportHeight * 5);
    this.scrollEnd2 = this.start + (this.viewportHeight * 6);
    this.scrollGap2Start = this.start + (this.viewportHeight * 6);
    this.scrollGap2End = this.start + (this.viewportWidth * 8);
    this.scrollStart3 = this.start + (this.viewportHeight * 8);
    this.scrollEnd3 = this.start + (this.viewportHeight * 9);

    this.sectionRanges = [
      [0, this.scrollStart1], // scrolling into view
      [this.scrollStart1, this.scrollEnd1], // horizontal scrolling from section one to two
      [this.scrollEnd1, this.scrollStart2], // native scrolling while in section 2
      [this.scrollStart2, this.scrollEnd2], // horizontal scrolling from section two to three
      [this.scrollEnd2, this.scrollStart3], // native scrolling while in section 3
      [this.scrollEnd3, document.documentElement.scrollHeight],
    ];
  }

update(scrollY: number): void {
    if (!this.enabled) return;

    // our timeline for this section begins as our image from the previous section begins to scale down
    // it then progresses into our individual sections (SECTION_1, etc.) with a scroll range in between
    // the scroll range is the actual part where we scroll horizontally, the sections don't scroll at all, they appear static
    // after scroll is when we start scrolling out of section 3 via native scrolling
    type ScrollState = "BEFORE_TRANSITION" | "SCALE_TRANSITION" | "SECTION_1" | "SCROLL_RANGE_1" | "SECTION_2" | "SCROLL_RANGE_2" | "SECTION_3" | "AFTER_SCROLL";

    const getState = (scrollY: number): ScrollState => {
      return (
        (scrollY <= this.sectionTransitionIn && "BEFORE_TRANSITION") ||
        (scrollY <= this.section1 && "SCALE_TRANSITION") ||
        (scrollY <= this.scrollStart1 && "SECTION_1") || // we are scrolling before we enter our horizontal scroll section
        (scrollY <= this.scrollEnd1 && "SCROLL_RANGE_1") || // we are scrolling to second section
        (scrollY <= this.scrollStart2 && "SECTION_2") || // we are sitting in second section, natively scrolling but no movement
        (scrollY <= this.scrollEnd2 && "SCROLL_RANGE_2") || // scrolling from section two to three
        (scrollY <= this.scrollStart3 && "SECTION_3") || // we are sitting in the third section
        "AFTER_SCROLL" // we are scrolling down out of the horizontal scroll section
      );
    };

    const doWork = (state: ScrollState, scrollY: number): void => {
      let t: number;

      // console.log(this.lastActiveState, state);

      // we check if we are in the range of our section, and if we are, we prep the dom for performance via willChange on our horizontal scroll section
      const isActive = scrollY >= this.sectionTransitionIn && scrollY <= this.scrollEnd3;
      console.log(isActive, this._willChangeActivated);

      if(isActive !== this._willChangeActivated) {
        this.horizontalScrollSectContainer.style.willChange = isActive ? "transform" : "auto";
        this._willChangeActivated = isActive;
      }
      
      const getActiveSectionIndex = (state: ScrollState, lastActiveState: ScrollState): number | null => {
        return (state === "SECTION_1" || lastActiveState === "SECTION_1" || state === "SCROLL_RANGE_1") ? 0 :
               (state === "SECTION_2" || lastActiveState === "SECTION_2" || state === "SCROLL_RANGE_2") ? 1 :
               (state === "SECTION_3" || lastActiveState === "SECTION_3" || state === "AFTER_SCROLL") ? 2 :
               null;
        };

      let activeSectionIndex = getActiveSectionIndex(state, this.lastActiveState);

      switch(this.lastActiveState + " " + state) {
        case "undefined BEFORE_TRANSITION":
          // we reloaded the page and are located (scrollY) in our previous photo overlap section
          this.lastActiveState = state;
          return;
        case "BEFORE_TRANSITION BEFORE_TRANSITION":
          // we are and were in our previous photo overlap section, no image scaling done yet
          // we ensure our top margin is ready to animate
          this.bigTitles[0].style.marginTop = `100vh`;
          this.lastActiveState = state;
          return;
        case "SCALE_TRANSITION BEFORE_TRANSITION":
          // we just backtracked from our scaling portion of our previous section to no more scaling
          // we need to animate the top margin of our big title to simulate scrolling the section into view
          this.lastActiveState = state;
          return;
        case "BEFORE_TRANSITION SCALE_TRANSITION":
          // our previous sections photo is now starting to scale and we are scrolling toward our current section's first section
          // we need to animate the top margin of our big title to simulate scrolling the section into view
          t = clamp01((scrollY - this.startScale) / this.viewportHeight);
          this.scaleProgress = mapRange(t, 0, 1, 0, 1);
          this.marginTopShrink = 100 - (this.scaleProgress * 100);
          this.bigTitles[0].style.marginTop = `${this.marginTopShrink}vh`;
          break;
      case "undefined SCALE_TRANSITION":
          // we just backtracked from our scaling portion of our previous section to no more scaling
          // we need to animate the top margin of our big title to simulate scrolling the section into view
          t = clamp01((scrollY - this.startScale) / this.viewportHeight);
          this.scaleProgress = mapRange(t, 0, 1, 0, 1);
          this.marginTopShrink = 100 - (this.scaleProgress * 100);
          this.bigTitles[0].style.marginTop = `${this.marginTopShrink}vh`;
          this.lastActiveState = state;
          return;
        case "SCALE_TRANSITION SCALE_TRANSITION":
          // we are in the transition between our previous section and current, where the photo is scaling and we are now seeing our current section first section's  big title scroll into view
          // we need to animate the top margin of our big title to simulate scrolling the section into view
          t = clamp01((scrollY - this.startScale) / this.viewportHeight);
          this.scaleProgress = mapRange(t, 0, 1, 0, 1);
          this.marginTopShrink = 100 - (this.scaleProgress * 100);
          this.bigTitles[0].style.marginTop = `${this.marginTopShrink}vh`;
          break;
        case "SCALE_TRANSITION SECTION_1":
          // we've just transitioned from our photo scaling into our first section
          // we activate our text elements
          this._activate(activeSectionIndex);
          this.bigTitles[0].style.marginTop = `0vh`;
          // we ensure our parent div is at 0
          this.horizontalScrollSectContainer.style.transform = `translateX(0vw)`;
          this.firstImage.style.transform = `translateX(0vw)`;
          break;
        case "SECTION_1 SCALE_TRANSITION":
          // we have backtrack scrolled from our first section into our scaling transition section
          this._deactivate(activeSectionIndex);
          this.bigTitles[0].style.marginTop = `0vh`;
          // we reset our horizontal section parent to its starting point
          this.horizontalScrollSectContainer.style.transform = `translateX(0vw)`;
          this.firstImage.style.transform = `translateX(0vw)`;
          break;
        case "SECTION_1 SECTION_1":
          // we are actively scrolling in our first section, staying stationary of course
          // we deactivate the supporting text elements and dropdown for the section ahead of the one we are in, reseting it so it can animate in
          this._deactivate(activeSectionIndex + 1);
          break;
        case "undefined SECTION_1":
          // console.log("case is undefined SECTION_1: I refreshed the page partway down the page, before our section begins.");
          // I have refreshed the page and am in the first section
          // we activate our text elements
          this._activate(activeSectionIndex);
          // we reset our horizontal section parent to its starting point
          this.horizontalScrollSectContainer.style.transform = `translateX(0vw)`;
          this.firstImage.style.transform = `translateX(0vw)`;
          break;
        case "SECTION_1 SCROLL_RANGE_1":
          // needs to continuously update our section as we scroll
          // console.log("case is SECTION_1 SCROLL_RANGE_1: I have transitioned from before scroll to scrolling into our first scroll range going from section one to section two.");
          t = clamp01((scrollY - this.scrollStart1) / this.viewportHeight);
          this.slideProgress = mapRange(t, 0, 1, 0, 100);
          this.horizontalScrollSectContainer.style.transform = `translateX(-${this.slideProgress}vw)`;
          this.firstImage.style.transform = `translateX(-${this.slideProgress}vw)`;
          // also need to activate certain text / dropdown components once
          // do that here
          break;
        case "undefined SCROLL_RANGE_1":
          // needs to continuously update our section as we scroll
          // console.log("case is undefined SCROLL_RANGE_1: I have loaded the page and am in the scrollable portion between section one and two.");
          t = clamp01((scrollY - this.scrollStart1) / this.viewportHeight);
          this.slideProgress = mapRange(t, 0, 1, 0, 100);
          this.horizontalScrollSectContainer.style.transform = `translateX(-${this.slideProgress}vw)`;
          this.firstImage.style.transform = `translateX(-${this.slideProgress}vw)`;
          // also need to activate certain text / dropdown components once
          this._activate(activeSectionIndex)
          break;
        case "SCROLL_RANGE_1 SCROLL_RANGE_1":
          // console.log("case is SCROLL_RANGE_1 SCROLL_RANGE_1: I am scrolling into our first section from the second.");
          // first check if we are scrolling or still, if still, exit, otherwise run logic
          // need to continuously update out position
          t = clamp01((scrollY - this.scrollStart1) / this.viewportHeight);
          this.slideProgress = mapRange(t, 0, 1, 0, 100);
          this.horizontalScrollSectContainer.style.transform = `translateX(-${this.slideProgress}vw)`;
          this.firstImage.style.transform = `translateX(-${this.slideProgress}vw)`;
          break;
        case "SCROLL_RANGE_1 SECTION_1":
          // console.log("case is SCROLL_RANGE_1 SECTION_1: I have scrolled back into our first section from the second.");
          // we set our transform back to its starting position
          this.horizontalScrollSectContainer.style.transform = `translateX(0vw)`;
          this.firstImage.style.transform = `translateX(0vw)`;
          break;
        case "SCROLL_RANGE_1 SECTION_2":
          // console.log("case is SCROLL_RANGE_1 SECTION_2: I have transitioned into our second section from the first.");
          // we set our transform to its static position
          this.horizontalScrollSectContainer.style.transform = `translateX(-100vw)`;
          this.firstImage.style.transform = `translateX(-100vw)`;
          // we activate certain text and dropdown elements
          this._activate(activeSectionIndex);
          break;
        case "undefined SECTION_2":
          console.log("case is undefined SECTION_2: I have loaded the page and am sitting in the second section.");
          // we set our transform to its static position
          this.horizontalScrollSectContainer.style.transform = `translateX(-100vw)`;
          this.firstImage.style.transform = `translateX(0vw)`;
          // we activate certain text and dropdown elements, including previous sections
          this._activate(activeSectionIndex);
          this._activate(activeSectionIndex - 1);
          break;
        case "SECTION_2 SECTION_2":
          // we essentially do nothing here but update our state
          // console.log("case is SECTION_2 SECTION_2: I am scrolling in our section section.");
          this._deactivate(activeSectionIndex + 1);
          this.lastActiveState = state;
          return;
        case "SECTION_2 SCROLL_RANGE_1":
          // console.log("case is SECTION_2 SCROLL_RANGE_1: I have scrolled backwards from our second section and am heading backwards to the first.");
          // we set our transform to its static position
          t = clamp01((scrollY - this.scrollStart1) / this.viewportHeight);
          this.slideProgress = mapRange(t, 0, 1, 0, 100);
          this.horizontalScrollSectContainer.style.transform = `translateX(-${this.slideProgress}vw)`;
          this.firstImage.style.transform = `translateX(-${this.slideProgress}vw)`;
          // we activate certain text and dropdown elements
          // this._deactivate(activeSectionIndex);
          break;
        case "undefined SCROLL_RANGE_2":
          // console.log("case is undefined SCROLL_RANGE_2: I have loaded the page and am sitting in the scrollable portion of the section section.");
          // we set our transform to its static position
          t = clamp01((scrollY - this.scrollStart2) / this.viewportHeight);
          this.slideProgress = mapRange(t, 0, 1, 100, 200);
          this.horizontalScrollSectContainer.style.transform = `translateX(-${this.slideProgress}vw)`;
          // we our current section text items and our previous since they will not have been activated via scrolling into them
          this._activate(activeSectionIndex);
          this._activate(activeSectionIndex - 1);
          break;
        case "SECTION_2 SCROLL_RANGE_2":
          // console.log("case is SECTION_2 SCROLL_RANGE_2: I have scrolled from our second section and am heading towards the third.");
          // we set our transform to its static position
          t = clamp01((scrollY - this.scrollStart2) / this.viewportHeight);
          this.slideProgress = mapRange(t, 0, 1, 100, 200);
          this.horizontalScrollSectContainer.style.transform = `translateX(-${this.slideProgress}vw)`;
          // we activate certain text and dropdown elements
          break;
        case "SCROLL_RANGE_2 SCROLL_RANGE_2":
          // otherwise we update our scroll position in real time
          // console.log("case is SCROLL_RANGE_2 SCROLL_RANGE_2: I have scrolled from our second section and am heading towards the third.");
          t = clamp01((scrollY - this.scrollStart2) / this.viewportHeight);
          this.slideProgress = mapRange(t, 0, 1, 100, 200);
          this.horizontalScrollSectContainer.style.transform = `translateX(-${this.slideProgress}vw)`;
          break;
        case "SCROLL_RANGE_2 SECTION_2":
          // console.log("case is SCROLL_RANGE_2 SECTION_2: I have backtracked from our second scrollable section and have reentered section two again.");
          // we set our transform to its static position
          this.horizontalScrollSectContainer.style.transform = `translateX(-100vw)`;
          // we activate certain text and dropdown elements
          this._activate(activeSectionIndex);
          break;
        case "undefined SECTION_3":
          // console.log("case is undefined SECTION_3: I have loaded the page and am sitting section three aka our second scroll gap.");
          // we set our transform to its static position
          this.horizontalScrollSectContainer.style.transform = `translateX(-200vw)`;
          // we activate certain text and dropdown elements
          this._activate(activeSectionIndex);
          this._activate(activeSectionIndex - 1);
          this._activate(activeSectionIndex - 2);
          break;
        case "SCROLL_RANGE_2 SECTION_3":
          // console.log("case is SCROLL_RANGE_2 SECTION_3: I have entered the third section.");
          // we set our transform to its static position
          this.horizontalScrollSectContainer.style.transform = `translateX(-200vw)`;
          // we activate certain text and dropdown elements
          this._activate(activeSectionIndex);
          break;
        case "SECTION_3 SCROLL_RANGE_2":
          // console.log("case is SECTION_3 SCROLL_RANGE_2: I have scrolled back towards section two, and entered scroll range 2.");
          // we set our transform to its static position
          t = clamp01((scrollY - this.scrollStart2) / this.viewportHeight);
          this.slideProgress = mapRange(t, 0, 1, 100, 200);
          this.horizontalScrollSectContainer.style.transform = `translateX(-${this.slideProgress}vw)`;
          // we activate certain text and dropdown elements
          // this._deactivate(activeSectionIndex);
          break;
        case "SECTION_3 SECTION_3":
          // we essentially do nothing here, and exit our case switch and subsequently update, just updating our current state
          // console.log("case is SECTION_3 SECTION_3: I am and have been in the third section.");
          break;
        case "undefined AFTER_SCROLL":
          // console.log("case is undefined AFTER_SCROLL: I have loaded the page and am past our last section.");
          // we set our transform to its static position
          this.horizontalScrollSectContainer.style.transform = `translateX(-200vw)`;
          // we activate certain text and dropdown elements
          // do that here
          break;
        case "SECTION_3 AFTER_SCROLL":
          // console.log("case is SECTION_3 AFTER_SCROLL: I have scrolled out of our third section and am exiting the horizontal scrolling section as a whole.");
          // we set our transform to its static position
          this.horizontalScrollSectContainer.style.transform = `translateX(-200vw)`;
          // we activate certain text and dropdown elements
          // this._deactivate(activeSectionIndex);
          break;
        case "AFTER_SCROLL AFTER_SCROLL":
          // console.log("case is AFTER_SCROLL AFTER_SCROLL: I am no longer scrolling in our horizontal scroll section, I am past it.");
          this.lastActiveState = state;
          return;
        case "undefined AFTER_SCROLL":
          // console.log("case is undefined AFTER_SCROLL: I have loaded the page and am past our horizontal scroll section.");
          // we set our transform of our last section to its static position in case we scroll backwards
          this.horizontalScrollSectContainer.style.transform = `translateX(-200vw)`;
          break;
      }
      // once we've ran the state logic we update our previous state to our current and exit the function
      this.lastActiveState = state;
      return;
    }

    doWork(getState(scrollY), scrollY); // gets our current state and applies changes

  } // ends update function

    // we add one to the index for these since we start activating things starting in our second section
    private _activate(i: number): void {
      this.bigTexts[i].classList.add("active"); // this is confusing because adding the active class actually hides the text
      this.mediumBigTexts[i].classList.add("active"); // with these adding active reveals it
      setTimeout(() => this.productDescs[i].classList.add("active"), 300);
      this.dropdownWrappers[i].style.pointerEvents = "auto";
      this.productDescs[i].addEventListener("transitionend", startDropdown())
      function startDropdown() {
        for (let x = i * 3; x <= i * 3 + 2; x++) {
          const el = this.dropdownHeaders[x];
          if (el) {
            setTimeout(() => el.classList.add("active"), 100 * (x - 3 * Math.floor(x / 3)));
          }
        } // end for loop
      } // end of start dropdown function
    } // end activate

    private _deactivate(i: number): void {
      this.bigTexts[i].classList.remove("active");
      this.mediumBigTexts[i].classList.remove("active");
      this.productDescs[i].classList.remove("active");
      this.dropdownWrappers[i].style.pointerEvents = "none";
      for (let x = i * 3; x <= i * 3 + 2; x++) {
        const el = this.dropdownHeaders[x];
        if (el) {
          setTimeout(() => el.classList.remove("active"), 100 * (x - 3 * Math.floor(x / 3)));
        }
      } // end for loop
    } // end deactivate

} // ends class constructor