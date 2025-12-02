// src/engine/ScrollEngine.js
export default class ScrollEngine {
  constructor({ smooth } = {}) {
    this.smooth = smooth || null; // instance of SmoothScroll (optional)
    this.sections = [];

    this._raf = this._raf.bind(this);
    this._onResize = this._onResize.bind(this);

    window.addEventListener("resize", this._onResize, { passive: true });
  }

  register(section) {
    // expects object following ScrollSection API
    if (typeof section.measure !== "function" || typeof section.update !== "function") {
      throw new Error("Section must implement measure() and update(scrollY)");
    }
    this.sections.push(section);
  }

  // measure all sections (call after DOM ready & on resize)
  measureAll() {
    this.sections.forEach(s => s.measure());
  }

  start() {
    // initial measure
    this.measureAll();

    // start loop
    this._raf();
  }

  stop() {
    cancelAnimationFrame(this._rafId);
  }

  _onResize() {
    this.measureAll();
  }

  _raf() {
    const smoothY = this.smooth ? this.smooth.update() : window.scrollY || 0;

    // update sections with smoothed value
    for (const s of this.sections) {
      s.update(smoothY);
    }

    this._rafId = requestAnimationFrame(this._raf);
  }
}
