// src/engine/BaseSection.js
export default class BaseSection {
  constructor({ el }) {
    if (!el) throw new Error("BaseSection requires { el }");

    // Accept selector or element
    this.el = typeof el === "string" ? document.querySelector(el) : el;

    // Enable/disable flag
    this.enabled = true;

    if (!this.el) {
      console.warn("⚠️ BaseSection: element not found:", el);
      this.enabled = false;
      return;
    }

    // Standard scroll bounds
    this.start = 0;
    this.end = 0;
    this.length = 0;
  }

  measure() {
    // Override in subclass
  }

  update(scrollY) {
    // Override in subclass
  }
}
