// src/sections/HomeScrollSection.js
import BaseSection from "../engine/BaseSection.ts";
import { clamp, clamp01, mapRange } from "../engine/utils";
import { Debug } from "../engine/Debug.js";

type HomeScrollConfig = {
  el: string | HTMLElement;
};

export default class HomeScrollSection extends BaseSection {
  // DOM collections
  triggers: NodeListOf<HTMLElement>;

  sectionHeader: HTMLElement | null;
  titleItems: NodeListOf<HTMLElement>;
  textItems: NodeListOf<HTMLElement>;
  numberItems: NodeListOf<HTMLElement>;
  imgItems: NodeListOf<HTMLElement>;

  progressBar: HTMLElement | null;
  scrollbar: HTMLElement | null;

  // scroll breakpoints
  secondStart!: number;
  thirdStart!: number;

  // each section start/end
  sectionRanges:[number, number][] = [];

  private sectionHeaderActive = false;
  private scrollbarVisible = false;
  private activeSectionIndex: number | null = null;

  constructor({ el }: HomeScrollConfig ) {
    super({ el });
    /* -------------------------------------------------------------
     * DOM ELEMENTS
     * ------------------------------------------------------------- */
    
    /* el = document.querySelector(".home-scroll-section.is-don"); */
    this.triggers = document.querySelectorAll<HTMLElement>(".overview_trigger");

    this.sectionHeader = document.querySelector<HTMLElement>(".section-header-text");
    this.titleItems = document.querySelectorAll<HTMLElement>(".home-scroll-title");
    this.textItems = document.querySelectorAll<HTMLElement>(".body-text.home-scroll");
    this.numberItems = document.querySelectorAll<HTMLElement>(".home-scroll-item-number");
    this.imgItems = document.querySelectorAll<HTMLElement>(".home-scroll-img-item");

    this.progressBar = document.querySelector<HTMLElement>(".vertical-progress-bar-inside");
    this.scrollbar = document.querySelector<HTMLElement>(".vertical-progress-bar");

    this.enabled = true;

    window.addEventListener("resize", () => this.measure());
  }

  measure(): void {
    if (!this.el) return;

    const rect = this.el.getBoundingClientRect();

    // absolute top
    const absoluteTop = rect.top + window.scrollY;

    const triggerHeight = this.triggers[0]?.getBoundingClientRect().height ?? 0;
    const triggerCount = this.triggers.length;

    this.length = triggerHeight * triggerCount;
    this.start = absoluteTop;
    this.end = this.start + this.length;

    // secondary text animation breakpoints
    this.secondStart = this.start + window.innerHeight;
    this.thirdStart  = this.start + window.innerHeight * 2;

    // define simple section ranges
    const viewport = window.innerHeight;
    this.sectionRanges = [
      [this.start, this.start + viewport],        // section 1
      [this.start + viewport, this.start + viewport * 2], // section 2
      [this.start + viewport * 2, this.end],      // section 3
    ];
  }

  update(scrollY: number): void {
    if(!this.enabled || !this.progressBar || !this.scrollbar || !this.sectionHeader) return;

    // compute progress for scrollbar
    const t = clamp01((scrollY - this.start) / (this.end - this.start));
    const yPercent = mapRange(t, 0, 1, 0, 200);
    this.progressBar.style.transform = `translate3d(0, ${yPercent}%, 0)`;
    
    // global header handling
    const shouldHeaderBeActive = scrollY >= this.start && scrollY <= this.end;

    if (shouldHeaderBeActive && !this.sectionHeaderActive) {
      this.sectionHeader.classList.add("is-active");
      this.sectionHeaderActive = true;
    } else if (!shouldHeaderBeActive && this.sectionHeaderActive) {
      this.sectionHeader.classList.remove("is-active");
      this.sectionHeaderActive = false;
    }

    // global scrollbar handling
    const shouldScrollBarBeVisible = scrollY >= this.start && scrollY <= this.end;

    if (shouldScrollBarBeVisible && !this.scrollbarVisible) {
      this.scrollbar.classList.remove(".is-gone");
      this.scrollbarVisible = true;
    } else if (!shouldScrollBarBeVisible && this.scrollbarVisible) {
      this.scrollbar.classList.add(".is-gone");
      this.scrollbarVisible = false;
    }

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

    // after last section, activate last img
    if (scrollY >= this.end) {
      this.imgItems[2]?.classList.add("is-active");
    }
  }

    private _activate(i: number): void {
    this.titleItems[i]?.classList.add("is-active");
    this.textItems[i]?.classList.add("is-active");
    this.numberItems[i]?.classList.add("is-active");
    this.imgItems[i]?.classList.add("is-active");
  }

  private _deactivate(i: number): void {
    this.titleItems[i]?.classList.remove("is-active");
    this.textItems[i]?.classList.remove("is-active");
    this.numberItems[i]?.classList.remove("is-active");
    this.imgItems[i]?.classList.remove("is-active");
  }

  private _deactivateAll(): void {
    this.titleItems.forEach(el => el.classList.remove("is-active"));
    this.textItems.forEach(el => el.classList.remove("is-active"));
    this.numberItems.forEach(el => el.classList.remove("is-active"));
    this.imgItems.forEach(el => el.classList.remove("is-active"));
    this.sectionHeader?.classList.remove("is-active");
  }
}

  //   if (scrollY < this.start) {
  //     this._deactivateAll();
  //     this.progressBar.style.transform = "translate3d(0, 0%, 0)";
  //     return;
  //   }

  //   // progress bar always animates inside range
  //   if (scrollY >= this.start && scrollY <= this.end) {
  //     // const yPercent = ((scrollY - this.start) / (this.end - this.start)) * 200;
  //     this.progressBar.style.transform = `translate3d(0, ${yPercent}%, 0)`;
  //     this.scrollbar.classList.remove("is-gone");
  //     this.sectionHeader.classList.add("is-active");
  //   }

  //   // SECTION 1
  //   if (scrollY >= this.start && scrollY < this.secondStart) {
  //     this._activate(0);
  //     this._deactivate(1);
  //     return;
  //   }

  //   // SECTION 2
  //   if (scrollY >= this.secondStart && scrollY < this.thirdStart) {
  //     this._deactivate(0);
  //     this._activate(1);
  //     this._deactivate(2);
  //     return;
  //   }

  //   // SECTION 3
  //   if (scrollY >= this.thirdStart && scrollY < this.end) {
  //     this._deactivate(1);
  //     this._activate(2);
  //     return;
  //   }

  //   // AFTER END
  //   if (scrollY >= this.end) {
  //     this.sectionHeader.classList.remove("is-active");
  //     this.titleItems[2].classList.remove("is-active");
  //     this.textItems[2].classList.remove("is-active");
  //     this.numberItems[2].classList.remove("is-active");
  //     this.scrollbar.classList.add("is-gone");
  //     this.imgItems[2].classList.add("is-active");
  //     this.progressBar.style.transform = "translate3d(0, 200%, 0)";
  //     return;
  //   }
  // }


