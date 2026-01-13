let DEBUG_ENABLED = true;

class DebugController {
  constructor() {
    this.overlay = null;
    this.lines = {}; // keyed debug channels
  }

  enable() {
    DEBUG_ENABLED = true;
    console.warn("%cDebug Mode Enabled", "color:#0f0; font-weight:bold;");
    this.ensureOverlay();
  }

  disable() {
    DEBUG_ENABLED = false;
    console.warn("%cDebug Mode Disabled", "color:#f00; font-weight:bold;");
    if (this.overlay) this.overlay.style.display = "none";
  }

  isEnabled() {
    return DEBUG_ENABLED;
  }

  /* ------------------------------------------
   * Ensure overlay exists (lazy-create)
   * ------------------------------------------ */
  ensureOverlay() {
    if (this.overlay) {
      this.overlay.style.display = "block";
      return;
    }

    const el = document.createElement("div");
    el.style.position = "fixed";
    el.style.bottom = "20px";
    el.style.right = "20px";
    el.style.padding = "12px 14px";
    el.style.background = "rgba(72, 157, 255, 1)";
    el.style.color = "rgba(0, 0, 0, 1)";
    el.style.fontSize = "13px";
    el.style.fontFamily = "monospace";
    el.style.borderRadius = "6px";
    el.style.zIndex = "999999";
    el.style.pointerEvents = "none";
    el.style.whiteSpace = "pre-line";  // allow multiline text
    el.id = "global-debug-overlay";

    document.body.appendChild(el);

    this.overlay = el;
  }

  /* ------------------------------------------
   * Public API: write debug info
   * Every "channel" gets its own line
   * ------------------------------------------ */
  write(key, text) {
    if (!DEBUG_ENABLED) return;
    this.ensureOverlay();

    this.lines[key] = text;

    // Update overlay content
    this.overlay.textContent = Object.values(this.lines).join("\n");

    // Also log to console for convenience
    console.log(`${key}:`, value);
  }

  /* ------------------------------------------
   * Public API: clear a specific debug channel
   * ------------------------------------------ */
  clear(key) {
    delete this.lines[key];

    if (this.overlay) {
      this.overlay.textContent = Object.values(this.lines).join("\n");
    }
  }

/* ------------------------------------------
   * Public API: clear all debug lines
   * ------------------------------------------ */
  clearAll() {
    this.lines = {};
    if (this.overlay) {
      this.overlay.textContent = "";
    }
  }
}

export const Debug = new DebugController();
