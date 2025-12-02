export default class SmoothScroll {
  constructor({ ease = 0.08 } = {}) {
    this.ease = ease;
    this.current = window.scrollY;
    this.target = window.scrollY;

    this._onScroll = this._onScroll.bind(this);
    window.addEventListener("scroll", this._onScroll, { passive: true });
  }

  _onScroll() {
    this.target = window.scrollY;
  }

  update() {
    this.current += (this.target - this.current) * this.ease;

    if (Math.abs(this.target - this.current) < 0.05) {
      this.current = this.target;
    }

    return this.current;
  }
}

