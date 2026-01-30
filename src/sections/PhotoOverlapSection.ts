// handles deactivation of previous section image
// handles photos overlapping as we scroll
// handles text is-active class removal
// hides all left side images once the right side image gets to top of viewport via this.end

import BaseSection from "../engine/BaseSection.js";
import { Debug } from "../engine/Debug.js";
import { clamp, clamp01, mapRange } from "../engine/utils.js";

type PhotoOverlapDeclarativeConfig = {
  el: string | HTMLElement;
}

export default class PhotoOverlapDeclarative extends BaseSection {
  // DOM collections
  sectionTrigger: HTMLElement;
  initialImages: HTMLElement[] = [];
  progressBar: HTMLElement;
  progressBarHeight!: number;
  totalProgress!: string;
  behindImageWrapper: HTMLElement;

  // image toggle on and off
  triggers!: number[];
  behindImageToggleCheckpoint!: number;

  // text elements
  projectTextSection: HTMLElement | null;
  sectionHeaderText!: HTMLElement;
  projectTextHeading!: HTMLElement;
  bodyText!: HTMLElement;
  itemNumberText!: HTMLElement;
  textElements: HTMLElement[] = [];
  textElementsMinusTitle: HTMLElement[] = [];

  // left side images only
  leftSideImages: HTMLElement[];

  private behindImageVisible: boolean = false;

  private textActive: boolean = false;

  private leftSideHideAll: boolean = false;

  private isLeftSideHidden: boolean = false;

  constructor({ el }: PhotoOverlapDeclarativeConfig ) {
    super({ el });

    // el = ".photo-overlap-section";

    /* -------------------------------------------------------------
     * DOM ELEMENTS
     * ------------------------------------------------------------- */
    this.sectionTrigger = document.querySelector<HTMLElement>(".photo-overlap-section-trigger")!;

    // All images that participate in the overlap animation
    this.initialImages = Array.from(this.sectionTrigger.querySelectorAll<HTMLElement>(".sticky-img-container"));
    this.leftSideImages = this.initialImages.slice(0, -1);

    console.log(this.leftSideImages)

    this.progressBar = document.querySelector<HTMLElement>(".progress-container")!;

    this.behindImageWrapper = document.querySelector<HTMLElement>(".home-scroll-img-behind-wrapper");

    // text element gathering starting with parent and deriving from there
    this.projectTextSection = document.querySelector<HTMLElement>(".project-text-section.is-sticky.heroic-members")!;
    this.sectionHeaderText = this.projectTextSection.querySelector<HTMLElement>(".section-header-text")!;
    this.projectTextHeading = this.projectTextSection.querySelector<HTMLElement>(".project-text-heading")!;
    this.bodyText = this.projectTextSection.querySelector<HTMLElement>(".body-text.home-scroll")!;
    this.itemNumberText = this.projectTextSection.querySelector<HTMLElement>(".home-scroll-item-number")!;

    this.textElements.push(this.sectionHeaderText, this.projectTextHeading, this.bodyText, this.itemNumberText);
    this.textElementsMinusTitle.push(this.sectionHeaderText, this.bodyText, this.itemNumberText);

    console.log(this.textElements);
    
    // this.textElements = [...this.sectionTrigger.querySelectorAll("")]

    this.enabled = true;

    window.addEventListener("resize", () => this.measure());
  }

  /* -------------------------------------------------------------
   * MEASURE
   * -------------------------------------------------------------
   * Calculates all scroll trigger points.
   * Each image gets its own trigger spaced by 1 viewport height.
   * ------------------------------------------------------------- */
  measure(): void {
    super.measure();

    // Used to offset the start position so animation aligns visually with the progress UI
    this.progressBarHeight = this.progressBar!.getBoundingClientRect().height;

    this.start =
      window.scrollY +
      this.sectionTrigger.getBoundingClientRect().top +
      window.innerHeight * 1.38 +
      this.progressBarHeight;

    // Declarative trigger generation: Each image animates over exactly one viewport height - the image dom node value is not important aka "_", just creating the trigger values array is priority
    this.triggers = this.initialImages.map((_, i) => this.start + window.innerHeight * i);

    this.behindImageToggleCheckpoint = this.triggers[1];

    // Used by the engine for section bounds
    // this.end = this.triggers[this.triggers.length - 1] + window.innerHeight;
    this.end = this.triggers[this.triggers.length - 1] + window.innerHeight;

    console.log(window.scrollY, this.end, this.triggers[this.triggers.length - 1]);

    this.initialImages.forEach((image, _) => {
      // Performance hints
      image.style.willChange = "transform";
    });

    this.isLeftSideHidden = window.scrollY <= this.end;

    this.textActive = this.textElements[0].classList.contains("is-active");

    // Debug.write("PhotoOverlapSection", {
    //   start: Math.round(this.start),
    //   triggers: this.triggers.map(v => Math.round(v)),
    //   end: Math.round(this.end),
    // });
  }

  update(scrollY: number): void {
    if (!this.enabled) return;

    // handles previous move photo section image toggle off on
    const shouldBeVisible = scrollY <= this.behindImageToggleCheckpoint;
    this.behindImageWrapper.style.opacity = shouldBeVisible ? "1" : "0";
    this.behindImageVisible = shouldBeVisible;

    // handles images sliding up on triggers
    this.initialImages.forEach((image, index) => {
      const trigger = this.triggers[index];

      // Normalized progress for this image
      const t = clamp01(
        (scrollY - trigger) / window.innerHeight
      );

      const yPercent = mapRange(t, 0, 1, 0, 100);

      // this.totalProgress = (scrollY / this.end).toFixed(2);

      image.style.transform = `translate3d(0, -${yPercent}%, 0)`;
    });

    // handles deactivation of text elements
    const shouldBeActive = scrollY >= this.start && scrollY <= this.triggers[this.triggers.length - 1];

    if ( shouldBeActive && !this.textActive ) {
      this.textElements.forEach((textEl) => {
        textEl.classList.add("is-active");
      });
    } if ( !shouldBeActive && this.textActive ) {
       this.textElementsMinusTitle.forEach((textEl) => {
        textEl.classList.remove("is-active");
       });
    } 

    // handles the turn off all left side images once the right side reaches the top (this.end)
    const shouldHideAll = scrollY >= this.end;

    if (shouldHideAll && !this.isLeftSideHidden) {
      this.leftSideImages.forEach((image) => {
        image.style.opacity = "0";
      });
      this.isLeftSideHidden = true;
    }

    // optional: if you want them to reappear when scrolling back above end
    if (!shouldHideAll && this.isLeftSideHidden) {
      this.leftSideImages.forEach((image) => {
        image.style.opacity = "1";
      });
      this.isLeftSideHidden = false;
    }
  }
}
