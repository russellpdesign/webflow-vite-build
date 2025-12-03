// src/engine/ScrollEngine.js
export default class ScrollEngine {
  constructor({ smooth } = {}) {
    this.smooth = smooth || null;
    this.sections = [];

    this._raf = this._raf.bind(this);
    this._onResize = this._onResize.bind(this);

    window.addEventListener("resize", this._onResize, { passive: true });
  }

  register(section) {
    this.sections.push(section);
  }

  start() {
    if (!this.enabled) return;
    // measure everything first
    this.sections.forEach(sec => sec.measure());

    // start RAF loop
    requestAnimationFrame(this._raf);
  }

  _onResize() {
    this.sections.forEach(sec => sec.measure());
  }

  _raf() {
    const scrollY = this.smooth ? this.smooth.update() : window.scrollY;

    // always update each enabled section — no conditions
    for (const sec of this.sections) {
      if (sec.enabled) {
        sec.update(scrollY);
      }
    }

    requestAnimationFrame(this._raf);
  }
}
