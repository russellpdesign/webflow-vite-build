// src/sections/HomeScrollSection.js
import BaseSection from "../engine/BaseSection.js";

export default class HomeScrollSection extends BaseSection {
  constructor({ el }) {
    super({ el });

    if (!this.enabled) return;

    // Cache DOM
    this.progressBarInside = document.querySelector(".vertical-progress-bar-inside");
    this.triggers = [...document.querySelectorAll(".overview_trigger")];

    this.titleItems = [...document.querySelectorAll(".home-scroll-title")];
    this.textItems = [...document.querySelectorAll(".body-text.home-scroll")];
    this.numberItems = [...document.querySelectorAll(".home-scroll-item-number")];
    this.imgItems = [...document.querySelectorAll(".home-scroll-img-item")];

    this.sectionHeader = document.querySelector(".section-header-text");
    this.scrollbar = document.querySelector(".vertical-progress-bar");

    window.addEventListener("resize", () => this.measure());
  }

  measure() {
    if (!this.enabled) return;

    // Important: using sticky-segment triggers as scroll-length
    const triggerHeight = this.triggers[0]?.getBoundingClientRect().height || 0;
    const count = this.triggers.length;

    this.length = triggerHeight * count;

    // The section begins at its absolute scrollY
    this.start = this.el.getBoundingClientRect().top + window.scrollY;

    // Phase markers
    this.secondStart = this.start + window.innerHeight;
    this.thirdStart  = this.start + window.innerHeight * 2;

    this.end = this.start + this.length;
    console.log(`start: ${this.start}, secondStart: ${this.secondStart}, thirdStart: ${this.thirdStart}`)
  }

  update(scrollY) {
    if (!this.enabled) return;

    const pos = scrollY;

    // Reset before start
    if (pos < this.start) {
      this._deactivateAll();
      return;
    }

    // FIRST GROUP
    if (pos >= this.start && pos <= this.secondStart) {
      this.sectionHeader.classList.add("is-active");
      this._activate(0);
      this._deactivate(1);
      return;
    }

    // SECOND GROUP
    if (pos >= this.secondStart && pos <= this.thirdStart) {
      this._deactivate(0);
      this._activate(1);
      this._deactivate(2);
      return;
    }

    // THIRD GROUP
    if (pos >= this.thirdStart && pos <= this.end) {
      this._deactivate(1);
      this._activate(2);
      this.sectionHeader.classList.add("is-active");
      this.scrollbar.classList.remove("is-gone");
      return;
    }

    // OUTSIDE END
    if (pos > this.end) {
      this._deactivate(2);
      this.sectionHeader.classList.remove("is-active");
      this.scrollbar.classList.add("is-gone");

      if (this.progressBarInside) {
        this.progressBarInside.style.transform = "translate3d(0, 200%, 0)";
      }
    }

    // PROGRESS BAR ALWAYS ON
    if (pos >= this.start && pos <= this.end && this.progressBarInside) {
      const prog = ((pos - this.start) / (this.end - this.start)) * 200;
      this.progressBarInside.style.transform = `translate3d(0, ${prog}%, 0)`;
    }
  }

  // Helpers
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
    this.sectionHeader?.classList.remove("is-active");
  }
}
