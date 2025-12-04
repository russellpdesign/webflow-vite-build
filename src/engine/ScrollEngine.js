import { clamp01 } from "@utils";

export default class ScrollEngine {
  static lastY = 0;          // last frame's scrollY (smoothed or raw)
  static velocity = 0;       // px per frame
  static predictedY = 0;     // predicted scroll position based on velocity
  static smoothingEnabled = false;

  constructor({ smooth = null } = {}) {
    this.sections = [];

    this.smooth = smooth;  // optional SmoothScroll instance
    ScrollEngine.smoothingEnabled = !!smooth;

    this._running = false;

    this._onResize = this._onResize.bind(this);
    this._raf = this._raf.bind(this);
  }

  /* -------------------------------------------------------------
   * REGISTRATION
   * ------------------------------------------------------------- */
  register(section) {
    this.sections.push(section);
  }

  /* -------------------------------------------------------------
   * RESIZE HANDLING
   * ------------------------------------------------------------- */
  measureAll() {
    for (const s of this.sections) {
      if (s.enabled !== false) {
        s.measure();
      }
    }
  }

  _onResize() {
    this.measureAll();
  }

  /* -------------------------------------------------------------
   * START ENGINE
   * ------------------------------------------------------------- */
  start() {
    if (this._running) return;

    this._running = true;

    this.measureAll();

    window.addEventListener("resize", this._onResize);

    ScrollEngine.lastY = window.scrollY;
    ScrollEngine.predictedY = ScrollEngine.lastY;

    requestAnimationFrame(this._raf);
  }

  /* -------------------------------------------------------------
   * RAF LOOP
   * ------------------------------------------------------------- */
_raf = (timestamp) => {
  if (!this._running) return;

  // -------------------------------
  // 1. RAW SCROLL INPUT
  // -------------------------------
  const rawY = window.scrollY;
  ScrollEngine.rawY = rawY;

  // -------------------------------
  // 2. SMOOTHING (if enabled)
  // -------------------------------
  const currentY = this.smooth ? this.smooth.update() : rawY;
  ScrollEngine.smoothedY = currentY;

  // -------------------------------
  // 3. VELOCITY (px per ms)
  // -------------------------------
  const dt = timestamp - this.lastTimestamp || 16.7;
  const dy = rawY - this.lastRawY;

  const velocity = dy / dt;   // GSAP-style px/ms velocity
  ScrollEngine.velocity = velocity;

  this.lastRawY = rawY;
  this.lastTimestamp = timestamp;

  // -------------------------------
  // 4. PREDICTED POSITION (anticipate)
  // -------------------------------
  // Predict ~1 frame ahead (~16ms)
  const anticipateFactor = 16.7;
  ScrollEngine.predictedY = rawY + velocity * anticipateFactor;

  // -------------------------------
  // 5. UPDATE ALL SECTIONS
  // -------------------------------
  for (const section of this.sections) {
    if (section.enabled !== false) {
      section.update(currentY);  // pass smoothed scrollY
    }
  }

  // -------------------------------
  // 6. NEXT FRAME
  // -------------------------------
  requestAnimationFrame(this._raf);
};

  /* -------------------------------------------------------------
   * STOP ENGINE
   * ------------------------------------------------------------- */
  stop() {
    this._running = false;
    window.removeEventListener("resize", this._onResize);
  }
}
