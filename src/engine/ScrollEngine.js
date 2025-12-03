// src/engine/ScrollEngine.js
export default class ScrollEngine {
  constructor({ smooth } = {}) {
    this.smooth = smooth || null;
    this.sections = [];
    this.enabled = true;        // FIX #1 — MUST BE SET!

    this._raf = this._raf.bind(this);
    this._onResize = this._onResize.bind(this);

    window.addEventListener("resize", this._onResize, { passive: true });
  }

  register(section) {
    if (!section) return;
    this.sections.push(section);
  }

  measureAll() {
    this.sections.forEach(section => section.measure());
  }

  start() {
    if (!this.enabled) return;

    this.measureAll();

    requestAnimationFrame(this._raf); // Start RAF loop
  }

  _onResize() {
    this.sections.forEach(section => section.measure());
  }

  _raf() {
    const scrollY = this.smooth
      ? this.smooth.update()
      : window.scrollY;

    for (const section of this.sections) {
      if (section.enabled) {
        section.update(scrollY);
      }
    }

    requestAnimationFrame(this._raf);
  }
}
