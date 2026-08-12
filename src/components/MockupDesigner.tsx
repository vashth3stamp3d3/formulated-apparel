"use client";

import { useEffect } from "react";
import { site } from "@/lib/site";
import styles from "./MockupDesigner.module.css";

/** Bump when Mockup App editor UX ships so browsers skip stale CDN caches. */
const EDITOR_ASSET_VERSION = "20260812c";

const mockupApp = site.mockupAppUrl.replace(/\/+$/, "");

const editorData = {
  appUrl: mockupApp,
  // Shopify checkout on formulatedprints.com (not quote mode).
  shopifyCartHost: site.shopifyCatalogUrl.replace(/\/+$/, ""),
  productsUrl: `${mockupApp}/api/shopify-products`,
  productId: null,
  productPrice: 0,
  productTitle: "",
  variantId: "",
  options: [] as unknown[],
  variants: [] as unknown[],
};

export function MockupDesigner() {
  useEffect(() => {
    let dataEl = document.getElementById("mockup-editor-data");
    if (!dataEl) {
      dataEl = document.createElement("script");
      dataEl.id = "mockup-editor-data";
      (dataEl as HTMLScriptElement).type = "application/json";
      document.getElementById("mockup-editor-root")?.prepend(dataEl);
    }
    dataEl.textContent = JSON.stringify(editorData);

    // Always pull CSS/JS from Mockup App Railway so apparel stays in sync.
    let link = document.getElementById("mockup-editor-css") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = "mockup-editor-css";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = `${mockupApp}/api/mockup-editor-css?v=${encodeURIComponent(EDITOR_ASSET_VERSION)}`;

    document.getElementById("mockup-editor-js")?.remove();
    const script = document.createElement("script");
    script.id = "mockup-editor-js";
    script.src = `${mockupApp}/api/mockup-editor-js?v=${encodeURIComponent(EDITOR_ASSET_VERSION)}`;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <div className={styles.wrap}>
      <script
        id="mockup-editor-data"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(editorData) }}
      />
      <div id="mockup-editor-root">
        <div className="mockup-editor" id="mockup-editor">
          <header className="mockup-bento-header">
            <div className="mockup-bento-heading">
              <p className="mockup-bento-eyebrow">Custom merch</p>
              <h1 className="mockup-editor-title">Design Your Product</h1>
              <p className="mockup-bento-lead">
                Tap, upload, place, then checkout on Formulated Prints.
              </p>
            </div>
            <nav className="mockup-progress-rail" aria-label="Builder progress">
              <button type="button" className="progress-chip is-current" data-scroll-target="bento-product">
                <span className="progress-chip-number">1</span>
                <span>Product</span>
              </button>
              <button type="button" className="progress-chip" data-scroll-target="bento-print-art">
                <span className="progress-chip-number">2</span>
                <span>Design</span>
              </button>
              <button type="button" className="progress-chip" data-scroll-target="order-summary">
                <span className="progress-chip-number">3</span>
                <span>Cart</span>
              </button>
            </nav>
          </header>

          <div className="mockup-bento-layout">
            <main className="mockup-main" aria-label="Configure your merch">
              <div className="mockup-bento-grid">
                <section
                  className="bento-tile bento-tile--product bento-tile--wide bento-tile--compact"
                  id="bento-product"
                >
                  <header className="bento-tile-header">
                    <div>
                      <p className="bento-step-label">1</p>
                      <h2>Product</h2>
                      <p className="bento-section-summary" id="product-section-summary">
                        Choose one to start.
                      </p>
                    </div>
                  </header>
                  <div className="bento-tile-body">
                    <div className="product-buttons" id="product-buttons" aria-live="polite">
                      <div className="loading-placeholder">Loading…</div>
                    </div>
                  </div>
                </section>

                <section
                  className="bento-tile bento-tile--print-art bento-tile--wide is-locked"
                  id="bento-print-art"
                  aria-labelledby="print-art-title"
                >
                  <header className="bento-tile-header">
                    <div>
                      <p className="bento-step-label">2</p>
                      <h2 id="print-art-title">Design your merch</h2>
                      <p className="bento-section-summary" id="print-art-section-summary">
                        Pick a product first.
                      </p>
                    </div>
                  </header>
                  <div className="bento-tile-body">
                    <div className="design-desk" id="design-desk">
                      <aside
                        className="design-live-preview"
                        id="bento-lifestyle"
                        aria-labelledby="lifestyle-title"
                      >
                        <div className="design-live-preview-header">
                          <div>
                            <h3 id="lifestyle-title">Live mockup</h3>
                            <p className="bento-section-summary" id="lifestyle-section-summary">
                              Pick a product to preview.
                            </p>
                          </div>
                        </div>
                        <div className="design-action-bar" id="design-action-bar" aria-label="Design actions">
                          <div className="loading-placeholder">Pick a product first.</div>
                        </div>
                        <div className="design-hud" id="design-modal" hidden>
                          <button
                            type="button"
                            className="design-hud-backdrop"
                            id="design-modal-backdrop"
                            aria-label="Close panel"
                          />
                          <div
                            className="design-hud-sheet"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="design-modal-title"
                          >
                            <header className="design-hud-header">
                              <div>
                                <h3 id="design-modal-title">Upload</h3>
                                <p className="design-hud-sub" id="design-modal-sub" />
                              </div>
                              <button
                                type="button"
                                className="design-hud-close"
                                id="design-modal-close"
                                aria-label="Close"
                              >
                                ×
                              </button>
                            </header>
                            <div className="design-hud-body">
                              <div className="design-hud-pane" id="design-modal-upload" hidden>
                                <div
                                  className="design-side-controls"
                                  id="design-side-controls"
                                  aria-live="polite"
                                />
                              </div>
                              <div className="design-hud-pane" id="design-modal-placement" hidden>
                                <div
                                  className="design-side-placement"
                                  id="bento-placement"
                                  aria-label="Placement controls"
                                >
                                  <div className="design-section" id="placement-section">
                                    <div className="preview-container" id="preview-container" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <footer className="design-hud-footer">
                              <button type="button" className="design-hud-done" id="design-modal-done">
                                Done
                              </button>
                            </footer>
                          </div>
                        </div>
                        <div className="lifestyle-gallery" id="lifestyle-gallery" />
                        <div className="bento-empty-state" id="lifestyle-empty" hidden>
                          Pick a product to see your mockup.
                        </div>
                        <div className="lifestyle-zoom-hud" id="lifestyle-zoom-hud" hidden>
                          <button
                            type="button"
                            className="lifestyle-zoom-backdrop"
                            id="lifestyle-zoom-backdrop"
                            aria-label="Close preview"
                          />
                          <div
                            className="lifestyle-zoom-sheet"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="lifestyle-zoom-title"
                          >
                            <header className="lifestyle-zoom-header">
                              <div>
                                <h3 id="lifestyle-zoom-title">Mockup</h3>
                                <p className="lifestyle-zoom-sub" id="lifestyle-zoom-sub">
                                  Pinch or scroll to zoom · drag to pan
                                </p>
                              </div>
                              <button
                                type="button"
                                className="lifestyle-zoom-close"
                                id="lifestyle-zoom-close"
                                aria-label="Close"
                              >
                                ×
                              </button>
                            </header>
                            <div className="lifestyle-zoom-stage" id="lifestyle-zoom-stage">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                className="lifestyle-zoom-image"
                                id="lifestyle-zoom-image"
                                alt=""
                                width={720}
                                height={960}
                                draggable={false}
                              />
                            </div>
                            <footer className="lifestyle-zoom-footer">
                              <div
                                className="lifestyle-zoom-nav"
                                id="lifestyle-zoom-nav"
                                aria-label="Other mockups"
                              />
                              <div className="lifestyle-zoom-tools">
                                <button
                                  type="button"
                                  className="lifestyle-zoom-tool"
                                  id="lifestyle-zoom-out"
                                  aria-label="Zoom out"
                                >
                                  −
                                </button>
                                <span className="lifestyle-zoom-level" id="lifestyle-zoom-level">
                                  100%
                                </span>
                                <button
                                  type="button"
                                  className="lifestyle-zoom-tool"
                                  id="lifestyle-zoom-in"
                                  aria-label="Zoom in"
                                >
                                  +
                                </button>
                                <button
                                  type="button"
                                  className="lifestyle-zoom-tool"
                                  id="lifestyle-zoom-reset"
                                >
                                  Reset
                                </button>
                                <button
                                  type="button"
                                  className="lifestyle-zoom-done"
                                  id="lifestyle-zoom-done"
                                >
                                  Done
                                </button>
                              </div>
                            </footer>
                          </div>
                        </div>
                      </aside>
                    </div>
                  </div>
                </section>
              </div>
            </main>

            <aside className="mockup-order-rail" id="order-summary" aria-label="Build your order">
              <div className="order-rail-inner">
                <header className="order-rail-header">
                  <div>
                    <p className="bento-step-label">3</p>
                    <h2>Your order</h2>
                    <p className="bento-section-summary">
                      Pick options, then add to Formulated Prints cart.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="order-sheet-close"
                    id="order-sheet-close"
                    aria-label="Close order summary"
                  >
                    ×
                  </button>
                </header>
                <div className="order-cart-glance" style={{ display: "none" }}>
                  <span id="sidebar-cart-count">Cart</span>
                  <strong id="sidebar-cart-total">$0.00</strong>
                </div>
                <div
                  className="sidebar-cart-discount"
                  id="sidebar-cart-discount"
                  style={{ display: "none" }}
                />
                <div className="confirm-summary" id="confirm-summary" aria-live="polite">
                  <div className="order-empty-state">Pick a product to start.</div>
                </div>
                <div
                  className="upload-progress"
                  id="upload-progress"
                  style={{ display: "none" }}
                  role="status"
                  aria-live="polite"
                >
                  <div className="upload-progress-inner">
                    <div className="upload-spinner" />
                    <div className="upload-progress-text">
                      <span className="upload-step-label" id="upload-step-label">
                        Getting ready…
                      </span>
                      <span className="upload-blurb">Hang tight — almost done.</span>
                    </div>
                  </div>
                  <div className="upload-steps-track" id="upload-steps-track" />
                </div>
                <div className="order-final-actions">
                  <button type="button" className="btn-add-to-cart" id="btn-add-to-cart" disabled>
                    Add to cart
                  </button>
                  <div className="order-cart-links" style={{ display: "none" }} />
                </div>
              </div>
            </aside>
          </div>

          <button
            type="button"
            className="order-sheet-backdrop"
            id="order-sheet-backdrop"
            aria-label="Close order summary"
            hidden
          />
          <div className="mobile-order-bar" id="mobile-order-bar">
            <div className="mobile-order-total">
              <span id="mobile-order-count">No items yet</span>
              <strong id="mobile-order-total">$0.00</strong>
            </div>
            <button
              type="button"
              id="mobile-order-toggle"
              aria-controls="order-summary"
              aria-expanded="false"
            >
              Review order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
