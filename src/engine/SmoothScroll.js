import { lerp } from "./utils.js";

export default class SmoothScroll {
  constructor({
    lerpEase = 0.1,
    onUpdate = () => {}
  } = {}) {
    this.lerpEase = lerpEase;
    this.current = 0;
    this.target = 0;
    this.onUpdate = onUpdate;

    this.handle = this.handle.bind(this);
    window.addEventListener("scroll", this.handle);
  }

  handle() {
    this.target = window.scrollY;
  }

  update() {
    this.current = lerp(this.current, this.target, this.lerpEase);
    this.onUpdate(this.current);
    return this.current;
  }
}
