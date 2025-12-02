import BaseSection from "../engine/BaseSection.js";

export default class HomeScrollSection extends BaseSection {

  constructor({ el }) {
    super({ el });

    // Cache DOM
    this.progressBarInside = document.querySelector(".vertical-progress-bar-inside");
    this.homeScrollSection = this.el;

    this.triggers = document.querySelectorAll(".overview_trigger");
    this.titleItems = document.querySelectorAll(".home-scroll-title");
    this.textItems = document.querySelectorAll(".body-text.home-scroll");
    this.numberItems = document.querySelectorAll(".home-scroll-item-number");
    this.imgItems = document.querySelectorAll(".home-scroll-img-item");
    this.sectionHeader = document.querySelector(".section-header-text");
    this.scrollbar = document.querySelector(".vertical-progress-bar");

    this.calculateBounds();
    window.addEventListener("resize", this.measure.bind(this));
  }

  measure() {
    const rect = this.homeScrollSection.getBoundingClientRect();
    const current = window.scrollY;

    const triggersHeight = this.triggers[0].getBoundingClientRect().height;
    const totalTriggers = this.triggers.length;
    const sectionLength = triggersHeight * totalTriggers;

    this.start = rect.top + current;
    this.secondStart = this.start + window.innerHeight;
    this.thirdStart  = this.start + window.innerHeight * 2;
    this.end = this.start + sectionLength;
  }

  update(scrollY) {
    const pos = scrollY;

    // ---------- INITIAL RESET ----------
    if (pos < this.start) {
      this.titleItems.forEach(el => el.classList.remove("is-active"));
      this.textItems.forEach(el => el.classList.remove("is-active"));
      this.numberItems.forEach(el => el.classList.remove("is-active"));
      this.imgItems.forEach(el => el.classList.remove("is-active"));
      this.sectionHeader.classList.remove("is-active");
      return;
    }

    // ---------- SECTION 1 ----------
    if (pos >= this.start && pos <= this.secondStart) {
      this.sectionHeader.classList.add("is-active");

      this.activateIndex(0);
      this.deactivateIndex(1);
      return;
    }

    // ---------- SECTION 2 ----------
    if (pos >= this.secondStart && pos <= this.thirdStart) {
      this.deactivateIndex(0);
      this.activateIndex(1);
      this.deactivateIndex(2);
      return;
    }

    // ---------- SECTION 3 ----------
    if (pos >= this.thirdStart && pos <= this.end) {
      this.deactivateIndex(1);
      this.activateIndex(2);
      this.sectionHeader.classList.add("is-active");
      this.scrollbar.classList.remove("is-gone");
      return;
    }

    // ---------- END OF SECTION ----------
    if (pos > this.end) {
      this.deactivateIndex(2);
      this.scrollbar.classList.add("is-gone");
      this.sectionHeader.classList.remove("is-active");
      this.progressBarInside.style.transform = "translate3d(0, 200%, 0)";
    }
  }

  activateIndex(index) {
    this.titleItems[index]?.classList.add("is-active");
    this.textItems[index]?.classList.add("is-active");
    this.numberItems[index]?.classList.add("is-active");
    this.imgItems[index]?.classList.add("is-active");
  }

  deactivateIndex(index) {
    this.titleItems[index]?.classList.remove("is-active");
    this.textItems[index]?.classList.remove("is-active");
    this.numberItems[index]?.classList.remove("is-active");
    this.imgItems[index]?.classList.remove("is-active");
  }
}
