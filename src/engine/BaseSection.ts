type ElementConfig = {
    el: string | HTMLElement;
}

export default class BaseSection {
  el!: HTMLElement;
  enabled!: boolean;

  start!: number;
  end!: number;
  length!: number;

  constructor( { el }: ElementConfig ) {

    // this checks to see if el was passed, if not throw an error
    if (!el) {
      throw new Error("BaseSection requires { el }")
    }

    // this checks to see if el actual converts to an existing HTMLElement, if it doesn't we stop this section from running by disabling the enable flag and exiting the global block
    const resolvedEl = typeof el === "string" ? document.querySelector<HTMLElement>(el): el;

    if (!resolvedEl) {
      console.warn("⚠️ BaseSection: element not found:", el);
      this.enabled = false;
      return;
    }

    // Once we validate DOM presence, we cache as this.el
    this.el = resolvedEl;

    // // Enable/disable flag, can set on all animations here, generally set on a specific module to help troubleshoot and isolate issues
    this.enabled = true;
  }

  measure(): void {
    // Override in subclass, initialzes as 0
    this.start = 0;
    this.end = 0;
    this.length = 0;
  }

  update(scrollY: number): void {
    // Override in subclass
  }
}
