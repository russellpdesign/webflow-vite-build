import BaseSection from "@engine/BaseSection";
import ScrollEngine from "@engine/ScrollEngine";
import { clamp01 } from "@utils";
import { Debug } from "@engine/Debug";

export default class StickyBaseSection extends BaseSection {
  constructor({ el, anticipate = 0 }) {
    super({ el });

    this.anticipate = anticipate;

    this.pinned = false;

    this.spacer = null;
    this.content = null;
    this.height = 0;

    this.baseReleaseBuffer = 20;
    this.releaseMultiplier = 300;

    this.enable = true;
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

    // Current on-screen position of the content before becoming fixed
    const rect = this.content.getBoundingClientRect();
    this.pinCompensation = rect.top; // distance from viewport top

    Debug.write("StickyBaseSection", "PIN ACTIVE");

    this.pinned = true;

    this.content.style.position = "fixed";
    this.content.style.top = "0";
    this.content.style.left = "0";
    this.content.style.width = "100%";

    // Compensation transform
    this.content.style.transform = `translateY(${this.pinCompensation}px)`;

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

  /* -------------------------------------------------------------
   * UPDATE (called every RAF)
   * ------------------------------------------------------------- */
  update() {
    if (!this.enabled) return;

    const rawY = ScrollEngine.rawY;
    const smoothedY = ScrollEngine.smoothedY;

    /* ---------------------------------------------------------
     * BASIC PIN / UNPIN (no anticipate, no dynamic buffering)
     * --------------------------------------------------------- */

    // PIN when raw scroll passes start
    if (!this.pinned && rawY >= this.start) {
      this.pin();
    }

    // UNPIN when raw scroll passes end
    if (this.pinned && rawY >= this.end) {
      this.unpin();
      return;
    }

    // UNPIN when scrolling back above start
    if (this.pinned && rawY < this.start) {
      this.unpin();
      return;
    }

    /* ---------------------------------------------------------
     * IF PINNED → animate translate using smoothed scroll
     * --------------------------------------------------------- */
    if (this.pinned) {
      // On first frame after pin, let compensation hold position
      if (this.pinCompensation !== 0) {
        requestAnimationFrame(() => {
          this.pinCompensation = 0;
        });
        return;
      }

      const t = clamp01((ScrollEngine.smoothedY - this.start) / this.length);
      const translateY = -t * this.height;

      this.content.style.transform = `translateY(${translateY}px)`;

      this.onStickyUpdate?.(t);
    }
  }
}