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

  _raf(timestamp) {
  if (!this._running) return;

  // LOG TIMESTAMP
  console.log("RAF timestamp:", timestamp);

  const rawY = window.scrollY;
  ScrollEngine.rawY = rawY;

  const currentY = this.smooth ? this.smooth.update() : rawY;
  ScrollEngine.smoothedY = currentY;

  const dt = timestamp - this.lastTimestamp || 16.7;
  const dy = rawY - this.lastRawY;

  const velocity = dt > 0 ? dy / dt : 0;
  ScrollEngine.velocity = velocity;

  this.lastRawY = rawY;
  this.lastTimestamp = timestamp;

  ScrollEngine.predictedY = rawY + velocity * 16.7;

  for (const section of this.sections) {
    if (section.enabled !== false) section.update(currentY);
  }

  requestAnimationFrame(this._raf);
  }
}