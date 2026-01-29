import { ElementConfig } from "./types"

export default class BaseSection {
  el!: HTMLElement;
  enabled!: boolean;

  start!: number;
  end!: number;
  length!: number;

  constructor( { el }: ElementConfig ) {

    if (!el) {
      throw new Error("BaseSection requires { el }")
    }

    const resolvedEl = typeof el === "string" ? document.querySelector<HTMLElement>(el): el;

    if (!resolvedEl) {
      console.warn("⚠️ BaseSection: element not found:", el);
      this.enabled = false;
      return;
    }

    // Accept selector or element
    this.el = resolvedEl;

    // // Enable/disable flag, can set on all animations here, generally set on a specific module to help troubleshoot and isolate issues
    this.enabled = true;
  }

  measure(): void {
    // Override in subclass
    // Standard scroll bounds
    this.start = 0;
    this.end = 0;
    this.length = 0;
  }

  update(scrollY: number): void {
    // Override in subclass
  }
}
