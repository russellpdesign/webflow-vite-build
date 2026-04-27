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
    // these are our dropdown row headers, which we animate on entering in a new section with a time delay stagger
    this.dropdownHeaders = document.querySelectorAll(".dropdown-header-container");
    // this is the image in our first horizontal scroll section, which is actually hidden but used as a reference for determining how our previous image scales and sizes down.
    this.endingImage = document.querySelector("#scale-down-img-after");

    console.log(`The amount of sections in our horizontal scroll section is: ${this.scrollSections.length}`);

    this.enabled = true;

    window.addEventListener("resize", () => this.measure());
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

    // this.scrollBoundaries = []

    // this construction of our start and stop values is dynamic and updates when new scrollBoundaries are add. The height of the parent will have to increase as well 300vh for each new section to allow 100vh for scrolling over and 200 for scrolling inside
    // for(let i = 2; i <= 2 + (this.scrollSections.length * 2); i+= 3) {

    //   const newSection: {section: number, scrollRangeStart: number, scrollRangeEnd: number, scrollGapStart: number, scrollGapEnd: number } = {
    //     section: (i + 1) / 3, 
    //     scrollRangeStart: this.start + this.viewportHeight * i,
    //     scrollRangeEnd: this.start + this.viewportHeight * ((i + 2) - 1),
    //     scrollGapStart: this.start + this.viewportHeight * ((i + 2) - 1),
    //     scrollGapEnd: this.start + this.viewportHeight * ((i + 2) - 1) + (this.viewportHeight * 2)
    //   };

    //   this.scrollBoundaries.push(newSection)
    // };

    // console.log(this.scrollBoundaries);

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

    // performance hints, in measure so they only run once, not every loop
    this.horizontalScrollSectContainer.style.setProperty("will-change", "auto");
    this.firstImage.style.setProperty("will-change", "auto");
  }

update(scrollY: number): void {
    if (!this.enabled) return;

    // our timeline for this section begins as our image from the previous section begins to scroll down
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
      console.log(this.lastActiveState, state);
      // console.log(this.previousScrollY, scrollY);
      // if we arent actively scrolling, exit
      // if(this.previousScrollY === scrollY) {return}

      switch(this.lastActiveState + " " + state) {
        case "undefined BEFORE_TRANSITION":
          // we reloaded the page and are located (scrollY) in our previous photo overlap section
          // no action needed
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
          this.bigTexts[0].classList.add("active");
          this.mediumBigTexts[0].classList.add("active");
          this.productDescs[0].classList.add("active");
          // animate out dropdown headers
          for(let i = 0; i<= 2; i++) {
            setTimeout(() => this.dropdownHeaders[i].classList.add("active"), i * 100);
          };
          // we set our other big titles to be at 0vh so when scrolling ahead they are in the correct position
          this.bigTitles[0].style.marginTop = `0vh`;
          this.bigTitles[1].style.marginTop = `0vh`;
          this.bigTitles[2].style.marginTop = `0vh`;
          // we ensure our parent div is at 0
          this.horizontalScrollSectContainer.style.transform = `translateX(0vw)`;
          this.firstImage.style.transform = `translateX(0vw)`;
          break;
        case "SECTION_1 SCALE_TRANSITION":
          // we have backtrack scrolled from our first section into our scaling transition section
          // we de-activate our text elements
          this.bigTexts[0].classList.remove("active");
          this.mediumBigTexts[0].classList.remove("active");
          this.productDescs[0].classList.remove("active");
          // animate out dropdown headers
          for(let i = 0; i<= 2; i++) {
            setTimeout(() => this.dropdownHeaders[i].classList.remove("active"), i * 100);
          };
          // we set our other big titles to be at 0vh so when scrolling ahead they are in the correct position
          this.bigTitles[0].style.marginTop = `0vh`;
          this.bigTitles[1].style.marginTop = `0vh`;
          this.bigTitles[2].style.marginTop = `0vh`;
          // we reset our horizontal section parent to its starting point
          this.horizontalScrollSectContainer.style.transform = `translateX(0vw)`;
          this.firstImage.style.transform = `translateX(0vw)`;
          break;
        case "SECTION_1 SECTION_1":
          // we are actively scrolling in our first section, staying stationary of course
          // we update will change settings to prep for the horizontal scrolling
          this.horizontalScrollSectContainer.style.willChange = "auto";
          break;
        case "undefined SECTION_1":
          // console.log("case is undefined SECTION_1: I refreshed the page partway down the page, before our section begins.");
          // I have refreshed the page and am in the first section
          // we activate our text elements
          this.bigTexts[0].classList.add("active");
          this.mediumBigTexts[0].classList.add("active");
          this.productDescs[0].classList.add("active");
          for(let i = 0; i<= 2; i++) {
            setTimeout(() => this.dropdownHeaders[i].classList.add("active"), i * 100);
          };
          // we set our other big titles to be at 0vh so when scrolling ahead they are in the correct position
          this.bigTitles[1].style.marginTop = `0vh`;
          this.bigTitles[2].style.marginTop = `0vh`;
          // we reset our horizontal section parent to its starting point
          this.horizontalScrollSectContainer.style.transform = `translateX(0vw)`;
          this.firstImage.style.transform = `translateX(0vw)`;
          break;
        case "SECTION_1 SECTION_1":
          // we essentially do nothing here but update our state
          // this.horizontalScrollSectContainer.style.willChange = "transform";
          // this.firstImage.style.willChange = "transform";
          this.lastActiveState = state;
          return;
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
          // do that here
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
          // do that here
          break;
        case "undefined SECTION_2":
          console.log("case is undefined SECTION_2: I have loaded the page and am sitting in the second section.");
          // we set our transform to its static position
          this.horizontalScrollSectContainer.style.transform = `translateX(-100vw)`;
          this.firstImage.style.transform = `translateX(0vw)`;
          // we activate certain text and dropdown elements
          // do that here
          break;
        case "SECTION_2 SECTION_2":
          // we essentially do nothing here but update our state
          // console.log("case is SECTION_2 SECTION_2: I am scrolling in our section section.");
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
          // do that here
          break;
        case "undefined SCROLL_RANGE_2":
          // console.log("case is undefined SCROLL_RANGE_2: I have loaded the page and am sitting in the scrollable portion of the section section.");
          // we set our transform to its static position
          t = clamp01((scrollY - this.scrollStart2) / this.viewportHeight);
          this.slideProgress = mapRange(t, 0, 1, 100, 200);
          this.horizontalScrollSectContainer.style.transform = `translateX(-${this.slideProgress}vw)`;
          // we activate certain text and dropdown elements
          // do that here
          break;
        case "SECTION_2 SCROLL_RANGE_2":
          // console.log("case is SECTION_2 SCROLL_RANGE_2: I have scrolled from our second section and am heading towards the third.");
          // we set our transform to its static position
          t = clamp01((scrollY - this.scrollStart2) / this.viewportHeight);
          this.slideProgress = mapRange(t, 0, 1, 100, 200);
          this.horizontalScrollSectContainer.style.transform = `translateX(-${this.slideProgress}vw)`;
          // we activate certain text and dropdown elements
          // do that here
          break;
        case "SCROLL_RANGE_2 SCROLL_RANGE_2":
          // otherwise we update our scroll position in real time
          // console.log("case is SCROLL_RANGE_2 SCROLL_RANGE_2: I have scrolled from our second section and am heading towards the third.");
          t = clamp01((scrollY - this.scrollStart2) / this.viewportHeight);
          this.slideProgress = mapRange(t, 0, 1, 100, 200);
          this.horizontalScrollSectContainer.style.transform = `translateX(-${this.slideProgress}vw)`;
          // we activate certain text and dropdown elements
          // do that here
          break;
        case "SCROLL_RANGE_2 SECTION_2":
          // console.log("case is SCROLL_RANGE_2 SECTION_2: I have backtracked from our second scrollable section and have reentered section one again.");
          // we set our transform to its static position
          this.horizontalScrollSectContainer.style.transform = `translateX(-100vw)`;
          // we activate certain text and dropdown elements
          // do that here
          break;
        case "undefined SECTION_3":
          // console.log("case is undefined SECTION_3: I have loaded the page and am sitting section three aka our second scroll gap.");
          // we set our transform to its static position
          this.horizontalScrollSectContainer.style.transform = `translateX(-200vw)`;
          // we activate certain text and dropdown elements
          // do that here
          break;
        case "SCROLL_RANGE_2 SECTION_3":
          // console.log("case is SCROLL_RANGE_2 SECTION_3: I have entered the third section.");
          // we set our transform to its static position
          this.horizontalScrollSectContainer.style.transform = `translateX(-200vw)`;
          // we activate certain text and dropdown elements
          // do that here
          break;
        case "SECTION_3 SCROLL_RANGE_2":
          // console.log("case is SECTION_3 SCROLL_RANGE_2: I have scrolled back towards section two, and entered scroll range 2.");
          // we set our transform to its static position
          t = clamp01((scrollY - this.scrollStart2) / this.viewportHeight);
          this.slideProgress = mapRange(t, 0, 1, 100, 200);
          this.horizontalScrollSectContainer.style.transform = `translateX(-${this.slideProgress}vw)`;
          // we activate certain text and dropdown elements
          // do that here
          break;
        case "SECTION_3 SECTION_3":
          // we essentially do nothing here, and exit our case switch and subsequently update, just updating our current state
          // console.log("case is SECTION_3 SECTION_3: I have entered the third section.");
          this.horizontalScrollSectContainer.style.willChange = "transform";
          this.firstImage.style.willChange = "transform";
          this.lastActiveState = state;
          return;
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
          // do that here
          break;
        case "AFTER_SCROLL AFTER_SCROLL":
          // we essentially do nothing here but update our state
          // console.log("case is AFTER_SCROLL AFTER_SCROLL: I am no longer scrolling in our horizontal scroll section, I am past it.");
          this.horizontalScrollSectContainer.style.willChange = "auto";
          this.firstImage.style.willChange = "auto";
          this.lastActiveState = state;
          return;
        case "undefined AFTER_SCROLL":
          // console.log("case is undefined AFTER_SCROLL: I have loaded the page and am past our horizontal scroll section.");
          // we set our transform to its static position
          this.horizontalScrollSectContainer.style.transform = `translateX(-200vw)`;
          // we activate certain text and dropdown elements
          // do that here
          break;
      }
      //update scroll position
      this.previousScrollY = scrollY;
      // once we've ran the state logic we update our previous state to our current and exit the function
      this.lastActiveState = state;

      return;

      switch (state) {
          case "SECTION_1":
            this.horizontalScrollSectContainer.style.transform = `translateX(0vw)`;
            this.firstImage.style.transform = `translateX(0vw)`;
            break;
          case "SCROLL_RANGE_1":
            t = clamp01((scrollY - this.scrollStart1) / this.viewportHeight);
            this.slideProgress = mapRange(t, 0, 1, 0, 100);
            this.horizontalScrollSectContainer.style.transform = `translateX(-${this.slideProgress}vw)`;
            this.firstImage.style.transform = `translateX(-${this.slideProgress}vw)`;
            console.log("I should be horizontally scrolling to section two");
            break;
          case "SECTION_2":
            this.horizontalScrollSectContainer.style.transform = `translateX(-100vw)`;
            break;
         case "SCROLL_RANGE_2":
            t = clamp01((scrollY - this.scrollStart2) / this.viewportHeight);
            this.slideProgress = mapRange(t, 0, 1, 100, 200);
            this.horizontalScrollSectContainer.style.transform = `translateX(-${this.slideProgress}vw)`;
            console.log("I should be horizontally scrolling to section three")
            break;
          case "SECTION_3":
            this.horizontalScrollSectContainer.style.transform = `translateX(-200vw)`;
            break;
          case "AFTER_SCROLL":
            // if we refresh the page and measure in our after scroll, we still need to apply a transform to the horizontal scroll section
            this.horizontalScrollSectContainer.style.transform = `translateX(-200vw)`;
            console.log("I am scrolling out of the horizontal scroll section");
            break;
        }
        this.lastActiveState = state;
    }

    doWork(getState(scrollY), scrollY); // gets our current state and applies changes


    // declarative section activation
    // let activeIndex: number | null = null;

    // returns which section we are in at runtime
    // this.sectionRanges.forEach(([start, end], index) => {
    //   if (scrollY >= start && scrollY < end)
    //     newActiveIndex = index;
    //   });

    // if(newActiveIndex !== null) {
    //   console.log(newActiveIndex, this.activeSectionIndex)

    //   // we refreshed the page and have no previously store state for what section index we are in
    //   if(newActiveIndex && this.activeSectionIndex === null) {
    //     console.log(newActiveIndex, this.activeSectionIndex);
    //     this.activeSectionIndex = newActiveIndex;
    //     // this._activate(newActiveIndex);
    //   }

    //   // scrolling back up the page
    //   if(newActiveIndex < this.activeSectionIndex) {
    //       console.log("i am scrolling backwards / up the page, so I should do nothing!")
    //       this.activeSectionIndex = newActiveIndex;
    //       this._activate(newActiveIndex);
    //   }

    //   // scrolling down the page
    //   if(newActiveIndex > this.activeSectionIndex) {
    //       console.log("i am scrolling forward / down the page and should animate our eyebrow, desc and dropdown in, and remove our big title");
    //       this.activeSectionIndex = newActiveIndex;
    //       this._activate(newActiveIndex);
    //   }
    // }


      // if (this.beforeScroll) {
      //     this.horizontalScrollSectContainer.style.transform = `translateX(0vw)`;
      //     this.firstImage.style.transform = `translateX(0vw)`;
      //   } 
        
      // if (this.scrollRange1) {
      //     const t = clamp01((scrollY - this.scrollStart1) / this.viewportHeight);
      //     this.slideProgress = mapRange(t, 0, 1, 0, 100);
      //     this.horizontalScrollSectContainer.style.transform = `translateX(-${this.slideProgress}vw)`;
      //     this.firstImage.style.transform = `translateX(-${this.slideProgress}vw)`;
      //     console.log("I should be horizontally scrolling to section two")
      //   }
        
      // if (this.scrollGap1) {
      //     this.horizontalScrollSectContainer.style.transform = `translateX(-100vw)`;
      //   }
      
      // if(this.scrollRange2) {
      //     const t = clamp01((scrollY - this.scrollStart2) / this.viewportHeight);
      //     this.slideProgress = mapRange(t, 0, 1, 100, 200);
      //     this.horizontalScrollSectContainer.style.transform = `translateX(-${this.slideProgress}vw)`;
      //     console.log("I should be horizontally scrolling to section three")
      //   }
        
      // if (this.scrollGap2) {
      //     this.horizontalScrollSectContainer.style.transform = `translateX(-200vw)`;
      //   }

      // if (this.scrollEnd) {
      //     console.log("I am scrolling out of the horizontal scroll section");
      //     return;
      //   }
      } // ends update function

    // we add one to the index for these since we start activating things starting in our second section
    private _activate(i: number): void {
      this.bigTexts[i].classList.add("active"); // this is confusing because adding the active class actually hides the text
      this.mediumBigTexts[i].classList.add("active"); // with these adding active reveals it
      this.productDescs[i].classList.add("active");
    }

    private _deactivate(i: number): void {
      this.bigTexts[i].classList.remove("active");
      this.mediumBigTexts[i].classList.remove("active");
      this.productDescs[i].classList.remove("active");
    }
}