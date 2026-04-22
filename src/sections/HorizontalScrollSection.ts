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

    // All images that participate in the overlap animation
    this.endingImage = document.querySelector("#scale-down-img-after");

    this.progressBar = document.querySelector<HTMLElement>(".progress-container")!;

    // this is actually the parent container of big-text
    this.bigTitles = document.querySelectorAll(".product-title-big");

    // for our fist section, index 0, second 1, third 2
    this.bigTexts = document.querySelectorAll(".big-text");
    this.mediumBigTexts = document.querySelectorAll(".medium-big-text");
    this.productDescs = document.querySelectorAll(".product-desc");

    // for our first section, this is index 0-2, second 3-5, third 6-8
    this.dropdownHeaders = document.querySelectorAll(".dropdown-header-container");

    // this.bigText = document.querySelectorAll(".big-text");

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

    this.sections = []

    // build our start and stop values dynamically and updates when new sections are added. The height of the parent will have to increase as well 300vh for each new section to allow 100vh for scrolling over and 200 for scrolling inside
    for(let i = 2; i <= 2 + (this.scrollSections.length * 3); i+= 3) {
       let scrollRange = { start: this.start + this.viewportHeight * i, end: this.start + this.viewportHeight * ((i + 2) - 1) };
       let scrollGap = { start: scrollRange.end, end: scrollRange.end + i };
      //  if we are on our last section, remove the last scrollGap object, otherwise push both range and gap
       if(i = (this.scrollSections.length * 3) - 1) {
        this.sections.push([scrollRange]);
       } else {
        this.sections.push([scrollRange, scrollGap]);
       }
    };

    console.log(this.sections);

    this.scrollStart1 = this.start + this.viewportHeight * 2;
    this.scrollEnd1 = this.start + (this.viewportHeight * 3);
    this.scrollGap1Start = this.start + (this.viewportHeight * 3);
    this.scrollGap1End = this.start + (this.viewportHeight * 5)
    this.scrollStart2 = this.start + (this.viewportHeight * 5);
    this.scrollEnd2 = this.start + (this.viewportHeight * 6);
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

    type ScrollState = "BEFORE_SCROLL" | "SCROLL_RANGE_1" | "SCROLL_GAP_1" | "SCROLL_RANGE_2" | "SCROLL_GAP_2" | "AFTER_SCROLL";

    const getState = (scrollY: number): ScrollState => {
      let state: ScrollState;
      if(scrollY <= this.scrollStart1) {
        state = "BEFORE_SCROLL";  // we are scrolling before we enter our horizontal scroll section
      } else if (scrollY <= this.scrollEnd1) {
        state = "SCROLL_RANGE_1"; // scrolling from section one to section two
      } else if (scrollY <= this.scrollStart2) {
        state = "SCROLL_GAP_1"; // we are sitting in second section
      } else if (scrollY <= this.scrollEnd2) {
        state = "SCROLL_RANGE_2"; // scrolling from section two to three
      } else if (scrollY <= this.scrollStart3) {
        state = "SCROLL_GAP_2"; // we are sitting in the third section
      } else {state = "AFTER_SCROLL"; // we are scrolling down out of the horizontal scroll section
      } 
      return state;
    };

    const doWork = (state: ScrollState, scrollY: number): void => {
      let t: number;
      console.log(state, this.lastActiveState);
      switch (state) {
          case "BEFORE_SCROLL":
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
          case "SCROLL_GAP_1":
            this.horizontalScrollSectContainer.style.transform = `translateX(-100vw)`;
            break;
         case "SCROLL_RANGE_2":
            t = clamp01((scrollY - this.scrollStart2) / this.viewportHeight);
            this.slideProgress = mapRange(t, 0, 1, 100, 200);
            this.horizontalScrollSectContainer.style.transform = `translateX(-${this.slideProgress}vw)`;
            console.log("I should be horizontally scrolling to section three")
            break;
          case "SCROLL_GAP_2":
            this.horizontalScrollSectContainer.style.transform = `translateX(-200vw)`;
            break;
          case "AFTER_SCROLL":
            console.log("I am scrolling out of the horizontal scroll section");
            break;
        }
        this.lastActiveState = state;
    }

    doWork(getState(scrollY), scrollY); // gets our current state and applies changes


    // // declarative section activation
    // let activeIndex: number | null = null;

    // // returns which section we are in at runtime
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