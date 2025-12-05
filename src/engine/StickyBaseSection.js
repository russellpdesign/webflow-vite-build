import BaseSection from "@engine/BaseSection";
import ScrollEngine from "@engine/ScrollEngine";
import { clamp01 } from "@utils";
import { Debug } from "@engine/Debug";

export default class StickyBaseSection extends BaseSection {
  constructor({ el, anticipate = 1 }) {
    super({ el });

    this.anticipate = anticipate;

    this.pinned = false;

    this.spacer = null;
    this.content = null;
    this.height = 0;

    this.baseReleaseBuffer = 20;
    this.releaseMultiplier = 300;
  }

  setupPinWrapper() {
    if (this.spacer) return;

    this.spacer = document.createElement("div");
    this.spacer.classList.add("sticky-spacer");

    this.content = document.createElement("div");
    this.content.classList.add("sticky-content");

    while (this.el.firstChild) {
      this.content.appendChild(this.el.firstChild);
    }

    this.spacer.appendChild(this.content);
    this.el.appendChild(this.spacer);
  }

  measure() {
    if (!this.el) return;

    this.setupPinWrapper();

    this.content.style.transform = "";
    this.content.style.position = "";
    this.content.style.top = "";
    this.content.style.left = "";
    this.content.style.width = "";

    const rect = this.el.getBoundingClientRect();

    // ❗ FIX — use rawY instead of nonexistent scrollY
    const rawY = ScrollEngine.rawY;

    this.start = rect.top + rawY;

    this.height = this.content.offsetHeight;

    this.end = this.start + this.height;
    this.length = this.end - this.start;

    this.spacer.style.height = `${this.height}px`;
  }

  pin() {
    if (this.pinned) return;

    console.log("[StickyBaseSection.pin]", {
      rawY: ScrollEngine.rawY,
      smoothedY: ScrollEngine.smoothedY,
      velocity: ScrollEngine.velocity,
      predictedY: ScrollEngine.predictedY,
      start: this.start,
      end: this.end
    });

    Debug.write("StickyBaseSection", "PIN ACTIVE");

    this.pinned = true;

    this.content.style.position = "fixed";
    this.content.style.top = "0";
    this.content.style.left = "0";
    this.content.style.width = "100%";

    this.onPin?.();
  }

  unpin() {
    if (!this.pinned) return;

    Debug.write("StickyBaseSection", "PIN RELEASED");

    this.pinned = false;

    this.content.style.position = "";
    this.content.style.top = "";
    this.content.style.left = "";
    this.content.style.width = "";
    this.content.style.transform = "";

    this.onUnpin?.();
  }

  update(scrollY) {
    if (!this.enabled) return;

    // ❗ FIX — use rawY instead of nonexistent scrollY
    const rawY = ScrollEngine.rawY;
    const velocity = ScrollEngine.velocity;
    const predictedY = ScrollEngine.predictedY;

    const anticipateOffset = 20 * this.anticipate;

    if (!this.pinned && predictedY >= this.start - anticipateOffset) {
      this.pin();
    }

    const dynamicReleaseBuffer =
      this.baseReleaseBuffer + Math.abs(velocity) * this.releaseMultiplier;

    if (this.pinned && rawY < this.start - dynamicReleaseBuffer) {
      this.unpin();
      return;
    }

    if (this.pinned && rawY >= this.end) {
      this.unpin();
      return;
    }

    if (rawY < this.start && this.pinned) {
      this.unpin();
      return;
    }

    if (this.pinned) {
      const t = clamp01((scrollY - this.start) / this.length);
      const translateY = -t * this.height;

      this.content.style.transform = `translateY(${translateY}px)`;

      this.onStickyUpdate?.(t);
    }
  }
}
