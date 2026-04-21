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
  private activeSectionIndex: number | null = null;

  constructor({ el }: HorizontalScrollSection ) {
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

    this.sectionRanges = [
      // [0, this.scrollStart1],        // scrolling into view
      // [this.scrollStart1, this.scrollEnd1], // horizontal scrolling from section one to two
      [this.scrollEnd1, this.scrollStart2], // native scrolling while in section 2
      // [this.scrollStart2, this.scrollEnd2], // horizontal scrolling from section two to three
      [this.scrollEnd2, this.scrollStart3], // native scrolling while in section 3
    ];

  }

update(scrollY: number): void {
    if (!this.enabled) return;

    this.beforeScroll = scrollY <= this.scrollStart1; // scrolling into view
    this.scrollRange1 = scrollY >= this.scrollStart1 && scrollY <= this.scrollEnd1; // scrolling from section one to section two
    this.scrollGap1 = scrollY >= this.scrollEnd1 && scrollY <= this.scrollStart2; // we are sitting in second section
    this.scrollRange2 = scrollY >= this.scrollStart2 && scrollY <= this.scrollEnd2;
    this.scrollGap2 = scrollY >= this.scrollEnd2 && scrollY <= this.scrollStart3; // we are sitting in the third section

    // declarative section activation
    let newActiveIndex: number | null = null;

    this.sectionRanges.forEach(([start, end], index) => {
      if (scrollY >= start && scrollY < end)
        newActiveIndex = index;
      });

     if (newActiveIndex !== this.activeSectionIndex) {
        // deactivate previous section
        if (this.activeSectionIndex !== null) this._deactivate(this.activeSectionIndex);

        //activate new section
        if (newActiveIndex !== null) this._activate(newActiveIndex);

        this.activeSectionIndex = newActiveIndex;
      }

      if (this.beforeScroll) {
        this.horizontalScrollSectContainer.style.transform = `translateX(0vw)`;
        this.firstImage.style.transform = `translateX(0vw)`;
      } if (this.scrollRange1) {
        const t = clamp01((scrollY - this.scrollStart1) / this.viewportHeight);
        this.slideProgress = mapRange(t, 0, 1, 0, 100);
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
      }
    }

    private _activate(i: number): void {
      this.bigTexts[i+1].classList.remove("active");
      this.mediumBigTexts[+1].classList.add("active");
      this.productDescs[i+1].classList.add("active");
    }

    private _deactivate(i: number): void {
      this.bigTexts[i+1].classList.add("active");
      this.mediumBigTexts[i+1].classList.remove("active");
      this.productDescs[i+1].classList.remove("active");
    }
}