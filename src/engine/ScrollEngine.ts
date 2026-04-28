type SmoothController = {
  update: () => number;
};

type ScrollEngineConfig = {
  smooth?: SmoothController | null;
};

export interface ScrollSection {
  enabled?: boolean;
  measure: () => void;
  update: (scrollY: number) => void;
}

export default class ScrollEngine {
  static rawY: number = 0;
  static smoothedY: number = 0;
  static smoothingEnabled: boolean = false;

  // variable that holds all of our scrollsections, they are updated sequentially based on their position in the array
  private sections: ScrollSection[] = [];
  private smooth: SmoothController | null;

  // this makes sure multiple animation loops cant be created
  private _running: boolean = false;
  // private lastTimestamp: number;

  // private _onResize: () => void;
  // private _raf: (timestamp: number) => void;

  constructor({ smooth = null }: ScrollEngineConfig = {}) {
    this.smooth = smooth;
    ScrollEngine.smoothingEnabled = !!smooth;

    // Init for velocity & prediction
    // this.lastRawY = window.scrollY;
    // this.lastTimestamp = performance.now();

    // this._onResize = this._onResize.bind(this);
    // this._raf = this._raf.bind(this);
  }

  register(section: ScrollSection): void {
    // this creates our array containing our sections, which are object instances containing our dom caching objects, measure, and update methods
    this.sections.push(section);
  }

  measureAll(): void {
    for (const s of this.sections) {
      if (s.enabled !== false) {
         s.measure();
      }
    }
  }

  private _onResize = (): void => {
    this.measureAll();
  };

  private _onResizeObserver = new ResizeObserver((entries) => {
    console.log("I have sensed a window resize event");
  });

  // private _onLoad = () => {
  //   this.measureAll();
  // }

start(): void {
  if (this._running) return;
  this._running = true;

  const init = () => {
    this.measureAll();

    requestAnimationFrame(() => {
      this.measureAll();

      ScrollEngine.rawY = window.scrollY;
      ScrollEngine.smoothedY = ScrollEngine.rawY;

      requestAnimationFrame(this._raf); // ✅ only start here
    });
  };

  if (document.readyState === "complete") {
    init();
  } else {
    window.addEventListener("load", init, { once: true });
  }

  window.addEventListener("resize", this._onResize);
}

  stop(): void {
    this._running = false;
    window.removeEventListener("resize", this._onResize);
    this._onResizeObserver.observe(document.documentElement);
  }

  private _raf = (timestamp: number): void => {
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

  // UPDATE SECTIONS
  for (const section of this.sections) {
    if (section.enabled !== false) {
      section.update(currentY);
    }
  }

  requestAnimationFrame(this._raf);
  }
} // ends scroll engine class instance