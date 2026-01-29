interface BaseSectionOptions {
  
}

type Element = string | HTMLElement | null;

export default class BaseSection {

  constructor({ el: Element }) {
    if (!el) throw new Error("BaseSection requires { el }");

    // Accept selector or element, ternary operator says if it's a string, use it in a query selector, otherwise,  use it as is, as its already an HTMLElement / DOM Object value
    this.el = typeof el === "string" ? document.querySelector(el) : el;

    if (!this.el) {
      // Soft fail: disable this section so it doesn't run
      console.warn(`BaseSection: element not found. Module: ${this.constructor.name}, el: ${el}`);
      this.enabled = false;
      return;
    }

  }

  measure(): void {
    // Override in subclass
  }

  update(scrollY: number): void {
    // Override in subclass
  }
}
