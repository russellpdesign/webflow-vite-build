// src/engine/ScrollSection.js
export default class BaseSection {
  constructor({ el }) {
    // accept selector string or actual element
    if (!el) throw new Error("BaseSection requires { el }");
    this.el = typeof el === "string" ? document.querySelector(el) : el;
    if (!this.el) throw new Error("BaseSection: element not found: " + el);

    // public layout vars
    this.start = 0;
    this.end = 0;
    this.length = 0;

    // call measure when created is optional (usually done by engine)
  }

  // override: compute start/end/length/etc
  measure() {}

  // override: perform per-frame updates; receives smoothed scrollY
  update(scrollY) {}
}
