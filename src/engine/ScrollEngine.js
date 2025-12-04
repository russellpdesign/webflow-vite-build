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
  _raf() {
    if (!this._running) return;

    // Raw scroll input
    const rawY = window.scrollY;

    // Smooth or raw scroll
    const currentY = this.smooth ? this.smooth.update() : rawY;

    // Compute velocity (difference per frame)
    ScrollEngine.velocity = currentY - ScrollEngine.lastY;

    // GSAP-like anticipate prediction (small multiplier)
    ScrollEngine.predictedY = currentY + ScrollEngine.velocity * 5;

    // Update lastY AFTER computing velocity
    ScrollEngine.lastY = currentY;

    // Update all sections
    for (const section of this.sections) {
      if (section.enabled !== false) {
        section.update(currentY); // pass smoothed scrollY
      }
    }

    requestAnimationFrame(this._raf);
  }

  /* -------------------------------------------------------------
   * STOP ENGINE
   * ------------------------------------------------------------- */
  stop() {
    this._running = false;
    window.removeEventListener("resize", this._onResize);
  }
}
