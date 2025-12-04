import BaseSection from "@engine/BaseSection";
import ScrollEngine from "@engine/ScrollEngine";
import { clamp01 } from "@utils";
import { Debug } from "@engine/Debug";

export default class StickyBaseSection extends BaseSection {
  constructor({ el, anticipate = 1 }) {
    super({ el });

    this.anticipate = anticipate;   // GSAP-like anticipatePin multiplier

    this.pinned = false;

    this.spacer = null;
    this.content = null;
    this.height = 0;
    this.enabled = true;
  }

  /* -------------------------------------------------------------
   * SETUP DOM WRAPPER FOR PINNING
   * ------------------------------------------------------------- */
  setupPinWrapper() {
    if (this.spacer) return;

    // Spacer preserves layout space when content becomes fixed
    this.spacer = document.createElement("div");
    this.spacer.classList.add("sticky-spacer");

    // Content becomes fixed-position while pinned
    this.content = document.createElement("div");
    this.content.classList.add("sticky-content");

    // Move all original children → content
    while (this.el.firstChild) {
      this.content.appendChild(this.el.firstChild);
    }

    this.spacer.appendChild(this.content);
    this.el.appendChild(this.spacer);
  }

  /* -------------------------------------------------------------
   * MEASUREMENT (CALLED BY ENGINE ON LOAD & RESIZE)
   * ------------------------------------------------------------- */
  measure() {
    if (!this.el) return;

    this.setupPinWrapper();

    // Reset styles for clean measurement
    this.content.style.transform = "";
    this.content.style.position = "";
    this.content.style.top = "";
    this.content.style.left = "";
    this.content.style.width = "";

    const rect = this.el.getBoundingClientRect();
    const rawY = window.scrollY;

    this.pinOffset = window.innerHeight * 0.38;  // your old “delay” mapped correctly

    this.start = (rect.top + rawY) + this.pinOffset;

    this.height = this.content.offsetHeight; // height of sticky content
    this.end = this.start + this.height;     // pin end position
    this.length = this.end - this.start;


    // Preserve layout space equal to sticky content height
    this.spacer.style.height = `${this.height}px`;
  }

  /* -------------------------------------------------------------
   * PIN / UNPIN
   * ------------------------------------------------------------- */
  pin() {
    if (this.pinned) return;

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

    // Restore original state
    this.content.style.position = "";
    this.content.style.top = "";
    this.content.style.left = "";
    this.content.style.width = "";
    this.content.style.transform = "";

    this.onUnpin?.();
  }

  /* -------------------------------------------------------------
   * UPDATE (CALLED EACH RAF BY SCROLL ENGINE)
   * NOTE: scrollY = smoothed scroll
   * ------------------------------------------------------------- */
  update(scrollY) {
    if (!this.enabled) return;

    const rawY = window.scrollY;
    const predictedY = ScrollEngine.predictedY; // static getter
    const anticipateOffset = 20 * this.anticipate;

    /* ---------------------------------------------
     * EARLY PINNING (anticipatePin clone)
     * --------------------------------------------- */
    if (!this.pinned && predictedY >= this.start - anticipateOffset) {
      this.pin();
    }

    /* ---------------------------------------------
     * NORMAL PIN / UNPIN LOGIC
     * --------------------------------------------- */
    if (this.pinned && rawY >= this.end) {
      this.unpin();
      return;
    }

    if (rawY < this.start && this.pinned) {
      this.unpin();
      return;
    }

    /* ---------------------------------------------
     * SMOOTH INTERNAL TRANSLATION WHILE PINNED
     * --------------------------------------------- */
    if (this.pinned) {
      const t = clamp01((scrollY - this.start) / this.length);
      const translateY = -t * this.height;

      this.content.style.transform = `translateY(${translateY}px)`;

      this.onStickyUpdate?.(t);
    }
  }
}
