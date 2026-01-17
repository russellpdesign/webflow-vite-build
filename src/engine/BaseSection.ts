// src/engine/BaseSection.js
export interface BaseSectionOptions {
  el: string | HTMLElement;
}

export default class BaseSection {
  constructor({ el }) {
    if (!el) throw new Error("BaseSection requires { el }");

    // Accept selector or element
    this.el = typeof el === "string" ? document.querySelector(el) : el;

    if (!this.el) {
      console.warn("⚠️ BaseSection: element not found:", el);
      this.enabled = false;
      return;
    }

    // Standard scroll bounds
    this.start = 0;
    this.end = 0;
    this.length = 0;

    // // Enable/disable flag, can set on all animations here, generally set on a specific module to help troubleshoot and isolate issues
    this.enabled = true;
  }

  measure() {
    // Override in subclass
  }

  update(scrollY) {
    // Override in subclass
  }
}
