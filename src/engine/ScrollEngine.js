import { clamp01 } from "@utils";

export default class ScrollEngine {
  // ---- STATIC GLOBALS read by sections ----
  static rawY = 0;
  static smoothedY = 0;
  static velocity = 0;      
  static predictedY = 0;    
  static smoothingEnabled = false;

  constructor({ smooth = null } = {}) {
    this.sections = [];

    this.smooth = smooth;
    ScrollEngine.smoothingEnabled = !!smooth;

    this._running = false;

    // initialize for velocity calculation
    this.lastRawY = window.scrollY;
    this.lastTimestamp = performance.now();

    // bind
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

    // initialize static globals
    ScrollEngine.rawY = window.scrollY;
    ScrollEngine.smoothedY = ScrollEngine.rawY;
    ScrollEngine.velocity = 0;
    ScrollEngine.predictedY = ScrollEngine.rawY;

    requestAnimationFrame(this._raf);
  }

  stop() {
    this._running = false;
    window.removeEventListener("resize", this._onResize);
  }

  // ---- MAIN RAF LOOP ----
  _raf(timestamp) {
    if (!this._running) return;

    // 1) RAW SCROLL
    const rawY = window.scrollY;
    ScrollEngine.rawY = rawY;

    // 2) SMOOTHED SCROLL
    const currentY = this.smooth ? this.smooth.update() : rawY;
    ScrollEngine.smoothedY = currentY;

    // 3) VELOCITY (px/ms)
    const dt = timestamp - this.lastTimestamp || 16.7;
    const dy = rawY - this.lastRawY;

    const velocity = dy / dt;
    ScrollEngine.velocity = velocity;

    this.lastRawY = rawY;
    this.lastTimestamp = timestamp;

    // 4) PREDICT FORWARD ONE FRAME (~16ms)
    const anticipateFactor = 16.7;
    ScrollEngine.predictedY = rawY + velocity * anticipateFactor;

    // 5) UPDATE SECTIONS
    for (const section of this.sections) {
      if (section.enabled !== false) {
        section.update(currentY);
      }
    }

    // 6) NEXT FRAME
    requestAnimationFrame(this._raf);
  }
}
