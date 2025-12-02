export default class ScrollEngine {
  constructor({ smooth } = {}) {
    this.smooth = smooth || null;
    this.sections = [];

    this._raf = this._raf.bind(this);
    this._onResize = this._onResize.bind(this);

    window.addEventListener("resize", this._onResize, { passive: true });
  }

  register(section) {
    if (typeof section.measure !== "function" ||
        typeof section.update !== "function") {
      throw new Error("Section must implement measure() and update(scrollY)");
    }

    this.sections.push(section);
  }

  measureAll() {
    this.sections.forEach(section => section.measure());
  }

  start() {
    this.measureAll();
    this._raf();
  }

  _onResize() {
    this.measureAll();
  }

  _raf() {
    const scrollY = this.smooth ? this.smooth.update() : window.scrollY;

    for (const section of this.sections) {
      section.update(scrollY);
    }

    requestAnimationFrame(this._raf);
  }
}
