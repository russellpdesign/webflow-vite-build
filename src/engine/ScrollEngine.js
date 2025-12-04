export default class ScrollEngine {
  constructor({ smooth = null } = {}) {
    this.smooth = smooth;             // optional smoothing module
    this.sections = [];
    this.frame = null;

    // Velocity tracking
    this.lastRawY = window.scrollY;
    this.lastTimestamp = performance.now();

    // Set initial static globals
    ScrollEngine.rawY = window.scrollY;
    ScrollEngine.smoothedY = window.scrollY;
    ScrollEngine.velocity = 0;
    ScrollEngine.predictedY = window.scrollY;

    // Bind resize handler
    window.addEventListener("resize", this._onResize);
  }

  /* ---------------------------------------------------------
   * STATIC GLOBAL SCROLL STATE (available to ALL sections)
   * --------------------------------------------------------- */
  static rawY = 0;         // raw window.scrollY each frame
  static smoothedY = 0;    // smoothed scroll (if enabled)
  static velocity = 0;     // px per ms
  static predictedY = 0;   // anticipated future scroll position

  /* ---------------------------------------------------------
   * REGISTER SECTION
   * --------------------------------------------------------- */
  register(section) {
    this.sections.push(section);
  }

  /* ---------------------------------------------------------
   * MEASURE ALL SECTIONS (called on start + resize)
   * --------------------------------------------------------- */
  measureAll() {
    this.sections.forEach(s => s.measure?.());
  }

  /* ---------------------------------------------------------
   * RESIZE HANDLER
   * --------------------------------------------------------- */
  _onResize = () => {
    this.measureAll();
  }

  /* ---------------------------------------------------------
   * MAIN RAF LOOP
   * --------------------------------------------------------- */
  _raf = (timestamp) => {
    const rawY = window.scrollY;
    ScrollEngine.rawY = rawY;

    /* -----------------------------------------------------
     * 1. UPDATE SMOOTH SCROLL (if enabled)
     * ----------------------------------------------------- */
    const smoothedY = this.smooth ? this.smooth.update() : rawY;
    ScrollEngine.smoothedY = smoothedY;

    /* -----------------------------------------------------
     * 2. COMPUTE VELOCITY
     * ----------------------------------------------------- */
    const dt = timestamp - this.lastTimestamp || 16.7;
    const dy = rawY - this.lastRawY;

    const velocity = dy / dt; // px/ms
    ScrollEngine.velocity = velocity;

    this.lastRawY = rawY;
    this.lastTimestamp = timestamp;

    /* -----------------------------------------------------
     * 3. PREDICT FUTURE SCROLL POSITION
     * ----------------------------------------------------- */
    // Predict about one frame ahead (~16ms)
    const anticipateFactor = 16.7;
    ScrollEngine.predictedY = rawY + velocity * anticipateFactor;

    /* -----------------------------------------------------
     * 4. UPDATE ALL REGISTERED SECTIONS
     * ----------------------------------------------------- */
    this.sections.forEach(section => {
      if (!section.enabled) return;
      section.update(smoothedY);
    });

    /* -----------------------------------------------------
     * 5. REQUEST NEXT FRAME
     * ----------------------------------------------------- */
    this.frame = requestAnimationFrame(this._raf);
  }

  /* ---------------------------------------------------------
   * START ENGINE
   * --------------------------------------------------------- */
  start() {
    this.measureAll();
    this.frame = requestAnimationFrame(this._raf);
  }

  /* ---------------------------------------------------------
   * STOP ENGINE
   * --------------------------------------------------------- */
  stop() {
    cancelAnimationFrame(this.frame);
    window.removeEventListener("resize", this._onResize);
  }
}
