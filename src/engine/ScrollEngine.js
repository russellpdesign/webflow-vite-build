export default class ScrollEngine {
  static rawY = 0;
  static smoothedY = 0;
  static velocity = 0;
  static smoothingEnabled = false;

  constructor({ smooth = null } = {}) {
    this.sections = [];
    this.smooth = smooth;
    ScrollEngine.smoothingEnabled = !!smooth;

    this._running = false;

    // Init for velocity & prediction
    this.lastRawY = window.scrollY;
    this.lastTimestamp = performance.now();

    this._onResize = this._onResize.bind(this);
    this._raf = this._raf.bind(this);
  }

  register(section) {
    this.sections.push(section);
  }

  measureAll() {
    for (const s of this.sections) {
      if (s.enabled !== false) s.measure();
    }
  }

  _onResize() {
    this.measureAll();
  }

  start() {
    if (this._running) return;
    this._running = true;

    this.measureAll();
    window.addEventListener("resize", this._onResize);

    ScrollEngine.rawY = window.scrollY;
    ScrollEngine.smoothedY = ScrollEngine.rawY;
    ScrollEngine.velocity = 0;

    requestAnimationFrame(this._raf);
  }

  stop() {
    this._running = false;
    window.removeEventListener("resize", this._onResize);
  }

  _raf(timestamp) {
    if (!this._running) return;

    // Ensure timestamp is valid
    if (!Number.isFinite(timestamp)) {
      timestamp = performance.now();
    }

    // RAW SCROLL
    const rawY = window.scrollY;
    ScrollEngine.rawY = rawY;

    // SMOOTHED SCROLL
    const currentY = this.smooth ? this.smooth.update() : rawY;
    ScrollEngine.smoothedY = currentY;

    // VELOCITY (px/ms)
    let dt = timestamp - this.lastTimestamp;
    if (!Number.isFinite(dt) || dt <= 0) dt = 16.7;

    const dy = rawY - this.lastRawY;
    const velocity = dy / dt;

    ScrollEngine.velocity = velocity;

    this.lastRawY = rawY;
    this.lastTimestamp = timestamp;

    // UPDATE SECTIONS
    for (const section of this.sections) {
      if (section.enabled !== false) {
        section.update(currentY);
      }
    }

    requestAnimationFrame(this._raf);
  }
}
