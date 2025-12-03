// src/sections/HomeScrollSection.js
import BaseSection from "../engine/BaseSection.js";

export default class HomeScrollSection extends BaseSection {
  constructor({ el }) {
    super({ el });

    // DOM caches
    this.triggers = document.querySelectorAll(".overview_trigger");

    this.sectionHeader = document.querySelector(".section-header-text");
    this.titleItems = document.querySelectorAll(".home-scroll-title");
    this.textItems = document.querySelectorAll(".body-text.home-scroll");
    this.numberItems = document.querySelectorAll(".home-scroll-item-number");
    this.imgItems = document.querySelectorAll(".home-scroll-img-item");
    this.progressBar = document.querySelector(".vertical-progress-bar-inside");
    this.scrollbar = document.querySelector(".vertical-progress-bar");

    window.addEventListener("resize", () => this.measure());
  }

  measure() {
    // absolute top of section (regardless of sticky layout)
    const rect = this.el.getBoundingClientRect();
    const absoluteTop = rect.top - document.documentElement.getBoundingClientRect().top;

    // animation length determined by triggers
    const triggerHeight = this.triggers[0]?.getBoundingClientRect().height || 0;
    const triggerCount  = this.triggers.length;

    this.length = triggerHeight * triggerCount;

    this.start = absoluteTop;
    this.end   = this.start + this.length;

    console.log(`start: ${this.start} end: ${this.end}`)

    // secondary breakpoints
    this.secondStart = this.start + window.innerHeight;
    this.thirdStart  = this.start + window.innerHeight * 2;

    console.log("📏 HomeScrollSection measured:", {
      start: this.start,
      secondStart: this.secondStart,
      thirdStart: this.thirdStart,
      end: this.end,
      length: this.length
    });
  }

  update(scrollY) {
    const pos = scrollY;
    const yPercent = (((pos - this.start) / (this.end - this.start)) * 100) * 2;
    console.log(`yPercent: ${yPercent}`);

    // BEFORE START
    if (pos < this.start) {
      this._deactivateAll();
      this.progressBar.style.transform = "translate3d(0, 0%, 0)";
      return;
    }

    if (pos >= this.start && pos <= this.end ) {
      this.progressBar.style.transform = `translate3d(0, ${yPercent}%, 0)`
      this.scrollbar.classList.remove("is-gone");
      this.sectionHeader.classList.add("is-active");
    }

    // SECTION 1
    if (pos >= this.start && pos < this.secondStart) {
      this._activate(0);
      this._deactivate(1);
      return;
    }

    // SECTION 2
    if (pos >= this.secondStart && pos < this.thirdStart) {
      this._deactivate(0);
      this._activate(1);
      this._deactivate(2);
      return;
    }

    // SECTION 3
    if (pos >= this.thirdStart && pos < this.end) {
      this._activate(2);
      this._deactivate(1);
      return;
    }

    // AFTER END
    if (pos >= this.end) {
      this.sectionHeader.classList.remove("is-active");
      this.titleItems[2].classList.remove("is-active");
      this.textItems[2].classList.remove("is-active");
      this.numberItems[2].classList.remove("is-active");
      this.scrollbar.classList.add("is-gone");
      this.imgItems[2].classList.add("is-active");
      this.progressBar.style.transform = "translate3d(0, 200%, 0)";
      return;
    }
  }

  _activate(i) {
    this.titleItems[i]?.classList.add("is-active");
    this.textItems[i]?.classList.add("is-active");
    this.numberItems[i]?.classList.add("is-active");
    this.imgItems[i]?.classList.add("is-active");
  }

  _deactivate(i) {
    this.titleItems[i]?.classList.remove("is-active");
    this.textItems[i]?.classList.remove("is-active");
    this.numberItems[i]?.classList.remove("is-active");
    this.imgItems[i]?.classList.remove("is-active");
  }

  _deactivateAll() {
    this.titleItems.forEach(el => el.classList.remove("is-active"));
    this.textItems.forEach(el => el.classList.remove("is-active"));
    this.numberItems.forEach(el => el.classList.remove("is-active"));
    this.imgItems.forEach(el => el.classList.remove("is-active"));
    this.sectionHeader.classList.remove("is-active");
  }
}
