/*

INIT PHASE
  measure → RAF settle → measure → start loop

RUNTIME
  RAF → update

LAYOUT CHANGE SOURCES
  resize ┐
         ├→ _scheduleMeasure → RAF-batched measureAll()
observer ┘

*/


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


  constructor({ smooth = null }: ScrollEngineConfig = {}) {
    this.smooth = smooth;
    ScrollEngine.smoothingEnabled = !!smooth;
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

  private _isInitializing = true;

  private _resizePending = false;

  private _scheduleMeasure = () => {
    if (this._resizePending) return;

    this._resizePending = true;

    requestAnimationFrame(() => {
      this._resizePending = false;
      this.measureAll();
    });
  };

  private _onResizeObserver = new ResizeObserver(() => {
    if (this._isInitializing) return;
    this._scheduleMeasure();
  });

  private _onResize = (): void => {
    this._scheduleMeasure();
  };

start(): void {
  if (this._running) return;
  this._running = true;

  const init = () => {
    this.measureAll();

    requestAnimationFrame(() => {
      this.measureAll();

      this._isInitializing = false;

      ScrollEngine.rawY = window.scrollY;
      ScrollEngine.smoothedY = ScrollEngine.rawY;

      this._onResizeObserver.observe(document.documentElement);

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
    this._isInitializing = true; 

    window.removeEventListener("resize", this._onResize);
    this._onResizeObserver.disconnect();
  }

  private _raf = (timestamp: number): void => {
  if (!this._running) return;

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

  // since we want a continuous raf loop, this is the raf call that instigates the next frames animation
  // the raf call in start is what starts it all
  requestAnimationFrame(this._raf);
  }
} // ends scroll engine class instance