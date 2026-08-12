/**
 * Mockup Editor - Storefront Theme Extension
 *
 * Self-contained one-page flow:
 * product → print & art → placement → order
 *
 * All product/variant data is fetched inside the block — no dependency on the host page.
 */

(function () {
  "use strict";

  const root = document.getElementById("mockup-editor-root");
  if (!root) return;

  // Read app URL from JSON data block
  let productData = {};
  try {
    const dataEl = document.getElementById("mockup-editor-data");
    if (dataEl) productData = JSON.parse(dataEl.textContent) || {};
  } catch (e) {}

  const APP_URL = (productData.appUrl || "").replace(/\/+$/, "");
  /** Standalone apparel site: request a quote instead of Shopify cart checkout. */
  const QUOTE_MODE = !!productData.quoteMode;
  const QUOTE_API_URL = productData.quoteApiUrl || "/api/quote";
  const PRODUCTS_URL =
    productData.productsUrl || "/products.json?limit=250";
  /** Bust CDN/proxy caches when lifestyle plate files change. */
  const LIFESTYLE_ASSET_VERSION = "20260807c";
  /** Bust caches when flat garment sketch templates change. */
  const TEMPLATE_ASSET_VERSION = "20260808a";

  // ===== State =====
  let config = { products: [] };
  /** Map of shopifyProductId → { options, variants } fetched from Shopify */
  let shopifyProductData = {};
  let selectedProduct = null;
  let selectedLocations = {};
  let uploadedFiles = {};
  let uploadErrors = {};
  let selectedOptions = {};
  let selectedSizes = {}; // { view: sizeId }
  let cartLines = [];
  let lineQty = 1;
  let orderStatus = null;
  let orderSheetOpen = false;
  let orderSheetPreviousFocus = null;
  /** Side currently being configured in the design desk. */
  let activeDesignSide = "front";
  /** Progressive disclosure keeps completed choices compact. */
  let productPickerExpanded = false;
  let locationPickerExpanded = {};
  let placementEditorOpen = {};
  /** True after the user opens Place for that side (so we stop nagging). */
  let placementReviewed = {};
  /** Animated design popout: null | { kind: 'upload'|'placement', view } */
  let designModal = null;
  let designModalPreviousFocus = null;
  /** Design position offsets from default centered position (logical preview pixels) */
  let designOffsets = {}; // { view: { dx: 0, dy: 0 } }
  /** Design scale relative to anchor/reference-edge size (1 = recommended fit) */
  let designScales = {}; // { view: number }
  /** Optional note for production staff — attached to cart line */
  let staffNote = "";
  /** Gender for lifestyle “How it would look” gallery */
  let lifestyleGender = "male";
  /** Last popular color slug used for lifestyle preview (for inquire fallback) */
  let lastPopularLifestyleColor = "black";
  /** Cached lifestyle plate images by imageKey */
  let lifestyleImageCache = {};
  /** Cached layout in logical preview space for export / hit-testing */
  let designDrawInfo = {}; // { view: layout }
  /** Cached decoded images for smooth Step 2 placement */
  let placementAssets = {}; // { view: { baseImg, designImg, designUrl, fileRef } }
  /** Logical preview coordinate space — offsets are stored in this space */
  const PREVIEW_W = 500;
  const PREVIEW_H = 600;
  const DESIGN_SCALE_MIN = 0.35;
  const DESIGN_SCALE_MAX = 2.5;

  // ===== Helpers =====
  const LIFESTYLE_COLOR_FALLBACK = [
    "black", "white", "navy", "blue", "red", "forest", "maroon", "olive",
    "natural", "heather-gray", "grey", "pink", "purple",
  ];

  const COLOR_SWATCHES = [
    { slug: "black", label: "Black", hex: "#1a1a1a" },
    { slug: "white", label: "White", hex: "#f4f4f6", border: true },
    { slug: "navy", label: "Navy", hex: "#1a2744" },
    { slug: "blue", label: "Blue", hex: "#2a56c8" },
    { slug: "red", label: "Red", hex: "#c62828" },
    { slug: "forest", label: "Forest", hex: "#234d36" },
    { slug: "maroon", label: "Maroon", hex: "#6b1c2a" },
    { slug: "olive", label: "Olive", hex: "#5c6040" },
    { slug: "natural", label: "Natural", hex: "#f0e6d8", border: true },
    { slug: "heather-gray", label: "Heather gray", hex: "#b4b4b8", border: true },
    { slug: "grey", label: "Grey", hex: "#7a7a7e" },
    { slug: "pink", label: "Pink", hex: "#e896b4" },
    { slug: "purple", label: "Purple", hex: "#6e379b" },
  ];

  function swatchMeta(slug) {
    return COLOR_SWATCHES.find((s) => s.slug === slug) || null;
  }

  function swatchSortIndex(slug) {
    const idx = COLOR_SWATCHES.findIndex((s) => s.slug === slug);
    return idx >= 0 ? idx : 999;
  }

  /** Prefer Black, then White, then other popular Shopify Color values. */
  function pickPreferredColorValue(values) {
    if (!values || !values.length) return null;
    for (const slug of LIFESTYLE_COLOR_FALLBACK) {
      const hit = values.find((v) => resolveLifestyleColor(v) === slug);
      if (hit) return hit;
    }
    return values[0] || null;
  }

  /**
   * Always show every generated lifestyle color (black → purple), mapped to
   * Shopify Color values when the product has them. Extra Shopify-only colors
   * appear after as inquire swatches.
   */
  function getColorSwatchChoices() {
    const data = getSelectedShopifyData();
    const shopifyColorName = data ? findColorOptionName(data.options) : null;
    const colorName = shopifyColorName || "Color";
    const opt = data && shopifyColorName
      ? data.options.find((o) => o.name === shopifyColorName)
      : null;
    const shopifyValues = (opt && opt.values) || [];

    const choices = COLOR_SWATCHES.map((meta) => {
      const match = shopifyValues.find((v) => resolveLifestyleColor(v) === meta.slug);
      return {
        value: match || meta.label,
        slug: meta.slug,
        label: meta.label,
        hex: meta.hex,
        border: !!meta.border,
        special: false,
        inCatalog: !!match,
      };
    });

    for (const value of shopifyValues) {
      if (resolveLifestyleColor(value)) continue;
      choices.push({
        value,
        slug: null,
        label: value,
        hex: "conic-gradient(from 90deg,#e8e8e8,#bbb,#e8e8e8)",
        border: true,
        special: true,
        inCatalog: true,
      });
    }
    return { colorName, choices };
  }

  function getSelectedColorChoice() {
    const pack = getColorSwatchChoices();
    if (!pack) return null;
    const selected = selectedOptions[pack.colorName];
    if (selected == null) return null;
    return (
      pack.choices.find((c) => c.value === selected) ||
      pack.choices.find((c) => c.slug && resolveLifestyleColor(selected) === c.slug) ||
      null
    );
  }

  function renderColorSwatchRow(extraClass = "") {
    const pack = getColorSwatchChoices();
    if (!pack || !pack.choices.length) return "";
    const selected = selectedOptions[pack.colorName];
    const selectedSlug = resolveLifestyleColor(selected);
    const chips = pack.choices.map((c) => {
      const active = selected === c.value || (!!c.slug && c.slug === selectedSlug);
      const style = `background:${c.hex}`;
      const borderCls = c.border || c.special ? " has-border" : "";
      const specialCls = c.special ? " is-special" : "";
      const catalogCls = !c.special && c.inCatalog === false ? " is-preview-only" : "";
      const activeCls = active ? " is-active" : "";
      const title = c.special
        ? `${c.label} (inquire)`
        : c.inCatalog === false
          ? `${c.label} (preview — inquire to order)`
          : c.label;
      return `<button type="button" class="color-swatch${borderCls}${specialCls}${catalogCls}${activeCls}" data-color-option="${escapeHtml(pack.colorName)}" data-color-value="${escapeHtml(c.value)}" data-color-slug="${escapeHtml(c.slug || "")}" title="${escapeHtml(title)}" aria-label="${escapeHtml(title)}" aria-pressed="${active}" style="${style}"></button>`;
    }).join("");
    const activeChoice = getSelectedColorChoice();
    const label = activeChoice
      ? (activeChoice.special || activeChoice.inCatalog === false
        ? `${activeChoice.label} (inquire)`
        : activeChoice.label)
      : "Color";
    return `<div class="color-swatch-row ${extraClass}" role="group" aria-label="Color">
      <span class="color-swatch-label">${escapeHtml(label)}</span>
      <div class="color-swatch-list">${chips}</div>
    </div>`;
  }

  function applyColorSwatchSelection(optionName, value, slugHint) {
    if (!optionName) return;
    selectedOptions[optionName] = value;
    orderStatus = null;
    const colorSlug = slugHint || getActiveLifestyleColorSlug();
    if (colorSlug) lastPopularLifestyleColor = colorSlug;
    lifestyleImageCache = {};
    const gallery = document.getElementById("lifestyle-gallery");
    if (gallery) delete gallery.dataset.galleryKey;
    renderLifestyleGallery();
    renderOrderSummary();
    updateBentoState();
    updateMobileOrderBar();
  }

  function bindColorSwatches(root) {
    if (!root) return;
    root.querySelectorAll(".color-swatch[data-color-option]").forEach((btn) => {
      btn.addEventListener("click", () => {
        applyColorSwatchSelection(
          btn.dataset.colorOption,
          btn.dataset.colorValue,
          btn.dataset.colorSlug || "",
        );
      });
    });
  }

  function resolveLifestyleColor(optionValue) {
    const raw = String(optionValue || "")
      .toLowerCase()
      .replace(/[_/]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!raw) return null;
    if (/\bheather\b/.test(raw) || raw === "heather-gray" || raw === "heather-grey") {
      return "heather-gray";
    }
    if (
      /\bnatural\b|\bcream\b|\bivory\b|\bsand\b|\boatmeal\b|\bbeige\b|\boff[\s-]?white\b/.test(raw) ||
      raw === "natural"
    ) {
      return "natural";
    }
    if (/\bwhite\b|\boptic white\b/.test(raw) || raw === "white") return "white";
    if (/\bblack\b/.test(raw) || raw === "black") return "black";
    if (/\bnavy\b/.test(raw) || raw === "navy") return "navy";
    if (/\broyal\b|\bblue\b/.test(raw) || raw === "blue") return "blue";
    if (/\bmaroon\b|\bburgundy\b|\bwine\b/.test(raw) || raw === "maroon") return "maroon";
    if (/\bforest\b|\bdark green\b|\bhunter\b/.test(raw) || raw === "forest") return "forest";
    if (/\bolive\b|\bmilitary\b|\barmy\b|\bmoss\b/.test(raw) || raw === "olive") return "olive";
    if (/\bred\b|\bcardinal\b|\bcrimson\b/.test(raw) || raw === "red") return "red";
    if (/\bpink\b/.test(raw) || raw === "pink") return "pink";
    if (/\bpurple\b|\bviolet\b/.test(raw) || raw === "purple") return "purple";
    if (/\bgrey\b|\bgray\b/.test(raw) || raw === "grey" || raw === "gray") return "grey";
    return null;
  }

  function findColorOptionName(options) {
    if (!options || !options.length) return null;
    const hit = options.find((o) => /^colou?r$/i.test(String(o.name || "").trim()));
    return hit ? hit.name : null;
  }

  function getSelectedColorOptionValue() {
    const data = getSelectedShopifyData();
    if (!data) return null;
    const colorName = findColorOptionName(data.options);
    if (!colorName) return null;
    return selectedOptions[colorName] || null;
  }

  /** Popular color slug, or null when special-order / inquire-only. */
  function getActiveLifestyleColorSlug() {
    const raw = getSelectedColorOptionValue();
    if (raw == null) {
      // No Color option — default black plates
      return "black";
    }
    return resolveLifestyleColor(raw);
  }

  function isSpecialColorOrder() {
    const choice = getSelectedColorChoice();
    if (choice) {
      // Shopify-only unknown colors, or generated colors not listed on the product
      return !!(choice.special || choice.inCatalog === false);
    }
    const raw = getSelectedColorOptionValue();
    if (raw == null) return false;
    return resolveLifestyleColor(raw) == null;
  }

  function getLifestyleInquirePath() {
    return (selectedProduct && selectedProduct.lifestyleInquirePath)
      || (config && config.lifestyleInquirePath)
      || "/pages/contact";
  }

  function getLocationName(view) {
    if (!selectedProduct || !selectedLocations[view]) return null;
    const slug = selectedLocations[view];
    const area = selectedProduct.printAreas.find(
      (pa) => pa.location.view === view && pa.location.slug === slug
    );
    return area ? area.location.name : slug;
  }

  function formatMoney(cents) {
    return "$" + (cents / 100).toFixed(2);
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getActiveViews() {
    return Object.entries(selectedLocations)
      .filter(([, slug]) => slug)
      .map(([view]) => view);
  }

  function getUploadedViews() {
    return Object.keys(uploadedFiles);
  }

  function allActiveViewsUploaded() {
    const activeViews = getActiveViews();
    return activeViews.length > 0 && activeViews.every((view) => !!uploadedFiles[view]);
  }

  function clearViewDesignState(view) {
    delete uploadedFiles[view];
    delete uploadErrors[view];
    delete imageAnalysis[view];
    delete selectedSizes[view];
    delete selectedLocations[view];
    delete designDrawInfo[view];
    delete designOffsets[view];
    delete designScales[view];
    delete placementEditorOpen[view];
    delete placementReviewed[view];
    delete locationPickerExpanded[view];
    revokePlacementAsset(view);
  }

  /** Keep artwork + placements when switching products; remap locations/sizes. */
  function adaptDesignStateForProduct(prevProduct, nextProduct) {
    const prevAreas = (prevProduct && prevProduct.printAreas) || [];
    const nextAreas = (nextProduct && nextProduct.printAreas) || [];
    const views = new Set([
      ...Object.keys(selectedLocations || {}),
      ...Object.keys(uploadedFiles || {}),
    ]);
    const nextLocations = {};
    const nextSizes = {};

    views.forEach((view) => {
      const candidates = nextAreas.filter((pa) => pa.location && pa.location.view === view);
      if (candidates.length === 0) {
        clearViewDesignState(view);
        return;
      }

      const prevSlug = selectedLocations[view];
      const prevArea = prevAreas.find(
        (pa) => pa.location && pa.location.view === view && pa.location.slug === prevSlug,
      );
      let match = candidates.find((pa) => pa.location.slug === prevSlug);
      if (!match && prevArea && prevArea.location) {
        const prevName = String(prevArea.location.name || "").toLowerCase();
        match = candidates.find(
          (pa) => String(pa.location.name || "").toLowerCase() === prevName,
        );
      }
      if (!match) match = candidates[0];
      nextLocations[view] = match.location.slug;

      const sizes = match.location.printSizes || [];
      const prevSizeId = selectedSizes[view];
      if (prevSizeId && sizes.some((s) => s.id === prevSizeId)) {
        nextSizes[view] = prevSizeId;
      } else {
        const fallback = sizes.find((s) => s.isDefault) || sizes[0];
        if (fallback) nextSizes[view] = fallback.id;
      }

      // Force placement cards to remount against the new garment base.
      const asset = placementAssets[view];
      if (asset) asset.baseImg = null;
      delete designDrawInfo[view];
    });

    selectedLocations = nextLocations;
    selectedSizes = nextSizes;
  }

  async function loadProductBaseImage(view) {
    if (!selectedProduct) return null;
    const imageKey = view === "front" ? selectedProduct.frontImageKey
      : view === "back" ? selectedProduct.backImageKey
      : selectedProduct.sideImageKey;
    if (imageKey) {
      const proxyUrl = `/apps/mockup/api/serve-image?key=${encodeURIComponent(imageKey)}&v=${TEMPLATE_ASSET_VERSION}`;
      const fromKey = await loadImageAsBlob(proxyUrl);
      if (fromKey) return fromKey;
    }
    const rawUrl = view === "front" ? selectedProduct.frontImageUrl
      : view === "back" ? selectedProduct.backImageUrl
      : selectedProduct.sideImageUrl;
    const baseUrl = resolveImageUrl(rawUrl);
    if (!baseUrl) return null;
    let baseImg = await loadImageAsBlob(baseUrl);
    if (!baseImg) baseImg = await loadImageElement(baseUrl, { crossOrigin: "anonymous" });
    if (!baseImg) baseImg = await loadImageElement(baseUrl);
    return baseImg;
  }

  /** Get the Shopify product data for the currently selected product */
  function getSelectedShopifyData() {
    if (!selectedProduct || !selectedProduct.shopifyProductId) return null;
    return shopifyProductData[selectedProduct.shopifyProductId] || null;
  }

  /** Find variant matching selected options for current product */
  function findMatchingVariant() {
    const data = getSelectedShopifyData();
    if (!data || data.variants.length === 0) return null;
    if (data.options.length === 0) return data.variants[0];

    return data.variants.find((v) => {
      return data.options.every((opt, i) => {
        const selected = selectedOptions[opt.name];
        if (!selected) return false;
        const varVal = i === 0 ? v.option1 : i === 1 ? v.option2 : v.option3;
        return varVal === selected;
      });
    });
  }

  function getVariantTitle(variant) {
    if (!variant) return "";
    return [variant.option1, variant.option2, variant.option3].filter(Boolean).join(" / ");
  }

  /** Get print sizes for a given view based on the selected location */
  function getSizesForView(view) {
    if (!selectedProduct) return [];
    const slug = selectedLocations[view];
    if (!slug) return [];
    const area = selectedProduct.printAreas.find(
      (pa) => pa.location.view === view && pa.location.slug === slug
    );
    return area && area.location.printSizes ? area.location.printSizes : [];
  }

  /** Get the selected size object for a view */
  function getSelectedSize(view) {
    const sizes = getSizesForView(view);
    if (sizes.length === 0) return null;
    const selId = selectedSizes[view];
    if (selId) return sizes.find((s) => s.id === selId) || null;
    // Return default size if set
    const defaultSize = sizes.find((s) => s.isDefault);
    return defaultSize || sizes[0] || null;
  }

  /** Get extra price from the selected size for a view */
  function getSizeSurchargeForView(view) {
    const size = getSelectedSize(view);
    return size ? size.extraPriceCents : 0;
  }

  /** Sum extraPriceCents for all selected (uploaded) print locations */
  function getLocationSurcharge() {
    if (!selectedProduct) return 0;
    let total = 0;
    for (const view of getUploadedViews()) {
      const slug = selectedLocations[view];
      if (!slug) continue;
      total += getSizeSurchargeForView(view);
      const area = selectedProduct.printAreas.find(
        (pa) => pa.location.view === view && pa.location.slug === slug
      );
      if (area && area.location.extraPriceCents) {
        total += area.location.extraPriceCents;
      }
    }
    return total;
  }

  /** Build an array of { view, name, extraPriceCents, feeVariantId, sizeName, sizeSurcharge } for uploaded locations */
  function getLocationBreakdown() {
    if (!selectedProduct) return [];
    const items = [];
    for (const view of getUploadedViews()) {
      const slug = selectedLocations[view];
      if (!slug) continue;
      const area = selectedProduct.printAreas.find(
        (pa) => pa.location.view === view && pa.location.slug === slug
      );
      if (area) {
        const size = getSelectedSize(view);
        const sizeSurcharge = size ? size.extraPriceCents : 0;
        const combinedPrice = (area.location.extraPriceCents || 0) + sizeSurcharge;

        // When a size is selected and has its own feeVariantId (combined price variant),
        // use that. Otherwise fall back to the location's feeVariantId.
        let feeVariantId = area.location.feeVariantId || null;
        if (size && size.feeVariantId) {
          feeVariantId = size.feeVariantId;
        }

        items.push({
          view,
          name: area.location.name,
          extraPriceCents: combinedPrice,
          locationPriceCents: area.location.extraPriceCents || 0,
          sizePriceCents: sizeSurcharge,
          feeVariantId,
          sizeName: size ? size.name : null,
          sizeLabel: size ? size.label : null,
        });
      }
    }
    return items;
  }

  /** Get the applicable bulk discount percent for a given quantity */
  function getBulkDiscount(qty) {
    if (!selectedProduct || !selectedProduct.bulkPricingTiers) return 0;
    let discount = 0;
    for (const tier of selectedProduct.bulkPricingTiers) {
      if (qty >= tier.minQuantity) discount = tier.discountPercent;
    }
    return discount;
  }

  /** Get info about the next available bulk tier (for upsell messaging) */
  function getNextTier(qty) {
    if (!selectedProduct || !selectedProduct.bulkPricingTiers) return null;
    for (const tier of selectedProduct.bulkPricingTiers) {
      if (qty < tier.minQuantity) {
        return { needed: tier.minQuantity - qty, discountPercent: tier.discountPercent, label: tier.label };
      }
    }
    return null; // already at max tier
  }

  function getCartTotals() {
    let totalQty = 0, totalCents = 0;
    for (const line of cartLines) {
      totalQty += line.quantity;
      totalCents += line.priceCents * line.quantity;
    }
    // Apply bulk discount
    const discountPct = getBulkDiscount(totalQty);
    const discountCents = discountPct > 0 ? Math.round(totalCents * discountPct / 100) : 0;
    const nextTier = getNextTier(totalQty);
    return { totalQty, totalCents, discountPct, discountCents, finalCents: totalCents - discountCents, nextTier };
  }

  function resolveImageUrl(url) {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/uploads/")) return "/apps/mockup" + url;
    return url;
  }

  async function refreshSidebarCart() {
    try {
      const res = await fetch("/cart.js", { headers: { Accept: "application/json" } });
      if (!res.ok) return;
      const cart = await res.json();
      const countEl = document.getElementById("sidebar-cart-count");
      const totalEl = document.getElementById("sidebar-cart-total");
      const itemsEl = document.getElementById("sidebar-cart-items");
      const emptyEl = document.getElementById("sidebar-cart-empty");

      if (countEl) countEl.textContent = `${cart.item_count} ${cart.item_count === 1 ? "item" : "items"} in cart`;

      // Calculate bulk discount for the sidebar cart
      const mockupItemTotal = (cart.items || [])
        .filter((it) => {
          const props = it.properties || {};
          const entries = Array.isArray(props) ? props.map((p) => [p.name, p.value]) : Object.entries(props);
          return entries.some(([k]) => k === "_product_type");
        })
        .reduce((sum, it) => sum + it.quantity, 0);

      const sidebarDiscountPct = getBulkDiscount(mockupItemTotal);
      const sidebarDiscountCents = sidebarDiscountPct > 0
        ? Math.round(cart.total_price * sidebarDiscountPct / 100)
        : 0;

      // Show discount info in cart panel
      const discountEl = document.getElementById("sidebar-cart-discount");
      if (discountEl) {
        if (sidebarDiscountPct > 0) {
          discountEl.style.display = "";
          discountEl.innerHTML = `<span>Bulk Discount (${sidebarDiscountPct}%)</span><span class="discount-amount">−${formatMoney(sidebarDiscountCents)}</span>`;
        } else {
          discountEl.style.display = "none";
          discountEl.innerHTML = "";
        }
      }

      if (totalEl) {
        if (sidebarDiscountPct > 0) {
          totalEl.innerHTML = `<span class="original-total">${formatMoney(cart.total_price)}</span> ${formatMoney(cart.total_price - sidebarDiscountCents)}`;
        } else {
          totalEl.textContent = formatMoney(cart.total_price);
        }
      }

      if (!itemsEl) return;
      const items = cart.items || [];
      if (items.length === 0) {
        itemsEl.innerHTML = "";
        if (emptyEl) emptyEl.style.display = "";
        return;
      }
      if (emptyEl) emptyEl.style.display = "none";

      // Helper to read a property from a cart item
      function getProp(item, key) {
        if (!item.properties) return null;
        if (Array.isArray(item.properties)) {
          const p = item.properties.find((pr) => pr.name === key);
          return p ? p.value : null;
        }
        return item.properties[key] || null;
      }

      // Separate main product items from fee items
      // Fee items have _fee_for property, main items have _product_type
      const mainItems = [];
      const feeItems = [];
      const otherItems = [];

      for (const item of items) {
        if (getProp(item, "_fee_for")) {
          feeItems.push(item);
        } else if (getProp(item, "_product_type")) {
          mainItems.push(item);
        } else {
          otherItems.push(item);
        }
      }

      // Group: each main item + its associated fee items as a "block"
      // Fee items are linked by _fee_for matching _product_type
      let html = "";

      // Render mockup order groups
      if (mainItems.length > 0) {
        for (const item of mainItems) {
          const vLabel = item.variant_title && item.variant_title !== "Default Title" ? item.variant_title : "";
          const printLocations = getProp(item, "_print_locations") || "";
          const printSizes = getProp(item, "_print_sizes") || "";

          // Prefer composite mockup preview for cart thumbs (customer design on garment)
          const designImages = [];
          const mockupKey = getProp(item, "_mockup_key");
          const mockupImg =
            getProp(item, "_mockup_image") ||
            getProp(item, "_mockup_url") ||
            getProp(item, "_mockup_reference") ||
            (mockupKey
              ? `/apps/mockup/api/serve-image?key=${encodeURIComponent(mockupKey)}`
              : null);
          if (mockupImg) {
            designImages.push({ label: "Mockup", url: mockupImg });
          }
          const props = item.properties || {};
          const propEntries = Array.isArray(props)
            ? props.map((p) => [p.name, p.value])
            : Object.entries(props);
          for (const [key, val] of propEntries) {
            if (!val) continue;
            // Legacy visible keys + new hidden download keys
            if (key === "Design Download" || key.startsWith("Design - ")) {
              const label = key === "Design Download" ? "Design" : key.replace("Design - ", "");
              designImages.push({ label, url: val });
            } else if (key === "_design_download" || key.startsWith("_design_")) {
              if (key === "_design_key" || key === "_design_url" || key === "_design_scale") continue;
              const label = key === "_design_download" ? "Design" : key.replace(/^_design_/, "");
              if (!designImages.some((d) => d.url === val)) {
                designImages.push({ label: capitalize(label), url: val });
              }
            }
          }
          if (designImages.length === 0) {
            const fallback = getProp(item, "_design_url");
            if (fallback) designImages.push({ label: "Design", url: fallback });
          }

          html += `<div class="cart-group">`;
          // Thumbnails row
          if (designImages.length > 0) {
            html += `<div class="cart-group-thumbs">`;
            for (const img of designImages) {
              html += `<div class="cart-thumb-wrap">
                <img class="cart-group-thumb" src="${img.url}" alt="${img.label}" />
                <span class="cart-thumb-label">${img.label}</span>
              </div>`;
            }
            html += `</div>`;
          }
          // Info row
          html += `<div class="cart-group-header">`;
          html += `<div class="cart-group-info">`;
          html += `<div class="cart-group-title">${item.product_title}</div>`;
          if (vLabel) html += `<div class="cart-group-variant">${vLabel}</div>`;
          if (printLocations) html += `<div class="cart-group-detail">${printLocations}</div>`;
          if (printSizes) html += `<div class="cart-group-detail">${printSizes}</div>`;
          html += `</div>`;
          html += `</div>`;

          // Price + qty controls
          html += `<div class="cart-group-footer">`;
          html += `<div class="cart-group-qty">
            <button class="cart-qty-btn cart-qty-minus" data-key="${item.key}">−</button>
            <span class="cart-qty-val">${item.quantity}</span>
            <button class="cart-qty-btn cart-qty-plus" data-key="${item.key}">+</button>
          </div>`;
          html += `<span class="cart-group-price">${formatMoney(item.final_line_price)}</span>`;
          html += `<button class="cart-remove-btn" data-key="${item.key}" title="Remove">✕</button>`;
          html += `</div>`;
          html += `</div>`;
        }

        // Show fee summary if any fees exist
        if (feeItems.length > 0) {
          html += `<div class="cart-fees-summary">`;
          for (const fee of feeItems) {
            const feeLabel = fee.variant_title || fee.product_title;
            html += `<div class="cart-fee-row">
              <span class="cart-fee-label">${feeLabel}</span>
              <span class="cart-fee-price">${formatMoney(fee.final_line_price)}</span>
            </div>`;
          }
          html += `</div>`;
        }
      }

      // Render non-mockup items (regular cart items)
      for (const item of otherItems) {
        const vLabel = item.variant_title || "";
        html += `<div class="cart-group cart-group-other">`;
        html += `<div class="cart-group-header">`;
        if (item.image) {
          html += `<img class="cart-group-thumb" src="${item.image}" alt="${item.product_title}" />`;
        }
        html += `<div class="cart-group-info">`;
        html += `<div class="cart-group-title">${item.product_title}</div>`;
        if (vLabel) html += `<div class="cart-group-variant">${vLabel}</div>`;
        html += `</div></div>`;
        html += `<div class="cart-group-footer">`;
        html += `<div class="cart-group-qty">
          <button class="cart-qty-btn cart-qty-minus" data-key="${item.key}">−</button>
          <span class="cart-qty-val">${item.quantity}</span>
          <button class="cart-qty-btn cart-qty-plus" data-key="${item.key}">+</button>
        </div>`;
        html += `<span class="cart-group-price">${formatMoney(item.final_line_price)}</span>`;
        html += `<button class="cart-remove-btn" data-key="${item.key}" title="Remove">✕</button>`;
        html += `</div></div>`;
      }

      itemsEl.innerHTML = html;

      // Bind qty change and remove buttons
      itemsEl.querySelectorAll(".cart-qty-minus").forEach((btn) => {
        btn.addEventListener("click", async () => {
          await updateCartItem(btn.dataset.key, -1);
        });
      });
      itemsEl.querySelectorAll(".cart-qty-plus").forEach((btn) => {
        btn.addEventListener("click", async () => {
          await updateCartItem(btn.dataset.key, 1);
        });
      });
      itemsEl.querySelectorAll(".cart-remove-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          await removeCartItem(btn.dataset.key);
        });
      });

    } catch (e) {
      console.warn("[MockupEditor] Cart refresh error:", e);
    }
  }

  /** Update a cart item's quantity by delta (+1 or -1) */
  async function updateCartItem(key, delta) {
    try {
      // Get current cart to find the item
      const cartRes = await fetch("/cart.js", { headers: { Accept: "application/json" } });
      if (!cartRes.ok) return;
      const cart = await cartRes.json();
      const item = cart.items.find((i) => i.key === key);
      if (!item) return;
      const newQty = Math.max(0, item.quantity + delta);
      await fetch("/cart/change.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: key, quantity: newQty }),
      });
      await refreshSidebarCart();
    } catch (e) {
      console.warn("[MockupEditor] Cart update error:", e);
    }
  }

  /** Remove a cart item and its associated fee items */
  async function removeCartItem(key) {
    try {
      // Get current cart to find linked fee items
      const cartRes = await fetch("/cart.js", { headers: { Accept: "application/json" } });
      if (!cartRes.ok) return;
      const cart = await cartRes.json();

      function getPropVal(item, propName) {
        if (!item.properties) return null;
        if (Array.isArray(item.properties)) {
          const p = item.properties.find((pr) => pr.name === propName);
          return p ? p.value : null;
        }
        return item.properties[propName] || null;
      }

      const mainItem = cart.items.find((i) => i.key === key);
      const updates = { [key]: 0 };

      // If this is a mockup product item, also remove associated fee items
      if (mainItem) {
        const productType = getPropVal(mainItem, "_product_type");
        if (productType) {
          for (const fi of cart.items) {
            if (getPropVal(fi, "_fee_for") === productType) {
              updates[fi.key] = 0;
            }
          }
        }
      }

      await fetch("/cart/update.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      await refreshSidebarCart();
    } catch (e) {
      console.warn("[MockupEditor] Cart remove error:", e);
    }
  }

  // ===== Init =====
  async function init() {
    console.log("[MockupEditor] Init, APP_URL:", APP_URL, "quoteMode:", QUOTE_MODE);
    document.body.classList.add("has-mockup-editor");
    if (QUOTE_MODE) document.body.classList.add("has-mockup-quote-mode");
    try {
      await loadConfig();
      await loadAllShopifyProducts();
      if (!QUOTE_MODE) await refreshSidebarCart();
    } catch (e) {
      console.error("[MockupEditor] Init error:", e);
    } finally {
      applyQuoteModeChrome();
      bindNavigation();
      if (!QUOTE_MODE) bindCheckoutGuard();
      renderWorkspace();
    }
  }

  function applyQuoteModeChrome() {
    if (!QUOTE_MODE) return;
    const heading = document.querySelector(".order-rail-header h2");
    const summary = document.querySelector(".order-rail-header .bento-section-summary");
    if (heading) heading.textContent = "Your quote";
    if (summary) summary.textContent = "Pick options, then request a quote.";
    const glance = document.querySelector(".order-cart-glance");
    if (glance) glance.style.display = "none";
    const links = document.querySelector(".order-cart-links");
    if (links) links.style.display = "none";
    const btn = document.getElementById("btn-add-to-cart");
    if (btn) btn.textContent = "Request a quote";
  }

  function fetchWithTimeout(url, options = {}, ms = 8000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    return fetch(url, { ...options, signal: controller.signal }).finally(() =>
      clearTimeout(timer),
    );
  }

  // ===== Load app config =====
  async function loadConfig() {
    const bust = `t=${Date.now()}`;
    // Prefer direct app URL first — app proxy can hang and block the UI.
    const urls = [
      APP_URL ? `${APP_URL}/api/mockup-config?${bust}` : null,
      `/apps/mockup/api/mockup-config?${bust}`,
    ].filter(Boolean);

    for (const url of urls) {
      try {
        const res = await fetchWithTimeout(url, {
          cache: "no-store",
          headers: { Pragma: "no-cache", "Cache-Control": "no-cache" },
        }, 8000);
        if (!res.ok) continue;
        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("json")) continue;
        const data = await res.json();
        if (data && data.products) {
          config = data;
          console.log("[MockupEditor] Config loaded, products:", data.products.length);
          return;
        }
      } catch (e) {
        console.warn("[MockupEditor] Config fetch error:", url, e);
      }
    }
    console.warn("[MockupEditor] Config failed to load from all URLs");
  }

  // ===== Load Shopify product data for all configured products =====
  async function loadAllShopifyProducts() {
    if (!config || !Array.isArray(config.products)) return;
    // Fetch all storefront products (up to 250) to match against our config
    try {
      const res = await fetchWithTimeout(PRODUCTS_URL, {}, 8000);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.products) return;

      // Build a lookup by numeric ID
      const shopifyById = {};
      data.products.forEach((p) => {
        shopifyById[p.id] = p;
      });

      // Match each configured product to its Shopify data
      for (const cp of config.products) {
        if (!cp.shopifyProductId) continue;
        // Extract numeric ID from gid://shopify/Product/123456
        const numId = parseInt(String(cp.shopifyProductId).replace(/\D/g, ""), 10);
        const sp = shopifyById[numId];
        if (!sp) continue;

        shopifyProductData[cp.shopifyProductId] = {
          handle: sp.handle,
          options: (sp.options || []).map((o) => ({ name: o.name, values: o.values })),
          variants: (sp.variants || []).map((v) => ({
            id: v.id,
            title: v.title,
            price: Math.round(parseFloat(v.price) * 100),
            option1: v.option1,
            option2: v.option2,
            option3: v.option3,
            available: v.available,
          })),
        };
      }

      console.log("[MockupEditor] Shopify products matched:", Object.keys(shopifyProductData).length);
    } catch (e) {
      console.warn("[MockupEditor] Failed to load Shopify products:", e);
    }
  }

  // ===== One-page workspace navigation =====
  function bindNavigation() {
    on("btn-add-to-cart", "click", handleAddToCart);
    bindDesignModalChrome();
    bindLifestyleZoomChrome();

    document.querySelectorAll(".progress-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const targetId = chip.dataset.scrollTarget;
        if (targetId === "order-summary" && window.matchMedia("(max-width: 1024px)").matches) {
          setOrderSheetOpen(true);
          return;
        }
        const target = document.getElementById(targetId);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    on("mobile-order-toggle", "click", () => setOrderSheetOpen(true));
    on("order-sheet-close", "click", () => setOrderSheetOpen(false));
    on("order-sheet-backdrop", "click", () => setOrderSheetOpen(false));

    const rail = document.getElementById("order-summary");
    if (rail) {
      rail.addEventListener("keydown", (event) => {
        if (!orderSheetOpen) return;
        if (event.key === "Escape") {
          event.preventDefault();
          setOrderSheetOpen(false);
          return;
        }
        if (event.key !== "Tab") return;
        const focusable = Array.from(rail.querySelectorAll(
          'button:not([disabled]), a[href], select:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )).filter((el) => !el.hidden && el.offsetParent !== null);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
    }

    window.addEventListener("resize", syncOrderSheetAccessibility);
  }

  function on(id, event, handler) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
  }

  function ensureWorkspaceDefaults() {
    if (!selectedProduct) return;
    for (const view of getActiveViews()) {
      if (!selectedSizes[view]) {
        const sizes = getSizesForView(view);
        const defaultSize = sizes.find((s) => s.isDefault) || sizes[0];
        if (defaultSize) selectedSizes[view] = defaultSize.id;
      }
    }
    const data = getSelectedShopifyData();
    if (data && Object.keys(selectedOptions).length === 0) {
      data.options.forEach((opt) => {
        if (opt.values.length === 0) return;
        if (/^colou?r$/i.test(String(opt.name || "").trim())) {
          selectedOptions[opt.name] =
            pickPreferredColorValue(opt.values) || opt.values[0];
        } else {
          selectedOptions[opt.name] = opt.values[0];
        }
      });
    }
    // Always ensure a Color selection exists so all generated swatches can drive lifestyle.
    const swatchPack = getColorSwatchChoices();
    if (swatchPack && selectedOptions[swatchPack.colorName] == null) {
      const preferred = swatchPack.choices.find((c) => c.slug === "black")
        || swatchPack.choices.find((c) => c.slug === "white")
        || swatchPack.choices[0];
      if (preferred) selectedOptions[swatchPack.colorName] = preferred.value;
    }
    const colorSlug = getActiveLifestyleColorSlug();
    if (colorSlug) lastPopularLifestyleColor = colorSlug;
    const moq = selectedProduct.minOrderQty || 1;
    if (!Number.isFinite(lineQty) || lineQty < moq) lineQty = moq;
  }

  function renderWorkspace() {
    ensureWorkspaceDefaults();
    renderStep1();
    renderStep2();
    renderPlacementPreviews();
    renderLifestyleGallery();
    renderOrderSummary();
    updateBentoState();
    renderProgressRail();
    updateMobileOrderBar();
    syncOrderSheetAccessibility();
  }

  function renderDesignWorkspace() {
    ensureWorkspaceDefaults();
    renderStep2();
    renderPlacementPreviews();
    renderLifestyleGallery();
    renderOrderSummary();
    updateBentoState();
    renderProgressRail();
    updateMobileOrderBar();
  }

  /** Soft next-step cue — no scroll/jump. Progress chips still scroll on click. */
  function cueNextSection(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.classList.remove("is-attention");
    void target.offsetWidth;
    target.classList.add("is-attention");
    window.setTimeout(() => target.classList.remove("is-attention"), 1600);
  }

  function renderProgressRail() {
    const activeViews = getActiveViews();
    const printArtReady = activeViews.length > 0 && allActiveViewsUploaded();
    // Chips: Product, Design, Order
    const states = [
      !!selectedProduct,
      printArtReady,
      cartLines.length > 0,
    ];
    let currentIndex = states.findIndex((state) => !state);
    if (currentIndex < 0) currentIndex = states.length - 1;
    document.querySelectorAll(".progress-chip").forEach((chip, index) => {
      chip.classList.toggle("is-complete", states[index]);
      chip.classList.toggle("is-current", index === currentIndex);
      if (index === currentIndex) chip.setAttribute("aria-current", "step");
      else chip.removeAttribute("aria-current");
    });
  }

  function updateBentoState() {
    const activeViews = getActiveViews();
    const uploadedCount = activeViews.filter((view) => uploadedFiles[view]).length;
    const productTile = document.getElementById("bento-product");
    const printArtTile = document.getElementById("bento-print-art");
    const placementBlock = document.getElementById("bento-placement");
    const lifestyleTile = document.getElementById("bento-lifestyle");
    const printArtReady = activeViews.length > 0 && uploadedCount === activeViews.length;
    const activeSideUploaded = !!uploadedFiles[activeDesignSide];
    const nextTarget = !selectedProduct
      ? "bento-product"
      : !printArtReady || cartLines.length === 0
        ? "bento-print-art"
        : "order-summary";

    productTile?.classList.toggle("is-complete", !!selectedProduct);
    printArtTile?.classList.toggle("is-locked", !selectedProduct);
    printArtTile?.classList.toggle("is-complete", printArtReady);
    placementBlock?.classList.toggle("is-locked", !activeSideUploaded);
    placementBlock?.classList.toggle("is-complete", activeSideUploaded);
    lifestyleTile?.classList.toggle("is-complete", uploadedCount > 0);
    printArtTile?.setAttribute("aria-disabled", String(!selectedProduct));
    placementBlock?.setAttribute("aria-disabled", String(!activeSideUploaded));

    [productTile, printArtTile, document.getElementById("order-summary")]
      .forEach((tile) => tile?.classList.toggle("is-next", tile?.id === nextTarget));

    const productSummary = document.getElementById("product-section-summary");
    if (productSummary) {
      productSummary.hidden = !!selectedProduct;
      productSummary.textContent = "Choose one to start.";
    }
    const printArtSummary = document.getElementById("print-art-section-summary");
    if (printArtSummary) {
      if (!selectedProduct) {
        printArtSummary.textContent = "Pick a product first.";
      } else if (uploadedCount === 0) {
        printArtSummary.textContent = "Upload Front or Back, then adjust placement anytime.";
      } else if (uploadedCount === activeViews.length) {
        printArtSummary.textContent = "Art ready — review the mockup, then add it to your order.";
      } else {
        printArtSummary.textContent = `${uploadedCount}/${activeViews.length} sides uploaded · open a button to continue`;
      }
    }
    const lifestyleSummary = document.getElementById("lifestyle-section-summary");
    if (lifestyleSummary) {
      if (!selectedProduct) {
        lifestyleSummary.textContent = "Pick a product to preview.";
      } else if (uploadedCount === 0) {
        lifestyleSummary.textContent = "Your design appears here automatically.";
      } else {
        const liveViews = activeViews.filter((view) => uploadedFiles[view]).map(capitalize);
        lifestyleSummary.textContent = `${liveViews.join(" + ")} art live`;
      }
    }

    const lifestyleEmpty = document.getElementById("lifestyle-empty");
    if (lifestyleEmpty) lifestyleEmpty.hidden = true;
  }

  function updateMobileOrderBar() {
    const count = document.getElementById("mobile-order-count");
    const total = document.getElementById("mobile-order-total");
    const button = document.getElementById("mobile-order-toggle");
    const totals = getCartTotals();
    if (count) {
      count.textContent = totals.totalQty > 0
        ? `${totals.totalQty} in draft`
        : "No draft items";
    }
    if (total) total.textContent = formatMoney(totals.finalCents);
    if (button) button.textContent = totals.totalQty > 0 ? "Review & add" : "Review order";
  }

  function setOrderSheetOpen(open) {
    orderSheetOpen = !!open;
    const rail = document.getElementById("order-summary");
    const backdrop = document.getElementById("order-sheet-backdrop");
    const toggle = document.getElementById("mobile-order-toggle");
    if (orderSheetOpen) orderSheetPreviousFocus = document.activeElement;
    rail?.classList.toggle("is-open", orderSheetOpen);
    if (backdrop) backdrop.hidden = !orderSheetOpen;
    if (toggle) toggle.setAttribute("aria-expanded", String(orderSheetOpen));
    document.body.classList.toggle("mockup-order-sheet-open", orderSheetOpen);
    syncOrderSheetAccessibility();
    if (orderSheetOpen) {
      requestAnimationFrame(() => document.getElementById("order-sheet-close")?.focus());
    } else if (orderSheetPreviousFocus && typeof orderSheetPreviousFocus.focus === "function") {
      orderSheetPreviousFocus.focus();
    }
  }

  function syncOrderSheetAccessibility() {
    const rail = document.getElementById("order-summary");
    if (!rail) return;
    const mobile = window.matchMedia("(max-width: 1024px)").matches;
    const hidden = mobile && !orderSheetOpen;
    rail.setAttribute("aria-hidden", String(hidden));
    rail.inert = hidden;
  }

  function getViewGarmentImage(view) {
    if (!selectedProduct) return "";
    if (view === "front") return selectedProduct.frontImageUrl || selectedProduct.shopifyProductImage || "";
    if (view === "back") return selectedProduct.backImageUrl || "";
    if (view === "side") return selectedProduct.sideImageUrl || "";
    return selectedProduct.frontImageUrl || selectedProduct.shopifyProductImage || "";
  }

  function getProductPrintViews() {
    if (!selectedProduct) return [];
    const order = ["front", "back", "side"];
    const seen = new Set();
    const views = [];
    selectedProduct.printAreas.forEach((pa) => {
      const view = pa.location && pa.location.view;
      if (!view || seen.has(view)) return;
      seen.add(view);
      views.push(view);
    });
    return views.sort((a, b) => {
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }

  function getDesignSideViews() {
    const views = getProductPrintViews();
    const primary = views.filter((view) => view === "front" || view === "back");
    return primary.length > 0 ? primary : views;
  }

  function ensureActiveDesignSide(views = getDesignSideViews()) {
    if (!views.length) return null;
    if (!views.includes(activeDesignSide)) {
      activeDesignSide = views.includes("front") ? "front" : views[0];
    }
    return activeDesignSide;
  }

  function getDesignSideStatus(view) {
    if (uploadedFiles[view]) return "Art ready";
    if (selectedLocations[view]) return "Upload art";
    return "Not printing";
  }

  function buildLocationOptionsHtml(view, items) {
    const viewImg = getViewGarmentImage(view);
    const selectedSlug = selectedLocations[view];
    return `<div class="location-options">
      ${items.map((item) => {
        const loc = item.location;
        const b = item.bounds;
        const isSelected = selectedSlug === loc.slug;
        const previewHtml = viewImg ? `<div class="loc-preview-wrap">
          <img class="loc-preview-img" src="${escapeHtml(viewImg)}" alt="" />
          ${b ? `<span class="loc-preview-logo" style="top:${(b.y * 100).toFixed(1)}%;left:${(b.x * 100).toFixed(1)}%;width:${(b.width * 100).toFixed(1)}%;height:${(b.height * 100).toFixed(1)}%;">Logo</span>` : ""}
        </div>` : "";
        return `<button type="button" class="location-btn has-preview ${isSelected ? "selected" : ""}" data-view="${escapeHtml(view)}" data-slug="${escapeHtml(loc.slug)}" aria-pressed="${isSelected}">
          ${previewHtml}
          <span class="loc-btn-name">${escapeHtml(loc.name)}</span>
        </button>`;
      }).join("")}
      <button type="button" class="location-btn has-preview ${!selectedSlug ? "selected" : ""}" data-view="${escapeHtml(view)}" data-slug="" aria-pressed="${!selectedSlug}">
        ${viewImg ? `<div class="loc-preview-wrap"><img class="loc-preview-img" src="${escapeHtml(viewImg)}" alt="" /><span class="loc-preview-none">✕</span></div>` : ""}
        <span class="loc-btn-name">None</span>
      </button>
    </div>`;
  }

  function buildUploadZoneHtml(view, activeViews) {
    const locName = getLocationName(view);
    const label = locName ? `Upload · ${locName}` : `Upload ${capitalize(view)}`;
    const hasFile = uploadedFiles[view];
    const error = uploadErrors[view] || "";
    const sizes = getSizesForView(view);
    const selectedSize = getSelectedSize(view);

    let sizeHtml = "";
    if (sizes.length > 0) {
      sizeHtml = `<fieldset class="size-selector" data-view="${view}">
        <legend class="size-selector-label">Print size</legend>
        <div class="size-options">
          ${sizes.map((s) => {
            const isActive = selectedSize && selectedSize.id === s.id;
            const priceTag = s.extraPriceCents > 0 ? ` +${formatMoney(s.extraPriceCents)}` : "";
            const sizeText = s.label ? `${s.name} (${s.label})` : s.name;
            return `<button type="button" class="size-btn ${isActive ? "selected" : ""}" data-view="${view}" data-size-id="${s.id}" aria-pressed="${isActive}">${sizeText}${priceTag}</button>`;
          }).join("")}
        </div>
      </fieldset>`;
    }

    const copyActions = hasFile
      ? activeViews
          .filter((otherView) => otherView !== view && !uploadedFiles[otherView])
          .map((otherView) => `<button type="button" class="upload-secondary-action" data-copy-artwork-from="${view}" data-copy-artwork-to="${otherView}">Use for ${capitalize(otherView)} too</button>`)
          .join("")
      : "";

    return `<article class="upload-zone ${hasFile ? "has-file" : "needs-file"} ${error ? "has-error" : ""}" data-view="${view}">
      <div class="upload-drop-target" data-drop-view="${view}" role="button" tabindex="0" aria-labelledby="upload-title-${view}">
        <div class="upload-zone-media">
          ${hasFile
            ? `<img class="upload-preview" id="preview-${view}" src="" alt="Uploaded design" />`
            : `<svg class="upload-zone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>`}
        </div>
        <div class="upload-zone-body">
          <h3 id="upload-title-${view}">${escapeHtml(hasFile ? label : `2 · ${label}`)}</h3>
          ${hasFile
            ? `<p class="upload-file-name">${escapeHtml(hasFile.name || "Ready")}</p><div class="analysis-container" id="analysis-${view}"></div>`
            : `<p class="upload-zone-text">Tap Upload and choose your logo</p><p class="upload-zone-hint">PNG from Files / Downloads works best — not a screenshot</p>`}
          ${error ? `<p class="upload-inline-error" role="alert">${escapeHtml(error)}</p>` : ""}
          <div class="upload-zone-actions">
            <label class="upload-zone-trigger ${hasFile ? "" : "is-primary-cta"}" for="artwork-file-${view}">${hasFile ? "Change" : "Upload logo"}</label>
            ${hasFile ? `<button type="button" class="upload-secondary-action upload-remove" data-remove-artwork="${view}">Remove</button>` : ""}
            ${copyActions}
          </div>
        </div>
      </div>
      ${sizeHtml}
      <!-- Extension-only accept (no image/*) so mobile opens Files / Documents instead of Photos -->
      <input class="upload-file-input" id="artwork-file-${view}" type="file" accept=".png,.jpg,.jpeg,.svg,.webp,.bmp,.tiff,.tif,image/png,image/jpeg,image/svg+xml,image/webp" data-view="${view}" />
    </article>`;
  }

  function bindUploadZoneInteractions(container) {
    const openFilePicker = (view) => {
      const input = document.getElementById(`artwork-file-${view}`);
      if (!input) return;
      // Prefer document picker on phones (image/* forces Photo Library on iOS).
      if (window.matchMedia("(max-width: 1024px)").matches) {
        input.setAttribute(
          "accept",
          ".png,.jpg,.jpeg,.svg,.webp,.bmp,.tiff,.tif",
        );
      }
      input.removeAttribute("capture");
      // iOS requires a clean value reset so re-picking the same file works
      input.value = "";
      input.click();
    };

    container.querySelectorAll(".upload-file-input").forEach((input) => {
      input.addEventListener("change", async (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) await handleArtworkFile(e.target.dataset.view, file);
      });
    });

    container.querySelectorAll("[data-drop-view]").forEach((dropTarget) => {
      const view = dropTarget.dataset.dropView;
      const openFromGesture = (event) => {
        // Don't steal taps from Remove / copy actions
        if (event.target.closest("button, a, label, input, select, textarea")) return;
        event.preventDefault();
        openFilePicker(view);
      };
      dropTarget.addEventListener("click", openFromGesture);
      dropTarget.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openFilePicker(view);
        }
      });
      ["dragenter", "dragover"].forEach((eventName) => {
        dropTarget.addEventListener(eventName, (event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
          dropTarget.classList.add("is-dragging");
        });
      });
      ["dragleave", "drop"].forEach((eventName) => {
        dropTarget.addEventListener(eventName, (event) => {
          event.preventDefault();
          dropTarget.classList.remove("is-dragging");
        });
      });
      dropTarget.addEventListener("drop", async (event) => {
        const file = event.dataTransfer.files && event.dataTransfer.files[0];
        if (file) await handleArtworkFile(view, file);
      });
    });

    container.querySelectorAll("[data-remove-artwork]").forEach((button) => {
      button.addEventListener("click", async () => {
        const view = button.dataset.removeArtwork;
        if (cartLines.length > 0) {
          const proceed = await confirmDiscardWork(
            `Remove ${capitalize(view)} art?`,
            "This also clears related draft items.",
          );
          if (!proceed) return;
          cartLines = [];
        }
        delete uploadedFiles[view];
        delete uploadErrors[view];
        delete imageAnalysis[view];
        revokePlacementAsset(view);
        delete designDrawInfo[view];
        delete placementReviewed[view];
        designOffsets[view] = { dx: 0, dy: 0 };
        designScales[view] = 1;
        placementEditorOpen[view] = false;
        orderStatus = null;
        const previewContainer = document.getElementById("preview-container");
        if (previewContainer) delete previewContainer.dataset.viewsKey;
        renderDesignWorkspace();
      });
    });

    container.querySelectorAll("[data-copy-artwork-from]").forEach((button) => {
      button.addEventListener("click", () => {
        const from = button.dataset.copyArtworkFrom;
        const to = button.dataset.copyArtworkTo;
        if (!uploadedFiles[from] || !to) return;
        uploadedFiles[to] = uploadedFiles[from];
        if (imageAnalysis[from]) imageAnalysis[to] = { ...imageAnalysis[from] };
        delete uploadErrors[to];
        revokePlacementAsset(to);
        designOffsets[to] = { dx: 0, dy: 0 };
        designScales[to] = 1;
        placementEditorOpen[to] = false;
        delete placementReviewed[to];
        delete designDrawInfo[to];
        const previewContainer = document.getElementById("preview-container");
        if (previewContainer) delete previewContainer.dataset.viewsKey;
        renderDesignWorkspace();
        if (allActiveViewsUploaded()) {
          window.setTimeout(() => cueNextSection("bento-print-art"), 120);
        }
      });
    });

    container.querySelectorAll(".size-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        if (selectedSizes[btn.dataset.view] === btn.dataset.sizeId) return;
        if (cartLines.length > 0) {
          const proceed = await confirmDiscardWork(
            "Change print size?",
            "This clears your draft items (price changes).",
          );
          if (!proceed) return;
          cartLines = [];
          orderStatus = null;
        }
        selectedSizes[btn.dataset.view] = btn.dataset.sizeId;
        renderStep2();
        renderPlacementPreviews();
        renderOrderSummary();
        updateBentoState();
        renderProgressRail();
        updateMobileOrderBar();
      });
    });
  }

  // ===== Step 1: Product =====
  function renderStep1() {
    const productBtns = document.getElementById("product-buttons");
    if (!productBtns) return;

    if (!config || !config.products || config.products.length === 0) {
      productBtns.innerHTML = '<div class="loading-placeholder">No products yet. Refresh or check the app URL.</div>';
      return;
    }

    if (selectedProduct && !productPickerExpanded) {
      const imgUrl = selectedProduct.frontImageUrl || selectedProduct.shopifyProductImage || "";
      productBtns.classList.add("is-collapsed");
      productBtns.innerHTML = `<div class="selected-product-compact">
        <div class="selected-product-identity">
          ${imgUrl ? `<img class="selected-product-thumb" src="${escapeHtml(imgUrl)}" alt="" />` : ""}
          <div>
            <span class="selected-product-label">Product</span>
            <strong>${escapeHtml(selectedProduct.name)}</strong>
          </div>
        </div>
        <button type="button" class="compact-change-btn" data-change-product>Change</button>
      </div>`;
      productBtns.querySelector("[data-change-product]")?.addEventListener("click", () => {
        productPickerExpanded = true;
        renderStep1();
      });
      return;
    }

    productBtns.classList.remove("is-collapsed");
    productBtns.innerHTML = config.products
      .map((p) => {
        const imgUrl = p.frontImageUrl || p.shopifyProductImage || "";
        const isSelected = selectedProduct && selectedProduct.id === p.id;
        return `<button type="button" class="product-btn ${isSelected ? "selected" : ""}" data-id="${escapeHtml(p.id)}" aria-pressed="${!!isSelected}">
          ${imgUrl ? `<img class="product-btn-img" src="${escapeHtml(imgUrl)}" alt="" />` : `<div class="product-btn-placeholder" aria-hidden="true"></div>`}
          <span class="product-btn-name">${escapeHtml(p.name)}</span>
        </button>`;
      })
      .join("");

    productBtns.querySelectorAll(".product-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextProduct = config.products.find((p) => p.id === btn.dataset.id);
        if (!nextProduct) return;
        if (selectedProduct && selectedProduct.id === nextProduct.id) {
          productPickerExpanded = false;
          renderStep1();
          return;
        }

        const prevProduct = selectedProduct;
        selectedProduct = nextProduct;
        // Keep artwork, analysis, offsets, and scales — remap locations/sizes.
        adaptDesignStateForProduct(prevProduct, nextProduct);
        // Draft lines / variant options are product-specific.
        cartLines = [];
        selectedOptions = {};
        const moq = selectedProduct.minOrderQty || 1;
        if (lineQty < moq) lineQty = moq;
        orderStatus = null;
        lifestyleImageCache = {};
        productPickerExpanded = false;
        placementEditorOpen = {};
        placementReviewed = {};
        Object.keys(_baseImageCache).forEach((k) => delete _baseImageCache[k]);
        const previewContainer = document.getElementById("preview-container");
        if (previewContainer) delete previewContainer.dataset.viewsKey;
        locationPickerExpanded = {};
        getDesignSideViews().forEach((view) => {
          locationPickerExpanded[view] = !selectedLocations[view];
        });
        prefetchLifestylePlates();
        renderWorkspace();

        window.setTimeout(() => cueNextSection("bento-print-art"), 80);
      });
    });
  }

  function getUploadHudStepCue(view) {
    if (uploadedFiles[view]) return "Step 3 · Pick a print size, then tap Done";
    if (selectedLocations[view]) return "Step 2 · Upload your logo file next";
    return "Step 1 · Choose where it prints";
  }

  function buildPrintUploadColHtml(view, items, activeViews) {
    const selectedSlug = selectedLocations[view];
    const hasSpot = !!selectedSlug;
    const pickerExpanded = locationPickerExpanded[view] !== false;
    const hasFile = !!uploadedFiles[view];
    const locationBlock = pickerExpanded
      ? `<div class="location-picker">
          <p class="location-picker-label">1 · Where should we print?</p>
          ${buildLocationOptionsHtml(view, items)}
        </div>`
      : `<div class="selected-location-compact">
          <div>
            <span class="selected-location-label">${hasSpot ? "Print area" : capitalize(view)}</span>
            <strong>${hasSpot ? escapeHtml(getLocationName(view)) : `Not printing ${view}`}</strong>
          </div>
          <button type="button" class="compact-change-btn" data-edit-location="${escapeHtml(view)}">${hasSpot ? "Change" : `Add ${view}`}</button>
        </div>`;

    return `<section class="print-upload-col ${hasSpot ? "has-spot" : "is-waiting"} ${pickerExpanded ? "is-choosing-location" : "has-compact-location"} ${hasSpot && !hasFile ? "is-awaiting-upload" : ""}" data-view="${escapeHtml(view)}">
      <p class="design-hud-step-cue" aria-live="polite">${escapeHtml(getUploadHudStepCue(view))}</p>
      <div class="location-group">
        ${locationBlock}
      </div>
      ${hasSpot ? `<div class="print-upload-slot ${hasFile ? "" : "is-next-step"}">${buildUploadZoneHtml(view, activeViews)}</div>` : `<div class="print-upload-waiting"><p class="print-upload-waiting-title">Pick a print area first</p><p class="print-upload-waiting-text">Then you’ll upload your logo here.</p></div>`}
    </section>`;
  }

  function getUploadActionLabel(view) {
    if (uploadedFiles[view]) return `Edit ${capitalize(view)}`;
    return `Upload ${capitalize(view)}`;
  }

  function getPrimaryDesignView(views = getDesignSideViews()) {
    if (views.includes("front")) return "front";
    return views[0] || null;
  }

  /** Next action key the user should take: `upload:front` | `place` | null */
  function getNextDesignActionKey(views = getDesignSideViews()) {
    if (!selectedProduct || !views.length) return null;
    const primary = getPrimaryDesignView(views);

    if (primary) {
      if (!selectedLocations[primary]) return `upload:${primary}`;
      if (!uploadedFiles[primary]) return `upload:${primary}`;
    }

    const uploaded = views.filter((view) => uploadedFiles[view]);
    if (uploaded.length && uploaded.some((view) => !placementReviewed[view])) {
      return "place";
    }

    for (const view of views) {
      if (view === primary) continue;
      if (selectedLocations[view] && !uploadedFiles[view]) return `upload:${view}`;
    }

    return null;
  }

  function getUploadActionMeta(view, nextKey) {
    const key = `upload:${view}`;
    const isNext = nextKey === key;
    const primary = getPrimaryDesignView();

    if (uploadedFiles[view]) {
      return {
        text: placementReviewed[view] ? "Art ready" : "Ready to place",
        tone: "ready",
        pulse: false,
      };
    }

    if (selectedLocations[view]) {
      return {
        text: isNext ? "Upload logo now" : "Needs logo",
        tone: "need",
        pulse: isNext,
      };
    }

    if (view === primary || isNext) {
      return {
        text: isNext ? "Pick print area" : "Start here",
        tone: isNext ? "need" : "idle",
        pulse: isNext,
      };
    }

    return {
      text: "Optional",
      tone: "idle",
      pulse: false,
    };
  }

  function getPlaceActionMeta(views, nextKey) {
    const uploaded = views.filter((view) => uploadedFiles[view]);
    if (!uploaded.length) {
      return {
        text: "Upload first",
        tone: "idle",
        pulse: false,
        disabled: true,
        label: "Place art",
      };
    }

    const needsReview = uploaded.some((view) => !placementReviewed[view]);
    const isNext = nextKey === "place";

    if (needsReview || isNext) {
      return {
        text: isNext ? "Place your art now" : "Needs placement",
        tone: "need",
        pulse: isNext,
        disabled: false,
        label: "Place art",
      };
    }

    return {
      text: "Looks good",
      tone: "ready",
      pulse: false,
      disabled: false,
      label: "Adjust placement",
    };
  }

  function getDesignHudAnchor() {
    const bar = document.getElementById("design-action-bar");
    if (!bar || !designModal) return bar;
    if (designModal.kind === "upload") {
      return bar.querySelector(`[data-open-upload="${designModal.view}"]`) || bar;
    }
    return bar.querySelector("[data-open-placement-modal]") || bar;
  }

  function positionDesignHud() {
    const hud = document.getElementById("design-modal");
    const host = document.getElementById("bento-lifestyle");
    if (!hud || !host || !designModal) return;

    const hostRect = host.getBoundingClientRect();
    const anchor = getDesignHudAnchor();
    const anchorRect = (anchor || host).getBoundingClientRect();
    const pad = 10;
    const gap = 8;
    const available = Math.max(220, hostRect.width - pad * 2);
    const hudWidth = Math.min(designModal.kind === "placement" ? 380 : 400, available);
    const rawLeft = anchorRect.left - hostRect.left;
    const maxLeft = Math.max(0, available - hudWidth);
    const left = Math.min(Math.max(0, rawLeft), maxLeft);
    const top = Math.max(pad, anchorRect.bottom - hostRect.top + gap);

    hud.style.setProperty("--hud-top", `${Math.round(top)}px`);
    hud.style.setProperty("--hud-left", `${Math.round(left)}px`);
    hud.style.setProperty("--hud-width", `${Math.round(hudWidth)}px`);
  }

  function syncDesignModalChrome() {
    const modal = document.getElementById("design-modal");
    const title = document.getElementById("design-modal-title");
    const sub = document.getElementById("design-modal-sub");
    const uploadPane = document.getElementById("design-modal-upload");
    const placePane = document.getElementById("design-modal-placement");
    const host = document.getElementById("bento-lifestyle");
    if (!modal) return;

    if (!designModal) {
      modal.classList.remove("is-open");
      host?.classList.remove("is-hud-open");
      uploadPane && (uploadPane.hidden = true);
      placePane && (placePane.hidden = true);
      window.setTimeout(() => {
        if (!designModal) modal.hidden = true;
      }, 180);
      return;
    }

    modal.hidden = false;
    host?.classList.add("is-hud-open");
    positionDesignHud();
    // Force a paint so the open transition runs even when reopening quickly.
    void modal.offsetWidth;
    requestAnimationFrame(() => {
      positionDesignHud();
      modal.classList.add("is-open");
    });

    if (designModal.kind === "upload") {
      if (title) title.textContent = getUploadActionLabel(designModal.view);
      if (sub) sub.textContent = getUploadHudStepCue(designModal.view);
      if (uploadPane) uploadPane.hidden = false;
      if (placePane) placePane.hidden = true;
    } else {
      if (title) title.textContent = `Place ${capitalize(designModal.view)}`;
      if (sub) sub.textContent = "Drag to move · pull a corner to resize · then Done";
      if (uploadPane) uploadPane.hidden = true;
      if (placePane) placePane.hidden = false;
    }
  }

  function openDesignModal(kind, view, { toggle = false } = {}) {
    const views = getDesignSideViews();
    if (!views.includes(view) && kind === "upload") return;
    if (kind === "placement" && !uploadedFiles[view]) return;

    // Only action-bar buttons toggle closed. Internal flow (location pick, upload) stays open.
    if (toggle && designModal?.kind === kind && designModal?.view === view) {
      closeDesignModal();
      return;
    }

    if (lifestyleZoom) closeLifestyleZoom();

    const alreadyOpen = designModal?.kind === kind && designModal?.view === view;
    if (!alreadyOpen) {
      designModalPreviousFocus = document.activeElement;
    }
    activeDesignSide = view;
    designModal = { kind, view };
    if (kind === "placement") {
      placementEditorOpen[view] = true;
      placementReviewed[view] = true;
    }

    const previewContainer = document.getElementById("preview-container");
    if (previewContainer) delete previewContainer.dataset.viewsKey;

    renderStep2();
    renderPlacementPreviews();
    updateBentoState();
    syncDesignModalChrome();
    requestAnimationFrame(() => {
      positionDesignHud();
      if (!alreadyOpen) document.getElementById("design-modal-close")?.focus();
    });
  }

  function closeDesignModal() {
    if (!designModal) return;
    const closingView = designModal.view;
    if (designModal.kind === "placement") {
      placementEditorOpen[closingView] = false;
      placementReviewed[closingView] = true;
    }
    designModal = null;
    syncDesignModalChrome();

    const previewContainer = document.getElementById("preview-container");
    if (previewContainer) delete previewContainer.dataset.viewsKey;
    renderStep2();
    renderPlacementPreviews();
    updateBentoState();

    if (designModalPreviousFocus && typeof designModalPreviousFocus.focus === "function") {
      designModalPreviousFocus.focus();
    }
    designModalPreviousFocus = null;
  }

  function renderDesignActionBar() {
    const bar = document.getElementById("design-action-bar");
    if (!bar) return;

    if (!selectedProduct) {
      bar.innerHTML = '<div class="loading-placeholder">Pick a product first.</div>';
      return;
    }

    const views = getDesignSideViews();
    if (views.length === 0) {
      bar.innerHTML = '<div class="loading-placeholder">No print spots for this product.</div>';
      return;
    }

    ensureActiveDesignSide(views);
    const nextKey = getNextDesignActionKey(views);
    const placeView = uploadedFiles[activeDesignSide]
      ? activeDesignSide
      : (views.find((view) => uploadedFiles[view]) || views[0]);
    const placeMeta = getPlaceActionMeta(views, nextKey);

    bar.innerHTML = `
      <div class="design-action-buttons">
        ${views.map((view) => {
          const meta = getUploadActionMeta(view, nextKey);
          const classes = [
            "design-action-btn",
            meta.tone === "ready" ? "is-ready" : "",
            meta.tone === "need" ? "is-need" : "",
            meta.pulse ? "is-pulse" : "",
            designModal?.kind === "upload" && designModal.view === view ? "is-active" : "",
          ].filter(Boolean).join(" ");
          return `<button type="button" class="${classes}" data-open-upload="${escapeHtml(view)}" aria-expanded="${designModal?.kind === "upload" && designModal.view === view ? "true" : "false"}">
            <span class="design-action-btn-label">${escapeHtml(getUploadActionLabel(view))}</span>
            <span class="design-action-btn-status is-${meta.tone}${meta.pulse ? " is-pulse" : ""}">${escapeHtml(meta.text)}</span>
          </button>`;
        }).join("")}
        <button type="button" class="design-action-btn design-action-btn--place ${placeMeta.tone === "ready" ? "is-ready" : ""} ${placeMeta.tone === "need" ? "is-need" : ""} ${placeMeta.pulse ? "is-pulse" : ""} ${designModal?.kind === "placement" ? "is-active" : ""}" data-open-placement-modal="${escapeHtml(placeView)}" aria-expanded="${designModal?.kind === "placement" ? "true" : "false"}" ${placeMeta.disabled ? "disabled" : ""}>
          <span class="design-action-btn-label">${escapeHtml(placeMeta.label)}</span>
          <span class="design-action-btn-status is-${placeMeta.tone}${placeMeta.pulse ? " is-pulse" : ""}">${escapeHtml(placeMeta.text)}</span>
        </button>
      </div>
    `;

    bar.querySelectorAll("[data-open-upload]").forEach((btn) => {
      btn.addEventListener("click", () => openDesignModal("upload", btn.dataset.openUpload, { toggle: true }));
    });
    bar.querySelectorAll("[data-open-placement-modal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!uploadedFiles[btn.dataset.openPlacementModal]) return;
        openDesignModal("placement", btn.dataset.openPlacementModal, { toggle: true });
      });
    });

    if (designModal) {
      requestAnimationFrame(() => positionDesignHud());
    }
  }

  function bindDesignModalChrome() {
    const close = () => closeDesignModal();
    on("design-modal-close", "click", close);
    // Backdrop is visual only — closing mid-upload was too easy to do by accident.
    on("design-modal-done", "click", close);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && designModal) {
        event.preventDefault();
        closeDesignModal();
      }
    });
    window.addEventListener("resize", () => {
      if (designModal) positionDesignHud();
      if (lifestyleZoom) positionLifestyleZoomHud();
    });
  }

  // ===== Step 2: Mockup-first desk + upload/place modals =====
  function renderStep2() {
    const controlsRoot = document.getElementById("design-side-controls");
    renderDesignActionBar();
    syncDesignModalChrome();
    if (!controlsRoot) return;

    if (!selectedProduct) {
      controlsRoot.innerHTML = '<div class="loading-placeholder">Pick a product first.</div>';
      return;
    }

    const groups = {};
    selectedProduct.printAreas.forEach((pa) => {
      const view = pa.location.view;
      if (!groups[view]) groups[view] = [];
      groups[view].push({ location: pa.location, bounds: pa.bounds });
    });

    const views = getDesignSideViews();
    const activeViews = getActiveViews();
    if (views.length === 0) {
      controlsRoot.innerHTML = '<div class="loading-placeholder">No print spots for this product.</div>';
      return;
    }

    ensureActiveDesignSide(views);
    const modalView = designModal?.kind === "upload" ? designModal.view : activeDesignSide;
    controlsRoot.innerHTML = buildPrintUploadColHtml(
      modalView,
      groups[modalView] || [],
      activeViews,
    );

    controlsRoot.querySelectorAll("[data-edit-location]").forEach((button) => {
      button.addEventListener("click", () => {
        locationPickerExpanded[button.dataset.editLocation] = true;
        renderStep2();
      });
    });

    controlsRoot.querySelectorAll(".location-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const view = btn.dataset.view;
        const nextSlug = btn.dataset.slug || null;
        if (selectedLocations[view] === nextSlug) {
          locationPickerExpanded[view] = false;
          renderStep2();
          return;
        }

        const hadArt = !!uploadedFiles[view];
        const clearingSpot = !nextSlug;

        // Only clear art when removing the print area entirely.
        if (clearingSpot && hadArt) {
          const proceed = await confirmDiscardWork(
            `Remove ${capitalize(view)} print area?`,
            "This clears that side’s art.",
          );
          if (!proceed) return;
        } else if (cartLines.length > 0) {
          const proceed = await confirmDiscardWork(
            `Change ${capitalize(view)} location?`,
            hadArt
              ? "Your logo stays on this side. Draft cart items will be cleared."
              : "This clears draft cart items.",
          );
          if (!proceed) return;
        }

        if (clearingSpot) {
          delete uploadedFiles[view];
          delete uploadErrors[view];
          delete imageAnalysis[view];
          revokePlacementAsset(view);
          delete placementReviewed[view];
        }

        // Keep logo when switching spots — just re-center in the new print area.
        designOffsets[view] = { dx: 0, dy: 0 };
        designScales[view] = 1;
        delete designDrawInfo[view];
        if (hadArt && !clearingSpot) delete placementReviewed[view];

        if (cartLines.length > 0) {
          cartLines = [];
          orderStatus = null;
        }

        selectedLocations[view] = nextSlug;
        // Remap print size onto the new location’s size list (keep id if still valid).
        const prevSizeId = selectedSizes[view];
        const sizes = getSizesForView(view);
        if (prevSizeId && sizes.some((s) => s.id === prevSizeId)) {
          selectedSizes[view] = prevSizeId;
        } else {
          const fallback = sizes.find((s) => s.isDefault) || sizes[0];
          if (fallback) selectedSizes[view] = fallback.id;
          else delete selectedSizes[view];
        }

        locationPickerExpanded[view] = false;
        placementEditorOpen[view] = false;
        activeDesignSide = view;

        if (hadArt && !clearingSpot) {
          // Keep working with the same logo in Adjust placement.
          designModal = { kind: "placement", view };
        } else if (!designModal || designModal.kind !== "upload" || designModal.view !== view) {
          designModal = { kind: "upload", view };
        }

        const previewContainer = document.getElementById("preview-container");
        if (previewContainer) delete previewContainer.dataset.viewsKey;
        renderWorkspace();
        requestAnimationFrame(() => {
          positionDesignHud();
          if (!(hadArt && !clearingSpot)) {
            const uploadTrigger = document.querySelector(`#design-side-controls .upload-zone-trigger[for="artwork-file-${view}"]`);
            uploadTrigger?.classList.add("is-primary-cta");
            document.getElementById(`artwork-file-${view}`)?.closest(".upload-zone")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
          }
        });
      });
    });

    if (uploadedFiles[modalView]) {
      showPreviewImage(`preview-${modalView}`, uploadedFiles[modalView]);
      if (imageAnalysis[modalView]) renderAnalysisBadges(modalView);
    }

    bindUploadZoneInteractions(controlsRoot);
  }

  function scrollActivePlacementIntoView(view) {
    // Placement lives in the modal — open it after upload on any viewport.
    window.setTimeout(() => openDesignModal("placement", view), 180);
  }

  async function handleArtworkFile(view, file) {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp", "image/bmp", "image/tiff"];
    const allowedExts = [".png", ".jpg", ".jpeg", ".svg", ".webp", ".bmp", ".tiff", ".tif"];
    const lowerName = String(file.name || "").toLowerCase();
    const dotIndex = lowerName.lastIndexOf(".");
    const ext = dotIndex >= 0 ? lowerName.slice(dotIndex) : "";
    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      uploadErrors[view] = "Use a PNG, JPG, SVG, or WEBP file.";
      renderStep2();
      return;
    }

    delete uploadErrors[view];
    delete imageAnalysis[view];
    uploadedFiles[view] = file;
    revokePlacementAsset(view);
    designOffsets[view] = { dx: 0, dy: 0 };
    designScales[view] = 1;
    delete designDrawInfo[view];
    delete placementReviewed[view];
    activeDesignSide = view;
    placementEditorOpen[view] = false;
    const previewContainer = document.getElementById("preview-container");
    if (previewContainer) delete previewContainer.dataset.viewsKey;
    orderStatus = null;
    renderDesignWorkspace();
    scrollActivePlacementIntoView(view);
    window.setTimeout(() => cueNextSection("bento-print-art"), 80);

    const result = await analyzeImage(file);
    if (uploadedFiles[view] !== file) return;
    if (!result) {
      delete uploadedFiles[view];
      uploadErrors[view] = "Couldn’t open that file. Try another image.";
      revokePlacementAsset(view);
      if (previewContainer) delete previewContainer.dataset.viewsKey;
      renderDesignWorkspace();
      return;
    }
    imageAnalysis[view] = result;
    renderStep2();
    renderOrderSummary();
    updateBentoState();
  }

  // ===== Placement engine (smooth DOM transforms) =====

  function revokePlacementAsset(view) {
    const asset = placementAssets[view];
    if (asset && asset.designUrl) {
      try { URL.revokeObjectURL(asset.designUrl); } catch (e) {}
    }
    delete placementAssets[view];
    delete designDrawInfo[view];
  }

  function loadImageElement(src, { crossOrigin } = {}) {
    return new Promise((resolve) => {
      const img = new Image();
      if (crossOrigin) img.crossOrigin = crossOrigin;
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  /**
   * Trim transparent / near-white padding so padded PNGs don't look tiny.
   * Keep in sync with admin smartPrepareDesign (app.lifestyle-plates.tsx).
   */
  async function trimDesignImage(img) {
    if (!img || !img.naturalWidth || !img.naturalHeight) return img;

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return img;
    ctx.drawImage(img, 0, 0);

    let imageData;
    try {
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch (e) {
      return img;
    }

    const { data, width, height } = imageData;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    let opaque = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const a = data[i + 3];
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const isInk = a > 12 && !(r > 248 && g > 248 && b > 248 && a > 200);
        if (!isInk) continue;
        opaque += 1;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }

    if (opaque < 16 || maxX < minX || maxY < minY) return img;

    const pad = 2;
    const sx = Math.max(0, minX - pad);
    const sy = Math.max(0, minY - pad);
    const sw = Math.min(width - sx, maxX - minX + 1 + pad * 2);
    const sh = Math.min(height - sy, maxY - minY + 1 + pad * 2);
    if ((sw * sh) / (width * height) > 0.92) return img;

    const out = document.createElement("canvas");
    out.width = sw;
    out.height = sh;
    const outCtx = out.getContext("2d");
    if (!outCtx) return img;
    outCtx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
    const trimmed = await loadImageElement(out.toDataURL("image/png"));
    return trimmed || img;
  }

  function getImageSize(img) {
    if (!img) return { w: 0, h: 0 };
    const w = img.naturalWidth || img.width || 0;
    const h = img.naturalHeight || img.height || 0;
    return { w, h };
  }

  function getContainRect(imgW, imgH, boxW, boxH) {
    if (!imgW || !imgH) {
      return { x: 0, y: 0, w: boxW, h: boxH };
    }
    const scale = Math.min(boxW / imgW, boxH / imgH);
    const w = imgW * scale;
    const h = imgH * scale;
    return { x: (boxW - w) / 2, y: (boxH - h) / 2, w, h };
  }

  function getPrintBounds(view) {
    if (!selectedProduct) return { x: 0.2, y: 0.15, width: 0.6, height: 0.5 };
    const area = selectedProduct.printAreas.find(
      (pa) => pa.location.view === view && pa.location.slug === selectedLocations[view]
    );
    return area ? area.bounds : { x: 0.2, y: 0.15, width: 0.6, height: 0.5 };
  }

  /**
   * Per-location anchor + reference-edge profile.
   * Keep in sync with admin PLACEMENT_PROFILES (app.lifestyle-plates.tsx).
   * ax/ay = design-center UV inside the print area.
   * edge = which print-area edge sets 100% size (auto picks by aspect).
   * size = fraction of that edge at userScale 1.
   */
  function getPlacementProfile(view) {
    const slug = (selectedLocations[view] || "").toLowerCase();
    const name = (getLocationName(view) || "").toLowerCase();
    const key = `${slug} ${name}`;

    if (/\b(left|pocket)\b/.test(key) || /left[_-\s]?chest/.test(key)) {
      return { id: "left_chest", ax: 0.35, ay: 0.35, edge: "width", size: 0.7 };
    }
    if (/\bback\b/.test(key) || view === "back") {
      return { id: "full_back", ax: 0.5, ay: 0.48, edge: "height", size: 0.8 };
    }
    if (/\b(center|middle|full[_-\s]?front)\b/.test(key)) {
      return { id: "center", ax: 0.5, ay: 0.42, edge: "auto", size: 0.85 };
    }
    return { id: "default", ax: 0.5, ay: 0.5, edge: "auto", size: 0.75 };
  }

  function getDesignScale(view) {
    const s = designScales[view];
    return typeof s === "number" && s > 0 ? s : 1;
  }

  function clampDesignScale(s) {
    return Math.max(DESIGN_SCALE_MIN, Math.min(DESIGN_SCALE_MAX, s));
  }

  function computePlacementLayout(view, baseImg, designImg, boxW, boxH) {
    const baseSize = getImageSize(baseImg);
    const designSize = getImageSize(designImg);
    const base = baseSize.w && baseSize.h
      ? getContainRect(baseSize.w, baseSize.h, boxW, boxH)
      : { x: 0, y: 0, w: boxW, h: boxH };
    const bounds = getPrintBounds(view);
    const areaW = bounds.width * base.w;
    const areaH = bounds.height * base.h;
    const areaX = base.x + bounds.x * base.w;
    const areaY = base.y + bounds.y * base.h;
    const profile = getPlacementProfile(view);

    let fitW = areaW * profile.size;
    let fitH = areaH * profile.size;
    if (designSize.w && designSize.h) {
      const aspect = designSize.w / designSize.h;
      let edge = profile.edge;
      if (edge === "auto") edge = aspect >= 1 ? "width" : "height";

      if (edge === "width") {
        fitW = areaW * profile.size;
        fitH = fitW / aspect;
      } else {
        fitH = areaH * profile.size;
        fitW = fitH * aspect;
      }

      // Soft clamp: keep inside ~95% of print area without changing aspect
      const maxW = areaW * 0.95;
      const maxH = areaH * 0.95;
      if (fitW > maxW || fitH > maxH) {
        const clamp = Math.min(maxW / fitW, maxH / fitH);
        fitW *= clamp;
        fitH *= clamp;
      }
    }

    const userScale = getDesignScale(view);
    const designW = fitW * userScale;
    const designH = fitH * userScale;
    // Design center sits on the placement anchor (point of reference)
    const anchorX = areaX + profile.ax * areaW;
    const anchorY = areaY + profile.ay * areaH;
    const centeredX = anchorX - designW / 2;
    const centeredY = anchorY - designH / 2;
    const offset = designOffsets[view] || { dx: 0, dy: 0 };

    return {
      baseX: base.x, baseY: base.y, baseW: base.w, baseH: base.h,
      areaX, areaY, areaW, areaH,
      fitW, fitH, userScale,
      designW, designH,
      centeredX, centeredY,
      x: centeredX + offset.dx,
      y: centeredY + offset.dy,
      w: designW,
      h: designH,
      boxW, boxH,
      profileId: profile.id,
    };
  }

  function clampDesignOffset(view, dx, dy, layout) {
    if (!layout) return { dx, dy };
    const margin = Math.min(layout.designW, layout.designH) * 0.25;
    const minDx = -layout.centeredX - layout.designW + margin;
    const maxDx = layout.boxW - layout.centeredX - margin;
    const minDy = -layout.centeredY - layout.designH + margin;
    const maxDy = layout.boxH - layout.centeredY - margin;
    return {
      dx: Math.max(minDx, Math.min(maxDx, dx)),
      dy: Math.max(minDy, Math.min(maxDy, dy)),
    };
  }

  function isPlacementAdjusted(view) {
    const off = designOffsets[view];
    const moved = !!(off && (Math.abs(off.dx) > 0.5 || Math.abs(off.dy) > 0.5));
    const scaled = Math.abs(getDesignScale(view) - 1) > 0.01;
    return moved || scaled;
  }

  async function ensurePlacementAssets(view) {
    const file = uploadedFiles[view];
    if (!file || !selectedProduct) return null;

    const existing = placementAssets[view];
    if (existing && existing.fileRef === file && existing.designImg) {
      if (!existing.baseImg) {
        existing.baseImg = await loadProductBaseImage(view);
      }
      return existing;
    }

    revokePlacementAsset(view);

    const designUrl = URL.createObjectURL(file);
    let designImg = await loadImageElement(designUrl);
    if (!designImg) {
      try { URL.revokeObjectURL(designUrl); } catch (e) {}
      return null;
    }
    designImg = await trimDesignImage(designImg);
    // Layout uses the (possibly trimmed) bitmap — preview must show the same
    // image, or object-fit:fill will squash the original into the trimmed box.
    const displayUrl = (designImg && designImg.src) ? designImg.src : designUrl;
    if (displayUrl !== designUrl) {
      try { URL.revokeObjectURL(designUrl); } catch (e) {}
    }

    const baseImg = await loadProductBaseImage(view);
    const asset = { baseImg, designImg, designUrl: displayUrl, fileRef: file };
    placementAssets[view] = asset;
    return asset;
  }

  function getPlacementViewsKey() {
    return getUploadedViews()
      .map((v) => {
        const f = uploadedFiles[v];
        const loc = selectedLocations[v] || "";
        return f ? `${v}:${loc}:${f.name}:${f.size}:${f.lastModified}` : v;
      })
      .join("|");
  }

  function updatePlacementChrome(view) {
    const card = document.getElementById(`placement-card-${view}`);
    if (!card) return;
    const resetBtn = card.querySelector(".placement-reset");
    const status = card.querySelector(".placement-status");
    const readout = card.querySelector(".placement-scale-readout");
    const slider = card.querySelector(".placement-scale-slider");
    const scalePct = Math.round(getDesignScale(view) * 100);
    const adjusted = isPlacementAdjusted(view);
    if (resetBtn) resetBtn.disabled = !adjusted;
    if (status) {
      status.textContent = adjusted ? "Moved" : "Drag or pull a corner";
      status.classList.toggle("is-custom", adjusted);
    }
    if (readout) readout.textContent = `${scalePct}%`;
    if (slider && Number(slider.value) !== scalePct) slider.value = String(scalePct);
  }

  function getPlacementDisplayMetrics(surface) {
    const rect = surface.getBoundingClientRect();
    const displayW = rect.width || PREVIEW_W;
    const displayH = rect.height || PREVIEW_H;
    const scale = Math.min(displayW / PREVIEW_W, displayH / PREVIEW_H);
    return {
      scale,
      offsetX: (displayW - PREVIEW_W * scale) / 2,
      offsetY: (displayH - PREVIEW_H * scale) / 2,
    };
  }

  function applyPlacementPositions(view, { animate } = {}) {
    const surface = document.getElementById(`placement-surface-${view}`);
    const baseEl = document.getElementById(`placement-base-${view}`);
    const guideEl = document.getElementById(`placement-guide-${view}`);
    const wrapEl = document.getElementById(`placement-design-wrap-${view}`);
    const designEl = document.getElementById(`placement-design-${view}`);
    const asset = placementAssets[view];
    if (!surface || !wrapEl || !asset) return;

    const { scale, offsetX, offsetY } = getPlacementDisplayMetrics(surface);

    const layout = computePlacementLayout(view, asset.baseImg, asset.designImg, PREVIEW_W, PREVIEW_H);
    designDrawInfo[view] = layout;

    if (baseEl && asset.baseImg) {
      baseEl.style.display = "block";
      baseEl.style.setProperty("left", `${offsetX + layout.baseX * scale}px`, "important");
      baseEl.style.setProperty("top", `${offsetY + layout.baseY * scale}px`, "important");
      baseEl.style.setProperty("width", `${layout.baseW * scale}px`, "important");
      baseEl.style.setProperty("height", `${layout.baseH * scale}px`, "important");
      baseEl.style.setProperty("max-width", "none", "important");
      baseEl.style.setProperty("max-height", "none", "important");
      baseEl.style.setProperty("object-fit", "fill", "important");
    } else if (baseEl) {
      baseEl.style.display = "none";
    }

    if (guideEl) {
      guideEl.style.left = `${offsetX + layout.areaX * scale}px`;
      guideEl.style.top = `${offsetY + layout.areaY * scale}px`;
      guideEl.style.width = `${layout.areaW * scale}px`;
      guideEl.style.height = `${layout.areaH * scale}px`;
    }

    const displayW = layout.designW * scale;
    const displayH = layout.designH * scale;
    wrapEl.style.setProperty("width", `${displayW}px`, "important");
    wrapEl.style.setProperty("height", `${displayH}px`, "important");
    wrapEl.style.transition = animate ? "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), width 0.28s cubic-bezier(0.22, 1, 0.36, 1), height 0.28s cubic-bezier(0.22, 1, 0.36, 1)" : "none";
    wrapEl.style.transform = `translate3d(${offsetX + layout.x * scale}px, ${offsetY + layout.y * scale}px, 0)`;
    // Small logos: corner hit-boxes cover most of the art — mark compact for CSS + drag preference
    wrapEl.classList.toggle("is-compact", Math.min(displayW, displayH) < 72);
    if (designEl) {
      designEl.style.setProperty("width", "100%", "important");
      designEl.style.setProperty("height", "100%", "important");
      designEl.style.setProperty("max-width", "none", "important");
      designEl.style.setProperty("max-height", "none", "important");
      designEl.style.setProperty("object-fit", "fill", "important");
    }

    updatePlacementChrome(view);
  }

  function bindPlacementInteractions(view) {
    const surface = document.getElementById(`placement-surface-${view}`);
    const wrapEl = document.getElementById(`placement-design-wrap-${view}`);
    const designEl = document.getElementById(`placement-design-${view}`);
    const card = document.getElementById(`placement-card-${view}`);
    if (!surface || !wrapEl || !designEl) return;

    let mode = null; // "drag" | "resize"
    let pointerId = null;
    let startClientX = 0;
    let startClientY = 0;
    let startDx = 0;
    let startDy = 0;
    let startScale = 1;
    let startDist = 1;
    let resizeCenterX = PREVIEW_W / 2;
    let resizeCenterY = PREVIEW_H / 2;
    let rafId = 0;
    let pendingDx = 0;
    let pendingDy = 0;
    let pendingScale = 1;

    const clientToLogical = (clientX, clientY) => {
      const rect = surface.getBoundingClientRect();
      const { scale, offsetX, offsetY } = getPlacementDisplayMetrics(surface);
      return {
        x: (clientX - rect.left - offsetX) / scale,
        y: (clientY - rect.top - offsetY) / scale,
        displayScale: scale,
      };
    };

    const flush = () => {
      rafId = 0;
      if (mode === "drag") {
        designOffsets[view] = clampDesignOffset(view, pendingDx, pendingDy, designDrawInfo[view]);
      } else if (mode === "resize") {
        designScales[view] = clampDesignScale(pendingScale);
        // Re-clamp offset after size change so design stays mostly visible
        const off = designOffsets[view] || { dx: 0, dy: 0 };
        const layout = computePlacementLayout(view, placementAssets[view]?.baseImg, placementAssets[view]?.designImg, PREVIEW_W, PREVIEW_H);
        designOffsets[view] = clampDesignOffset(view, off.dx, off.dy, layout);
      }
      applyPlacementPositions(view);
      scheduleLifestyleRefresh();
    };

    const schedule = () => {
      if (!rafId) rafId = requestAnimationFrame(flush);
    };

    const endInteraction = (e) => {
      if (!mode) return;
      if (pointerId != null && e && e.pointerId !== pointerId) return;
      mode = null;
      pointerId = null;
      wrapEl.classList.remove("is-dragging", "is-resizing");
      surface.classList.remove("is-dragging", "is-resizing");
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
        flush();
      } else {
        updatePlacementChrome(view);
      }
      scheduleLifestyleRefresh();
    };

    const beginDrag = (e) => {
      if (!designDrawInfo[view]) return;
      e.preventDefault();
      e.stopPropagation();
      mode = "drag";
      pointerId = e.pointerId;
      startClientX = e.clientX;
      startClientY = e.clientY;
      const off = designOffsets[view] || { dx: 0, dy: 0 };
      startDx = off.dx;
      startDy = off.dy;
      wrapEl.classList.add("is-dragging");
      surface.classList.add("is-dragging");
      try { wrapEl.setPointerCapture(e.pointerId); } catch (err) {}
    };

    const onDragDown = (e) => {
      if (e.button != null && e.button !== 0) return;
      if (e.target.closest(".placement-resize-handle")) return;
      beginDrag(e);
    };

    const onResizeDown = (e) => {
      if (e.button != null && e.button !== 0) return;
      const layout = designDrawInfo[view];
      if (!layout) return;

      // Corner handles use large touch targets that overlap small artwork.
      // Prefer move when the press is on the art body (not the corner tip / outside grab).
      const wrapRect = wrapEl.getBoundingClientRect();
      const minSide = Math.min(wrapRect.width, wrapRect.height) || 1;
      const corner = e.currentTarget?.dataset?.corner || "se";
      const cornerPts = {
        nw: [wrapRect.left, wrapRect.top],
        ne: [wrapRect.right, wrapRect.top],
        sw: [wrapRect.left, wrapRect.bottom],
        se: [wrapRect.right, wrapRect.bottom],
      };
      const [cx, cy] = cornerPts[corner] || cornerPts.se;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      const cornerReach = Math.min(18, Math.max(10, minSide * 0.28));
      const insideWrap =
        e.clientX >= wrapRect.left &&
        e.clientX <= wrapRect.right &&
        e.clientY >= wrapRect.top &&
        e.clientY <= wrapRect.bottom;
      if (insideWrap && dist > cornerReach) {
        beginDrag(e);
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      mode = "resize";
      pointerId = e.pointerId;
      const logical = clientToLogical(e.clientX, e.clientY);
      resizeCenterX = layout.x + layout.designW / 2;
      resizeCenterY = layout.y + layout.designH / 2;
      startDist = Math.max(8, Math.hypot(logical.x - resizeCenterX, logical.y - resizeCenterY));
      startScale = getDesignScale(view);
      pendingScale = startScale;
      wrapEl.classList.add("is-resizing");
      surface.classList.add("is-resizing");
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    };

    const onPointerMove = (e) => {
      if (!mode || (pointerId != null && e.pointerId !== pointerId)) return;
      e.preventDefault();
      if (mode === "drag") {
        const logical = clientToLogical(e.clientX, e.clientY);
        const start = clientToLogical(startClientX, startClientY);
        pendingDx = startDx + (logical.x - start.x);
        pendingDy = startDy + (logical.y - start.y);
        schedule();
      } else if (mode === "resize") {
        const logical = clientToLogical(e.clientX, e.clientY);
        const dist = Math.max(8, Math.hypot(logical.x - resizeCenterX, logical.y - resizeCenterY));
        pendingScale = clampDesignScale(startScale * (dist / startDist));
        schedule();
      }
    };

    wrapEl.addEventListener("pointerdown", onDragDown);
    wrapEl.addEventListener("pointermove", onPointerMove);
    wrapEl.addEventListener("pointerup", endInteraction);
    wrapEl.addEventListener("pointercancel", endInteraction);
    wrapEl.addEventListener("lostpointercapture", endInteraction);

    wrapEl.querySelectorAll(".placement-resize-handle").forEach((handle) => {
      handle.addEventListener("pointerdown", onResizeDown);
      handle.addEventListener("pointermove", onPointerMove);
      handle.addEventListener("pointerup", endInteraction);
      handle.addEventListener("pointercancel", endInteraction);
      handle.addEventListener("lostpointercapture", endInteraction);
    });

    const resetBtn = card && card.querySelector(".placement-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        designOffsets[view] = { dx: 0, dy: 0 };
        designScales[view] = 1;
        applyPlacementPositions(view, { animate: true });
        scheduleLifestyleRefresh();
      });
    }

    const slider = card && card.querySelector(".placement-scale-slider");
    if (slider) {
      slider.addEventListener("input", () => {
        designScales[view] = clampDesignScale(Number(slider.value) / 100);
        const off = designOffsets[view] || { dx: 0, dy: 0 };
        const layout = computePlacementLayout(view, placementAssets[view]?.baseImg, placementAssets[view]?.designImg, PREVIEW_W, PREVIEW_H);
        designOffsets[view] = clampDesignOffset(view, off.dx, off.dy, layout);
        applyPlacementPositions(view);
        scheduleLifestyleRefresh();
      });
    }

    surface.addEventListener("keydown", (event) => {
      const directions = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      if (directions[event.key]) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 2;
        const [xDirection, yDirection] = directions[event.key];
        const off = designOffsets[view] || { dx: 0, dy: 0 };
        designOffsets[view] = clampDesignOffset(
          view,
          off.dx + xDirection * step,
          off.dy + yDirection * step,
          designDrawInfo[view],
        );
        applyPlacementPositions(view);
        scheduleLifestyleRefresh();
      } else if (event.key === "Home") {
        event.preventDefault();
        designOffsets[view] = { dx: 0, dy: 0 };
        designScales[view] = 1;
        applyPlacementPositions(view, { animate: true });
        scheduleLifestyleRefresh();
      }
    });

    const ro = new ResizeObserver(() => applyPlacementPositions(view));
    ro.observe(surface);
  }

  async function mountPlacementCard(view) {
    const surface = document.getElementById(`placement-surface-${view}`);
    const baseEl = document.getElementById(`placement-base-${view}`);
    const designEl = document.getElementById(`placement-design-${view}`);
    const skeleton = document.getElementById(`placement-skeleton-${view}`);
    if (!surface || !designEl) return;

    surface.classList.add("is-loading");
    const asset = await ensurePlacementAssets(view);
    if (!asset || !uploadedFiles[view]) {
      surface.classList.remove("is-loading");
      if (skeleton) skeleton.textContent = "Couldn’t load preview.";
      return;
    }

    if (baseEl) {
      if (asset.baseImg && asset.baseImg.src) {
        baseEl.src = asset.baseImg.src;
        baseEl.style.display = "block";
      } else {
        baseEl.removeAttribute("src");
        baseEl.style.display = "none";
      }
    }
    designEl.src = (asset.designImg && asset.designImg.src) || asset.designUrl;
    designEl.alt = `${capitalize(view)} design`;

    if (skeleton) skeleton.remove();
    surface.classList.remove("is-loading");
    surface.classList.add("is-ready");
    designEl.classList.add("is-ready");

    requestAnimationFrame(() => {
      applyPlacementPositions(view);
      bindPlacementInteractions(view);
    });
  }

  function renderPlacementPreviews() {
    const previewContainer = document.getElementById("preview-container");
    const placementBlock = document.getElementById("bento-placement");
    if (!previewContainer) return;

    ensureActiveDesignSide();
    const placeView = designModal?.kind === "placement"
      ? designModal.view
      : (uploadedFiles[activeDesignSide] ? activeDesignSide : getUploadedViews()[0]);
    const visibleViews = placeView && uploadedFiles[placeView] && designModal?.kind === "placement"
      ? [placeView]
      : [];
    const viewsKey = `${getPlacementViewsKey()}|modal:${designModal?.kind || "none"}|view:${placeView || ""}`;
    placementBlock?.classList.toggle("is-editor-open", visibleViews.length > 0);

    if (visibleViews.length === 0) {
      previewContainer.dataset.viewsKey = "";
      previewContainer.innerHTML = designModal?.kind === "placement"
        ? `<div class="placement-empty"><p class="placement-empty-title">Upload art first</p><p class="placement-empty-text">Open Upload Front or Upload Back to add a logo.</p></div>`
        : "";
      renderLifestyleGallery();
      return;
    }

    if (
      previewContainer.dataset.viewsKey === viewsKey &&
      previewContainer.querySelector(".placement-card")
    ) {
      visibleViews.forEach(updatePlacementChrome);
      return;
    }

    const switchableViews = getDesignSideViews().filter((view) => uploadedFiles[view]);
    const sideSwitcher = switchableViews.length > 1
      ? `<div class="design-modal-side-switch" role="tablist" aria-label="Placement side">
          ${switchableViews.map((view) => `
            <button type="button" role="tab" class="design-modal-side-btn ${view === placeView ? "is-active" : ""}" data-place-side="${escapeHtml(view)}" aria-selected="${view === placeView ? "true" : "false"}">
              ${escapeHtml(capitalize(view))}
            </button>
          `).join("")}
        </div>`
      : "";

    previewContainer.dataset.viewsKey = viewsKey;
    previewContainer.innerHTML = `
      ${sideSwitcher}
      <div class="placement-grid">${visibleViews.map((view) => {
        const locName = getLocationName(view);
        const size = getSelectedSize(view);
        const sizeLabel = size
          ? `${size.name}${size.label ? ` · ${size.label}` : ""}`
          : "";
        const scalePct = Math.round(getDesignScale(view) * 100);
        return `<article class="placement-card" id="placement-card-${view}" data-view="${view}">
          <header class="placement-card-header">
            <div class="placement-card-titles">
              <p class="placement-card-title">${capitalize(view)}</p>
              ${locName ? `<p class="placement-card-subloc">${locName}</p>` : ""}
              <p class="placement-status">Drag or pull a corner</p>
            </div>
            <div class="placement-card-actions">
              <button type="button" class="placement-reset" disabled aria-label="Reset ${capitalize(view)} placement">Reset</button>
            </div>
          </header>
          <div class="placement-surface" id="placement-surface-${view}" tabindex="0" role="application" aria-label="Position ${capitalize(view)} design" aria-describedby="placement-instructions-${view}">
            <span class="visually-hidden" id="placement-instructions-${view}">Drag to move. Arrow keys nudge. Size slider resizes. Hold Shift for bigger steps.</span>
            <div class="placement-skeleton" id="placement-skeleton-${view}">Loading…</div>
            <img class="placement-base" id="placement-base-${view}" alt="" draggable="false" />
            <div class="placement-guide" id="placement-guide-${view}">
              <span class="placement-guide-label">Recommended</span>
            </div>
            <div class="placement-design-wrap" id="placement-design-wrap-${view}">
              <img class="placement-design" id="placement-design-${view}" alt="" draggable="false" />
              <span class="placement-resize-handle nw" data-corner="nw" aria-hidden="true"></span>
              <span class="placement-resize-handle ne" data-corner="ne" aria-hidden="true"></span>
              <span class="placement-resize-handle sw" data-corner="sw" aria-hidden="true"></span>
              <span class="placement-resize-handle se" data-corner="se" aria-hidden="true"></span>
            </div>
          </div>
          <div class="placement-scale-row">
            <label class="placement-scale-label" for="placement-scale-${view}">Size</label>
            <input type="range" class="placement-scale-slider" id="placement-scale-${view}" min="${Math.round(DESIGN_SCALE_MIN * 100)}" max="${Math.round(DESIGN_SCALE_MAX * 100)}" value="${scalePct}" step="1" />
            <span class="placement-scale-readout">${scalePct}%</span>
          </div>
          <footer class="placement-card-footer">
            <span class="placement-hint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 9l-3 3 3 3"/><path d="M9 5l3-3 3 3"/><path d="M15 19l3 3 3-3"/><path d="M19 9l3 3-3 3"/><path d="M2 12h20"/><path d="M12 2v20"/></svg>
              Drag to move · pull corner to resize
            </span>
            ${sizeLabel ? `<span class="placement-size-tag">${sizeLabel}</span>` : ""}
          </footer>
        </article>`;
      }).join("")}</div>
      <div class="mockup-disclaimer">
        <svg class="mockup-disclaimer-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <span>This is for look only — print size in Upload sets the price.</span>
      </div>
    `;

    previewContainer.querySelectorAll("[data-place-side]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextView = btn.dataset.placeSide;
        if (!nextView || !uploadedFiles[nextView] || designModal?.view === nextView) return;
        openDesignModal("placement", nextView);
      });
    });

    visibleViews.forEach((view) => {
      mountPlacementCard(view);
    });
  }

  // ===== Lifestyle “How it would look” gallery =====

  let _lifestyleRefreshTimer = 0;
  function scheduleLifestyleRefresh() {
    if (_lifestyleRefreshTimer) clearTimeout(_lifestyleRefreshTimer);
    _lifestyleRefreshTimer = setTimeout(() => {
      _lifestyleRefreshTimer = 0;
      paintLifestyleTiles();
    }, 120);
  }

  function isLifestyleVisible() {
    if (!selectedProduct) return false;
    // Default on unless explicitly disabled
    return selectedProduct.lifestyleVisible !== false;
  }

  function getLifestylePlatesForGender() {
    if (!selectedProduct || !isLifestyleVisible()) return [];
    const plates = selectedProduct.lifestylePlates || [];
    const colorSlug = getActiveLifestyleColorSlug() || lastPopularLifestyleColor || "black";
    const allow = selectedProduct.lifestyleColors || LIFESTYLE_COLOR_FALLBACK;
    const resolved = allow.includes(colorSlug) ? colorSlug : "black";
    const forColor = plates.filter(
      (p) => p.gender === lifestyleGender && (p.color === resolved || (!p.color && resolved === "black" && String(p.garment || "").startsWith("black-"))),
    );
    if (forColor.length > 0) return forColor;
    // Fallback: black plates for this style if colorway not seeded yet
    return plates.filter(
      (p) => p.gender === lifestyleGender && (p.color === "black" || String(p.garment || "").startsWith("black-")),
    );
  }

  function lifestyleAngleLabel(angle) {
    const map = {
      front: "Front",
      front_closeup: "Front close-up",
      back: "Back",
      back_closeup: "Back close-up",
    };
    return map[angle] || angle;
  }

  /** Keep in sync with app/lib/lifestylePlacement.ts — admin zone is 1:1. */
  const CLOSEUP_ZOOM = 1;

  function validLifestyleBounds(bounds) {
    return !!(
      bounds &&
      Number.isFinite(bounds.x) &&
      Number.isFinite(bounds.y) &&
      Number.isFinite(bounds.width) &&
      Number.isFinite(bounds.height) &&
      bounds.x >= 0 &&
      bounds.y >= 0 &&
      bounds.width > 0 &&
      bounds.height > 0 &&
      bounds.x + bounds.width <= 1.001 &&
      bounds.y + bounds.height <= 1.001
    );
  }

  /** Honor any valid admin-saved rect (min size matches calibrate editor). */
  function lifestyleZoneUsable(_angle, bounds) {
    if (!validLifestyleBounds(bounds)) return false;
    if (bounds.height < 0.05 || bounds.width < 0.05) return false;
    return true;
  }

  /**
   * Admin-saved zone for the selected print location only.
   * Returns null when not calibrated — never invents a fallback placement.
   */
  function getSavedLifestylePrintZone(plate, view) {
    const slug = selectedLocations[view] || "";
    if (!slug) return null;
    const zones = plate && plate.zones && typeof plate.zones === "object"
      ? plate.zones
      : {};
    if (lifestyleZoneUsable(plate && plate.angle, zones[slug])) {
      return zones[slug];
    }
    return null;
  }

  function lifestyleServeUrl(imageKey, base) {
    const q = `key=${encodeURIComponent(imageKey)}&v=${LIFESTYLE_ASSET_VERSION}`;
    if (base) return `${base.replace(/\/+$/, "")}/api/serve-image?${q}`;
    return `/apps/mockup/api/serve-image?${q}`;
  }

  async function loadLifestylePlateImage(imageKey) {
    if (!imageKey) return null;
    const cacheKey = `${imageKey}?v=${LIFESTYLE_ASSET_VERSION}`;
    if (lifestyleImageCache[cacheKey]) return lifestyleImageCache[cacheKey];
    let img = await loadImageAsBlob(lifestyleServeUrl(imageKey));
    if (!img) {
      const direct = (config.appUrl || APP_URL || "").replace(/\/+$/, "");
      if (direct) img = await loadImageAsBlob(lifestyleServeUrl(imageKey, direct));
    }
    if (!img) {
      const file = imageKey.replace(/^lifestyle\//, "").replace(/^lifestyle-plates\//, "");
      img = await loadImageElement(
        `/lifestyle-plates/${file}?v=${LIFESTYLE_ASSET_VERSION}`,
      );
    }
    if (img) lifestyleImageCache[cacheKey] = img;
    return img;
  }

  function prefetchLifestylePlates() {
    if (!selectedProduct || !isLifestyleVisible()) return;
    const plates = selectedProduct.lifestylePlates || [];
    plates.forEach((plate) => {
      if (plate && plate.imageKey) loadLifestylePlateImage(plate.imageKey);
    });
  }

  /**
   * Map flat print-area placement onto the lifestyle print-area zone.
   * 180% on the flat is exactly 1.8× in lifestyle; no size caps.
   */
  function mapDesignFromFlatPrintArea(view, targetX, targetY, targetW, targetH) {
    const info = designDrawInfo[view];
    const designImg = placementAssets[view] && placementAssets[view].designImg;
    const naturalAspect = designImg && designImg.height
      ? designImg.width / designImg.height
      : 1;
    const userScale = getDesignScale(view);

    if (info && info.areaW > 0 && info.areaH > 0) {
      const designCx = info.x + info.designW / 2;
      const designCy = info.y + info.designH / 2;
      const cx = (designCx - info.areaX) / info.areaW;
      const cy = (designCy - info.areaY) / info.areaH;
      const uniformScale = targetW / info.areaW;
      const w = Math.max(4, info.designW * uniformScale);
      const h = Math.max(4, info.designH * uniformScale);
      return {
        x: targetX + cx * targetW - w / 2,
        y: targetY + cy * targetH - h / 2,
        w,
        h,
      };
    }

    // Fallback before flat layout is ready: contain-fit into lifestyle print zone
    let fitH = targetH * 0.85;
    let fitW = fitH * naturalAspect;
    if (fitW > targetW * 0.95) {
      fitW = targetW * 0.95;
      fitH = fitW / naturalAspect;
    }
    const w = fitW * userScale;
    const h = fitH * userScale;
    return {
      x: targetX + (targetW - w) / 2,
      y: targetY + (targetH - h) / 2,
      w,
      h,
    };
  }

  async function paintLifestyleTile(canvas, plate) {
    const view = plate.designView;
    canvas.classList.add("is-painting");
    canvas.classList.remove("is-ready");

    const plateImg = await loadLifestylePlateImage(plate.imageKey);
    if (!plateImg) {
      canvas.classList.remove("is-painting");
      return;
    }

    const W = canvas.width;
    const H = canvas.height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, W, H);

    const plateSize = getImageSize(plateImg);
    const contain = getContainRect(plateSize.w, plateSize.h, W, H);
    ctx.drawImage(plateImg, contain.x, contain.y, contain.w, contain.h);
    // Always show the model photo — even when prior steps are locked / no art yet.
    canvas.classList.remove("is-painting");
    canvas.classList.add("is-ready");

    // Design overlay only after artwork is uploaded for this side.
    if (!uploadedFiles[view]) return;

    const b = getSavedLifestylePrintZone(plate, view);
    if (!b) return;

    const asset = await ensurePlacementAssets(view);
    if (!asset || !asset.designImg) return;
    // Keep lifestyle in sync with latest scale/offset even if DOM layout lagged
    designDrawInfo[view] = computePlacementLayout(
      view,
      asset.baseImg,
      asset.designImg,
      PREVIEW_W,
      PREVIEW_H,
    );

    // Admin-saved zone is the truth source — map 1:1 into that rect.
    const zoneX = contain.x + b.x * contain.w;
    const zoneY = contain.y + b.y * contain.h;
    const zoneW = b.width * contain.w;
    const zoneH = b.height * contain.h;
    const closeupZoom = CLOSEUP_ZOOM; // 1 — kept for sync with shared lib
    const mapW = zoneW * closeupZoom;
    const mapH = zoneH * closeupZoom;
    const rect = mapDesignFromFlatPrintArea(
      view,
      zoneX + (zoneW - mapW) / 2,
      zoneY + (zoneH - mapH) / 2,
      mapW,
      mapH,
    );

    ctx.drawImage(plateImg, contain.x, contain.y, contain.w, contain.h);
    ctx.drawImage(asset.designImg, rect.x, rect.y, rect.w, rect.h);
  }

  async function paintLifestyleTiles() {
    const root = document.getElementById("lifestyle-gallery");
    if (!root) return;
    const plates = getLifestylePlatesForGender();
    const canvases = root.querySelectorAll("canvas[data-lifestyle-key]");
    await Promise.all(
      Array.from(canvases).map(async (canvas) => {
        const key = canvas.getAttribute("data-lifestyle-key");
        const plate = plates.find(
          (p) => `${p.gender}:${p.angle}` === key || p.imageKey === key,
        );
        if (plate) await paintLifestyleTile(canvas, plate);
      }),
    );
    if (lifestyleZoom) {
      const openPlate = plates.find((plate) => lifestyleZoomPlateKey(plate) === lifestyleZoom.key);
      if (openPlate) paintLifestyleZoomImage(openPlate);
    }
  }

  // ===== Lifestyle zoom HUD (click mockup → enlarge / pan / zoom) =====
  let lifestyleZoom = null; // { key, index }
  let lifestyleZoomTransform = { scale: 1, x: 0, y: 0 };
  let lifestyleZoomPreviousFocus = null;
  let lifestyleZoomPointers = new Map();
  let lifestyleZoomPinchStart = null;
  let lifestyleZoomBound = false;

  const LIFESTYLE_ZOOM_MIN = 1;
  const LIFESTYLE_ZOOM_MAX = 4;

  function getLifestyleZoomPlates() {
    return getLifestylePlatesForGender();
  }

  function lifestyleZoomPlateKey(plate) {
    return `${plate.gender}:${plate.angle}`;
  }

  function bindLifestyleZoomTargets(root) {
    if (!root || root.querySelector(".lifestyle-lock-overlay")) return;
    root.querySelectorAll("[data-lifestyle-open]").forEach((card) => {
      if (card.dataset.zoomBound === "1") return;
      card.dataset.zoomBound = "1";
      const open = () => openLifestyleZoom(card.dataset.lifestyleOpen, card);
      card.addEventListener("click", (event) => {
        if (event.target.closest(".lifestyle-gender-btn, .color-swatch, button, a, label, input")) return;
        // Toggle closed if the same card HUD is already open.
        if (lifestyleZoom?.key === card.dataset.lifestyleOpen) {
          closeLifestyleZoom();
          return;
        }
        open();
      });
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      });
    });
  }

  function getLifestyleZoomAnchor(key) {
    const root = document.getElementById("lifestyle-gallery");
    return root?.querySelector(`[data-lifestyle-open="${key}"]`)
      || root?.querySelector(".lifestyle-card.is-zoomable")
      || document.getElementById("design-action-bar")
      || document.getElementById("bento-lifestyle");
  }

  function positionLifestyleZoomHud(anchorEl) {
    const hud = document.getElementById("lifestyle-zoom-hud");
    const host = document.getElementById("bento-lifestyle");
    if (!hud || !host || !lifestyleZoom) return;

    const hostRect = host.getBoundingClientRect();
    const anchor = anchorEl || getLifestyleZoomAnchor(lifestyleZoom.key);
    const anchorRect = (anchor || host).getBoundingClientRect();
    const pad = 10;
    const gap = 8;
    const available = Math.max(240, hostRect.width - pad * 2);
    const hudWidth = Math.min(420, available);
    const rawLeft = anchorRect.left - hostRect.left;
    const maxLeft = Math.max(0, available - hudWidth);
    const left = Math.min(Math.max(0, rawLeft), maxLeft);
    // Prefer just under the clicked card; keep on-screen if near the bottom.
    let top = anchorRect.bottom - hostRect.top + gap;
    const approxHeight = Math.min(hostRect.height * 0.72, 520);
    if (top + approxHeight > hostRect.height - pad) {
      top = Math.max(pad, anchorRect.top - hostRect.top - 8);
    }

    hud.style.setProperty("--zoom-hud-top", `${Math.round(top)}px`);
    hud.style.setProperty("--zoom-hud-left", `${Math.round(left)}px`);
    hud.style.setProperty("--zoom-hud-width", `${Math.round(hudWidth)}px`);
  }

  function applyLifestyleZoomTransform() {
    const img = document.getElementById("lifestyle-zoom-image");
    const level = document.getElementById("lifestyle-zoom-level");
    if (!img) return;
    const { scale, x, y } = lifestyleZoomTransform;
    img.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) scale(${scale})`;
    if (level) level.textContent = `${Math.round(scale * 100)}%`;
  }

  function resetLifestyleZoomTransform() {
    lifestyleZoomTransform = { scale: 1, x: 0, y: 0 };
    applyLifestyleZoomTransform();
  }

  function setLifestyleZoomScale(nextScale, originX, originY) {
    const stage = document.getElementById("lifestyle-zoom-stage");
    const prev = lifestyleZoomTransform.scale;
    const scale = Math.min(LIFESTYLE_ZOOM_MAX, Math.max(LIFESTYLE_ZOOM_MIN, nextScale));
    if (!stage || prev === scale) {
      lifestyleZoomTransform.scale = scale;
      applyLifestyleZoomTransform();
      return;
    }

    const rect = stage.getBoundingClientRect();
    const cx = (originX ?? rect.left + rect.width / 2) - rect.left - rect.width / 2;
    const cy = (originY ?? rect.top + rect.height / 2) - rect.top - rect.height / 2;
    const ratio = scale / prev;
    lifestyleZoomTransform = {
      scale,
      x: cx - (cx - lifestyleZoomTransform.x) * ratio,
      y: cy - (cy - lifestyleZoomTransform.y) * ratio,
    };
    if (scale === 1) {
      lifestyleZoomTransform.x = 0;
      lifestyleZoomTransform.y = 0;
    }
    applyLifestyleZoomTransform();
  }

  function renderLifestyleZoomNav() {
    const nav = document.getElementById("lifestyle-zoom-nav");
    if (!nav || !lifestyleZoom) return;
    const plates = getLifestyleZoomPlates();
    nav.innerHTML = plates.map((plate, index) => {
      const key = lifestyleZoomPlateKey(plate);
      const active = key === lifestyleZoom.key ? "is-active" : "";
      return `<button type="button" class="lifestyle-zoom-nav-btn ${active}" data-zoom-key="${escapeHtml(key)}" aria-pressed="${active ? "true" : "false"}">${escapeHtml(lifestyleAngleLabel(plate.angle))}</button>`;
    }).join("");
    nav.querySelectorAll("[data-zoom-key]").forEach((btn) => {
      btn.addEventListener("click", () => openLifestyleZoom(btn.dataset.zoomKey, getLifestyleZoomAnchor(btn.dataset.zoomKey)));
    });
  }

  async function paintLifestyleZoomImage(plate) {
    const img = document.getElementById("lifestyle-zoom-image");
    if (!img) return;
    img.classList.add("is-loading");
    const plateImg = await loadLifestylePlateImage(plate.imageKey);
    const canvas = document.createElement("canvas");
    if (plateImg && plateImg.naturalWidth) {
      const maxEdge = 960;
      const ratio = Math.min(1, maxEdge / Math.max(plateImg.naturalWidth, plateImg.naturalHeight));
      canvas.width = Math.max(240, Math.round(plateImg.naturalWidth * ratio));
      canvas.height = Math.max(320, Math.round(plateImg.naturalHeight * ratio));
    } else {
      canvas.width = 720;
      canvas.height = 960;
    }
    await paintLifestyleTile(canvas, plate);
    img.src = canvas.toDataURL("image/jpeg", 0.92);
    img.alt = `${lifestyleAngleLabel(plate.angle)} mockup`;
    img.classList.remove("is-loading");
  }

  async function openLifestyleZoom(key, anchorEl) {
    const hud = document.getElementById("lifestyle-zoom-hud");
    const title = document.getElementById("lifestyle-zoom-title");
    const host = document.getElementById("bento-lifestyle");
    const plates = getLifestyleZoomPlates();
    const index = plates.findIndex((plate) => lifestyleZoomPlateKey(plate) === key);
    if (!hud || index < 0) return;

    // Close the design upload/place HUD so both don't stack.
    if (designModal) closeDesignModal();

    const plate = plates[index];
    if (!lifestyleZoom) {
      lifestyleZoomPreviousFocus = document.activeElement;
    }
    lifestyleZoom = { key, index };
    resetLifestyleZoomTransform();

    if (title) title.textContent = lifestyleAngleLabel(plate.angle);
    hud.hidden = false;
    host?.classList.add("is-zoom-hud-open");
    positionLifestyleZoomHud(anchorEl || getLifestyleZoomAnchor(key));
    void hud.offsetWidth;
    requestAnimationFrame(() => {
      positionLifestyleZoomHud(anchorEl || getLifestyleZoomAnchor(key));
      hud.classList.add("is-open");
    });
    renderLifestyleZoomNav();
    await paintLifestyleZoomImage(plate);
    requestAnimationFrame(() => document.getElementById("lifestyle-zoom-close")?.focus());
  }

  function closeLifestyleZoom() {
    const hud = document.getElementById("lifestyle-zoom-hud");
    const host = document.getElementById("bento-lifestyle");
    if (!hud || !lifestyleZoom) return;
    lifestyleZoom = null;
    hud.classList.remove("is-open");
    host?.classList.remove("is-zoom-hud-open");
    window.setTimeout(() => {
      if (!lifestyleZoom) hud.hidden = true;
    }, 180);
    if (lifestyleZoomPreviousFocus && typeof lifestyleZoomPreviousFocus.focus === "function") {
      lifestyleZoomPreviousFocus.focus();
    }
    lifestyleZoomPreviousFocus = null;
  }

  function bindLifestyleZoomChrome() {
    if (lifestyleZoomBound) return;
    lifestyleZoomBound = true;

    const close = () => closeLifestyleZoom();
    on("lifestyle-zoom-close", "click", close);
    on("lifestyle-zoom-done", "click", close);
    on("lifestyle-zoom-in", "click", () => setLifestyleZoomScale(lifestyleZoomTransform.scale + 0.35));
    on("lifestyle-zoom-out", "click", () => setLifestyleZoomScale(lifestyleZoomTransform.scale - 0.35));
    on("lifestyle-zoom-reset", "click", () => resetLifestyleZoomTransform());

    document.addEventListener("keydown", (event) => {
      if (!lifestyleZoom) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeLifestyleZoom();
        return;
      }
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        const plates = getLifestyleZoomPlates();
        if (!plates.length) return;
        event.preventDefault();
        const delta = event.key === "ArrowRight" ? 1 : -1;
        const next = (lifestyleZoom.index + delta + plates.length) % plates.length;
        openLifestyleZoom(lifestyleZoomPlateKey(plates[next]));
      }
    });

    const stage = document.getElementById("lifestyle-zoom-stage");
    if (!stage) return;

    stage.addEventListener("wheel", (event) => {
      if (!lifestyleZoom) return;
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.18 : 0.18;
      setLifestyleZoomScale(lifestyleZoomTransform.scale + delta, event.clientX, event.clientY);
    }, { passive: false });

    stage.addEventListener("pointerdown", (event) => {
      if (!lifestyleZoom) return;
      stage.setPointerCapture(event.pointerId);
      lifestyleZoomPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (lifestyleZoomPointers.size === 2) {
        const pts = Array.from(lifestyleZoomPointers.values());
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        lifestyleZoomPinchStart = { dist, scale: lifestyleZoomTransform.scale };
      }
    });

    stage.addEventListener("pointermove", (event) => {
      if (!lifestyleZoom || !lifestyleZoomPointers.has(event.pointerId)) return;
      const prev = lifestyleZoomPointers.get(event.pointerId);
      lifestyleZoomPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (lifestyleZoomPointers.size === 2 && lifestyleZoomPinchStart) {
        const pts = Array.from(lifestyleZoomPointers.values());
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const midX = (pts[0].x + pts[1].x) / 2;
        const midY = (pts[0].y + pts[1].y) / 2;
        setLifestyleZoomScale(lifestyleZoomPinchStart.scale * (dist / Math.max(1, lifestyleZoomPinchStart.dist)), midX, midY);
        return;
      }

      if (lifestyleZoomTransform.scale <= 1) return;
      lifestyleZoomTransform.x += event.clientX - prev.x;
      lifestyleZoomTransform.y += event.clientY - prev.y;
      applyLifestyleZoomTransform();
    });

    const endPointer = (event) => {
      lifestyleZoomPointers.delete(event.pointerId);
      if (lifestyleZoomPointers.size < 2) lifestyleZoomPinchStart = null;
    };
    stage.addEventListener("pointerup", endPointer);
    stage.addEventListener("pointercancel", endPointer);
    stage.addEventListener("pointerleave", endPointer);

    stage.addEventListener("dblclick", (event) => {
      if (!lifestyleZoom) return;
      if (lifestyleZoomTransform.scale > 1.05) resetLifestyleZoomTransform();
      else setLifestyleZoomScale(2.2, event.clientX, event.clientY);
    });
  }

  function getLifestyleGalleryKey(plates) {
    return [
      lifestyleGender,
      ...plates.map((p) => {
        const calibrated = !!getSavedLifestylePrintZone(p, p.designView);
        return `${p.gender}:${p.angle}:${p.imageKey}:${calibrated ? 1 : 0}`;
      }),
    ].join("|");
  }

  function renderLifestyleSpecialBar() {
    if (!isSpecialColorOrder()) return "";
    return `<span class="lifestyle-special-bar" title="Not stocked online — contact us to inquire">Special order</span>`;
  }

  function getLifestylePendingMessage() {
    if (!selectedProduct) return "Pick a product to see your mockup.";
    if (getActiveViews().length === 0) return "Pick a print spot to continue.";
    if (getUploadedViews().length === 0) {
      return "Complete prior steps to see your mockup.";
    }
    return "";
  }

  function renderLifestyleLockOverlay(message) {
    if (!message) return "";
    return `<div class="lifestyle-lock-overlay" role="status">
      <div class="lifestyle-lock-card">
        <p class="lifestyle-lock-title">Preview locked</p>
        <p class="lifestyle-lock-text">${escapeHtml(message)}</p>
      </div>
    </div>`;
  }

  function renderLifestyleControls(introText) {
    return `<div class="lifestyle-preview-toolbar">
      ${renderColorSwatchRow("color-swatch-row--lifestyle")}
      <div class="lifestyle-intro">
        <div class="lifestyle-intro-copy">
          <p class="lifestyle-intro-text">${introText}</p>
        </div>
        <div class="lifestyle-gender-toggle" role="group" aria-label="Model gender">
          <button type="button" class="lifestyle-gender-btn ${lifestyleGender === "male" ? "is-active" : ""}" data-gender="male" aria-pressed="${lifestyleGender === "male"}">Male</button>
          <button type="button" class="lifestyle-gender-btn ${lifestyleGender === "female" ? "is-active" : ""}" data-gender="female" aria-pressed="${lifestyleGender === "female"}">Female</button>
        </div>
      </div>
    </div>`;
  }

  function renderLifestyleGallery() {
    const root = document.getElementById("lifestyle-gallery");
    const lifestyleEmpty = document.getElementById("lifestyle-empty");
    if (!root) return;
    if (lifestyleEmpty) lifestyleEmpty.hidden = true;

    const special = isSpecialColorOrder();
    const pendingMessage = getLifestylePendingMessage();
    const hasArt = getUploadedViews().length > 0;
    // Always show model plates for the selected product/color (art overlays when ready).
    const plates = getLifestylePlatesForGender();

    if (
      !selectedProduct ||
      !isLifestyleVisible() ||
      !(selectedProduct.lifestylePlates || []).length
    ) {
      root.style.display = "block";
      root.dataset.galleryKey = `pending-empty|${pendingMessage}`;
      root.classList.remove("is-inquire");
      root.innerHTML = `
        <div class="lifestyle-grid-wrap is-pending">
          <div class="lifestyle-grid lifestyle-grid--placeholder" aria-hidden="true">
            ${[0, 1, 2, 3].map(() => `<article class="lifestyle-card is-placeholder"><div class="lifestyle-placeholder-shot"></div></article>`).join("")}
          </div>
          ${renderLifestyleLockOverlay(pendingMessage || "Pick a product to see your mockup.")}
        </div>`;
      return;
    }

    if (plates.length === 0) {
      root.style.display = "block";
      root.dataset.galleryKey = `empty|${special ? 1 : 0}`;
      root.innerHTML = `
        <div class="lifestyle-grid-wrap is-pending">
          <div class="lifestyle-grid lifestyle-grid--placeholder" aria-hidden="true">
            ${[0, 1, 2, 3].map(() => `<article class="lifestyle-card is-placeholder ${special ? "is-special-order" : ""}">${renderLifestyleSpecialBar()}<div class="lifestyle-placeholder-shot"></div></article>`).join("")}
          </div>
          ${renderLifestyleLockOverlay("No model preview for this color yet.")}
        </div>
        ${renderLifestyleControls("No model preview for this color yet.")}`;
      bindColorSwatches(root);
      root.querySelectorAll(".lifestyle-gender-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          lifestyleGender = btn.getAttribute("data-gender") || "male";
          renderLifestyleGallery();
        });
      });
      return;
    }

    const withArtCount = plates.filter((p) => uploadedFiles[p.designView]).length;
    const galleryKey = `${getLifestyleGalleryKey(plates)}|sp:${special ? 1 : 0}|art:${hasArt ? 1 : 0}`;

    const colorSlugForKey = getActiveLifestyleColorSlug() || lastPopularLifestyleColor || "black";
    const fullGalleryKey = `${galleryKey}|c:${colorSlugForKey}|sp:${special ? 1 : 0}|p:${pendingMessage ? 1 : 0}`;

    // Reuse the grid when structure is unchanged so canvases don't flash blank.
    if (root.dataset.galleryKey === fullGalleryKey && root.querySelector("canvas")) {
      const intro = root.querySelector(".lifestyle-intro-text");
      if (intro) {
        intro.textContent = pendingMessage
          ? "Choose a side and upload — preview unlocks live."
          : withArtCount === plates.length
            ? "Updates as you place art."
            : `${withArtCount}/${plates.length} with art · rest model only`;
      }
      root.classList.toggle("is-inquire", special);
      root.querySelectorAll(".lifestyle-card").forEach((card) => {
        card.classList.toggle("is-special-order", special);
        const bar = card.querySelector(".lifestyle-special-bar");
        if (special && !bar) {
          card.insertAdjacentHTML("afterbegin", renderLifestyleSpecialBar());
        } else if (!special && bar) {
          bar.remove();
        }
      });
      const wrap = root.querySelector(".lifestyle-grid-wrap");
      if (wrap) {
        wrap.classList.toggle("is-pending", !!pendingMessage);
        const existingOverlay = wrap.querySelector(".lifestyle-lock-overlay");
        if (pendingMessage && !existingOverlay) {
          wrap.insertAdjacentHTML("beforeend", renderLifestyleLockOverlay(pendingMessage));
        } else if (!pendingMessage && existingOverlay) {
          existingOverlay.remove();
        } else if (pendingMessage && existingOverlay) {
          const text = existingOverlay.querySelector(".lifestyle-lock-text");
          if (text) text.textContent = pendingMessage;
        }
      }
      // Refresh swatch active states without remounting canvases
      const toolbar = root.querySelector(".lifestyle-preview-toolbar");
      if (toolbar) {
        const row = renderColorSwatchRow("color-swatch-row--lifestyle");
        const existing = toolbar.querySelector(".color-swatch-row--lifestyle");
        if (row && existing) {
          existing.outerHTML = row;
          bindColorSwatches(toolbar);
        } else if (row && !existing) {
          toolbar.insertAdjacentHTML("afterbegin", row);
          bindColorSwatches(toolbar);
        }
      }
      bindLifestyleZoomTargets(root);
      requestAnimationFrame(() => paintLifestyleTiles());
      return;
    }

    root.dataset.galleryKey = fullGalleryKey;
    root.style.display = "block";
    root.classList.toggle("is-inquire", special);
    const introText = pendingMessage
      ? "Choose a side and upload — preview unlocks live."
      : withArtCount === plates.length
        ? "Updates as you place art."
        : `${withArtCount}/${plates.length} with art · rest model only`;
    root.innerHTML = `
      <div class="lifestyle-grid-wrap ${pendingMessage ? "is-pending" : ""}">
        <div class="lifestyle-grid">
          ${plates
            .map((p) => {
              const key = `${p.gender}:${p.angle}`;
              const hasSideArt = !!uploadedFiles[p.designView];
              return `<article class="lifestyle-card is-zoomable ${hasSideArt ? "" : "is-model-only"} ${special ? "is-special-order" : ""}" data-lifestyle-open="${escapeHtml(key)}" role="button" tabindex="0" aria-label="Enlarge ${escapeHtml(lifestyleAngleLabel(p.angle))} mockup">
              ${renderLifestyleSpecialBar()}
              <canvas class="lifestyle-canvas is-painting" data-lifestyle-key="${key}" width="240" height="320" aria-label="${lifestyleAngleLabel(p.angle)}"></canvas>
              <p class="lifestyle-card-label">${lifestyleAngleLabel(p.angle)}${hasSideArt ? "" : " · model"}</p>
              <span class="lifestyle-card-zoom-hint" aria-hidden="true">View</span>
            </article>`;
            })
            .join("")}
        </div>
        ${renderLifestyleLockOverlay(pendingMessage)}
      </div>
      ${renderLifestyleControls(introText)}
    `;

    root.querySelectorAll(".lifestyle-gender-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        lifestyleGender = btn.getAttribute("data-gender") || "male";
        renderLifestyleGallery();
      });
    });
    bindColorSwatches(root);
    bindLifestyleZoomTargets(root);

    prefetchLifestylePlates();
    requestAnimationFrame(() => {
      paintLifestyleTiles();
    });
  }

  function renderOrderSummary() {
    const summaryContainer = document.getElementById("confirm-summary");
    const addToCartBtn = document.getElementById("btn-add-to-cart");
    if (!summaryContainer) return;
    if (!selectedProduct) {
      summaryContainer.innerHTML = '<div class="order-empty-state">Pick a product to start.</div>';
      if (addToCartBtn) {
        addToCartBtn.disabled = true;
        addToCartBtn.textContent = QUOTE_MODE ? "Request a quote" : "Add to cart";
      }
      updateMobileOrderBar();
      return;
    }

    const spData = getSelectedShopifyData();
    const options = spData ? spData.options : [];
    const variants = spData ? spData.variants : [];
    const hasVariants = options.length > 0 && (options.length > 1 || options[0].values.length > 1);
    const currentVariant = findMatchingVariant();
    const fallbackPrice = variants.length > 0 ? variants[0].price : 0;
    const basePrice = currentVariant ? currentVariant.price : fallbackPrice;
    const locationBreakdown = getLocationBreakdown();
    const surchargeTotal = getLocationSurcharge();
    const unitTotal = basePrice + surchargeTotal;
    const activeViews = getActiveViews();
    const missingViews = activeViews.filter((view) => !uploadedFiles[view]);
    const moq = selectedProduct.minOrderQty || 1;
    if (lineQty < moq) lineQty = moq;
    const specialColor = isSpecialColorOrder();
    const variantReady = variants.length > 0 && !!currentVariant && currentVariant.available;
    const canAddLine = !specialColor && activeViews.length > 0 && missingViews.length === 0 && variantReady;

    let variantHtml = "";
    const colorSwatchRow = renderColorSwatchRow("color-swatch-row--order");
    if (hasVariants || colorSwatchRow) {
      const nonColorOptions = options.filter(
        (opt) => !/^colou?r$/i.test(String(opt.name || "").trim()),
      );
      variantHtml = `<div class="variant-selectors">
        ${colorSwatchRow ? `<div class="variant-group variant-group--color">
          <span class="variant-label">Color</span>
          ${colorSwatchRow}
        </div>` : ""}
        ${nonColorOptions.map((opt, index) => `
          <div class="variant-group">
            <label class="variant-label" for="variant-option-${index}">${escapeHtml(opt.name)}</label>
            <select class="variant-select" id="variant-option-${index}" data-option="${escapeHtml(opt.name)}">
              ${opt.values.map((val) => `<option value="${escapeHtml(val)}" ${selectedOptions[opt.name] === val ? "selected" : ""}>${escapeHtml(val)}</option>`).join("")}
            </select>
          </div>`).join("")}
      </div>`;
    }

    let locationHtml = `<div class="location-breakdown">`;
    if (activeViews.length === 0) {
      locationHtml += '<p class="order-inline-guidance">Pick a print spot above.</p>';
    } else {
      activeViews.forEach((view) => {
        const loc = locationBreakdown.find((item) => item.view === view);
        const size = getSelectedSize(view);
        const extraCents = loc ? loc.extraPriceCents : getSizeSurchargeForView(view);
        const extra = extraCents > 0 ? `<span class="surcharge">+${formatMoney(extraCents)}</span>` : `<span class="surcharge free">Included</span>`;
        const sizeTag = size ? ` <span class="loc-size">(${escapeHtml(size.name)}${size.label ? ` · ${escapeHtml(size.label)}` : ""})</span>` : "";
        locationHtml += `<div class="location-row">
          <span class="loc-label">${capitalize(view)}: ${escapeHtml(getLocationName(view) || view)}${sizeTag}</span>
          ${extra}
        </div>`;
      });
    }
    locationHtml += `</div>`;

    let bulkTiersHtml = "";
    if (selectedProduct && selectedProduct.bulkPricingTiers && selectedProduct.bulkPricingTiers.length > 0) {
      const tiers = selectedProduct.bulkPricingTiers;
      const previewQty = getCartTotals().totalQty + lineQty;
      const previewDiscount = getBulkDiscount(previewQty);
      const nextTier = getNextTier(previewQty);
      const bulkMessage = nextTier
        ? `Add ${nextTier.needed} more for ${nextTier.discountPercent}% off`
        : `${previewDiscount}% bulk discount unlocked`;
      bulkTiersHtml = `<details class="bulk-pricing-tiers">
        <summary class="bulk-pricing-header">
          <span>${bulkMessage}</span>
          <span class="bulk-details-label">View tiers</span>
        </summary>
        <div class="bulk-tiers-table">
          ${tiers.map((t, i) => {
            const nextTier = tiers[i + 1];
            const qtyLabel = nextTier ? `${t.minQuantity}–${nextTier.minQuantity - 1}` : `${t.minQuantity}+`;
            return `<div class="bulk-tier-row" data-min="${t.minQuantity}">
              <span class="bulk-tier-qty">${qtyLabel} items</span>
              <span class="bulk-tier-discount">${t.discountPercent}% off</span>
              ${t.label ? `<span class="bulk-tier-label">${escapeHtml(t.label)}</span>` : ""}
            </div>`;
          }).join("")}
        </div>
        <p class="bulk-auto-apply-notice">Discount applies at checkout.</p>
      </details>`;
    }

    let priceBreakdownHtml = `<div class="price-breakdown">
      <div class="breakdown-row">
        <span>Base variant price</span>
        <span>${formatMoney(basePrice)}</span>
      </div>`;
    if (locationBreakdown.length > 0) {
      locationBreakdown.forEach((loc) => {
        const locLabel = `${capitalize(loc.view)}: ${loc.name}${loc.sizeName ? ` (${loc.sizeName})` : ""}`;
        if (loc.extraPriceCents > 0) {
          priceBreakdownHtml += `<div class="breakdown-row surcharge-row">
            <span>${locLabel}</span>
            <span>+${formatMoney(loc.extraPriceCents)}</span>
          </div>`;
        } else {
          priceBreakdownHtml += `<div class="breakdown-row surcharge-row surcharge-free">
            <span>${locLabel}</span>
            <span class="free-label">Included</span>
          </div>`;
        }
      });
    }
    priceBreakdownHtml += `<div class="breakdown-row breakdown-total">
      <span>Unit total</span>
      <span id="unit-total-display">${formatMoney(unitTotal)}</span>
    </div></div>`;

    let cartHtml = "";
    if (cartLines.length > 0) {
      const _totals = getCartTotals();
      cartHtml = `<div class="cart-lines">
        <h3 class="cart-lines-title">Draft order</h3>
        ${cartLines.map((line, i) => {
          const locsHtml = (line.locations && line.locations.length > 0)
            ? `<div class="cart-line-locations">${line.locations.map((loc) => {
                const sizeTag = loc.sizeName ? ` (${loc.sizeName})` : "";
                const priceTag = loc.extraPriceCents > 0 ? ` +${formatMoney(loc.extraPriceCents)}` : "";
                return `<span class="cart-line-loc">${capitalize(loc.view)}: ${loc.name}${sizeTag}${priceTag}</span>`;
              }).join("")}</div>`
            : "";
          return `<div class="cart-line">
            <div class="cart-line-info">
              <span class="cart-line-variant">${escapeHtml(line.variantTitle || selectedProduct.name)}</span>
              <span class="cart-line-qty">x${line.quantity}</span>
            </div>
            ${locsHtml}
            <div class="cart-line-actions">
              <span class="cart-line-price">${formatMoney(line.priceCents * line.quantity)}</span>
              <button type="button" class="cart-line-remove" data-index="${i}" aria-label="Remove ${escapeHtml(line.variantTitle || selectedProduct.name)}">&times;</button>
            </div>
          </div>`;
        }).join("")}
        ${_totals.discountPct > 0 ? `<div class="cart-lines-discount">
          <span>Bulk Discount (${_totals.discountPct}% off)</span>
          <span class="discount-amount">−${formatMoney(_totals.discountCents)}</span>
        </div>` : ""}
        <div class="cart-lines-total">
          <span>Total (${_totals.totalQty} items)</span>
          <span>${_totals.discountPct > 0 ? `<span class="original-total">${formatMoney(_totals.totalCents)}</span> ` : ""}${formatMoney(_totals.finalCents)}</span>
        </div>
        ${_totals.discountPct > 0 ? `<div class="cart-savings-badge">You save ${formatMoney(_totals.discountCents)}!</div>` : ""}
        ${_totals.nextTier ? `<div class="cart-next-tier">Add ${_totals.nextTier.needed} more for <strong>${_totals.nextTier.discountPercent}% off</strong>${_totals.nextTier.label ? ` (${_totals.nextTier.label})` : ""}!</div>` : ""}
      </div>`;
    }

    let guidance = "";
    if (specialColor) {
      guidance = "Special order color — contact us to inquire (not available online).";
    } else if (activeViews.length === 0) {
      guidance = "Pick a print spot first.";
    } else if (missingViews.length > 0) {
      guidance = `Upload art for ${missingViews.map(capitalize).join(" & ")} first.`;
    } else if (variants.length === 0) {
      guidance = "Options still loading — refresh if stuck.";
    } else if (!currentVariant) {
      guidance = "That option combo isn’t available.";
    } else if (!currentVariant.available) {
      guidance = "Sold out.";
    }

    const inquireHtml = specialColor
      ? `<div class="order-inquire-banner" role="status">
          <p><strong>Special order</strong> — that color isn’t stocked online.</p>
          <a class="order-inquire-link" href="${escapeHtml(getLifestyleInquirePath())}">Contact us to inquire</a>
        </div>`
      : "";

    const statusHtml = orderStatus
      ? `<div class="order-status order-status--${orderStatus.type}" role="${orderStatus.type === "error" ? "alert" : "status"}">${escapeHtml(orderStatus.message)}</div>`
      : "";

    summaryContainer.innerHTML = `
      <div class="summary-details">
        ${statusHtml}
        ${inquireHtml}
        <div class="order-product-summary">
          <span>${escapeHtml(selectedProduct.name)}</span>
          <button type="button" class="order-edit-link" data-order-scroll="bento-product">Edit</button>
        </div>
        ${locationHtml}
        ${variantHtml}

        <div class="summary-row order-quantity-row">
          <span class="label">Quantity${moq > 1 ? ` <span class="moq-badge">Min ${moq}</span>` : ""}</span>
          <span class="value">
            <span class="quantity-control">
              <button type="button" class="qty-btn" id="qty-minus" aria-label="Decrease quantity">−</button>
              <span class="qty-value" id="qty-display" aria-live="polite">${lineQty}</span>
              <button type="button" class="qty-btn" id="qty-plus" aria-label="Increase quantity">+</button>
            </span>
          </span>
        </div>

        ${bulkTiersHtml}
        ${priceBreakdownHtml}

        <details class="staff-note-disclosure" ${staffNote ? "open" : ""}>
          <summary>Note to print team <span>(optional)</span></summary>
          <div class="staff-note-field">
            <label class="visually-hidden" for="staff-note">Note to print team</label>
            <textarea id="staff-note" class="staff-note-input" rows="3" maxlength="500" placeholder="Notes for the print team (optional)"></textarea>
          </div>
        </details>

        <div class="add-line-row">
          ${guidance ? `<p class="order-inline-guidance" id="add-line-guidance">${escapeHtml(guidance)}</p>` : ""}
          <button type="button" class="btn-add-line" id="btn-add-line" ${canAddLine ? "" : "disabled"} aria-describedby="${guidance ? "add-line-guidance" : ""}">
            ${hasVariants ? "Add variant" : "Add item"}
          </button>
        </div>

        ${cartHtml}
      </div>
    `;

    const noteEl = document.getElementById("staff-note");
    if (noteEl) {
      noteEl.value = staffNote || "";
      noteEl.addEventListener("input", () => {
        staffNote = noteEl.value;
      });
    }

    bindColorSwatches(summaryContainer);

    summaryContainer.querySelectorAll(".variant-select").forEach((sel) => {
      sel.addEventListener("change", () => {
        selectedOptions[sel.dataset.option] = sel.value;
        orderStatus = null;
        renderOrderSummary();
      });
    });

    on("qty-minus", "click", () => {
      if (lineQty > moq) {
        lineQty--;
        renderOrderSummary();
      }
    });
    on("qty-plus", "click", () => {
      lineQty++;
      renderOrderSummary();
    });

    const addLineBtn = document.getElementById("btn-add-line");
    if (addLineBtn) {
      addLineBtn.addEventListener("click", () => {
        if (isSpecialColorOrder()) {
          orderStatus = {
            type: "error",
            message: "Special order color — contact us to inquire.",
          };
          renderOrderSummary();
          return;
        }
        const variant = findMatchingVariant();
        if (!variant && hasVariants) {
          orderStatus = { type: "error", message: "That option combo isn’t available." };
          renderOrderSummary();
          return;
        }
        if (variant && !variant.available) {
          orderStatus = { type: "error", message: "Sold out." };
          renderOrderSummary();
          return;
        }
        const variantId = variant ? variant.id : (variants[0] ? variants[0].id : "");
        const variantPrice = variant ? variant.price : fallbackPrice;
        const fullUnitPrice = variantPrice + surchargeTotal;
        const title = getVariantTitle(variant);

        const existing = cartLines.find((l) => String(l.variantId) === String(variantId));
        if (existing) {
          existing.quantity += lineQty;
        } else {
          cartLines.push({
            variantId,
            variantTitle: title,
            options: { ...selectedOptions },
            quantity: lineQty,
            priceCents: fullUnitPrice,
            basePriceCents: variantPrice,
            surchargeCents: surchargeTotal,
            locations: locationBreakdown.map((loc) => ({
              view: loc.view,
              name: loc.name,
              sizeName: loc.sizeName || null,
              sizeLabel: loc.sizeLabel || null,
              extraPriceCents: loc.extraPriceCents,
            })),
          });
        }
        orderStatus = { type: "success", message: `${lineQty} ${lineQty === 1 ? "item" : "items"} added to draft.` };
        renderOrderSummary();
        renderProgressRail();
      });
    }

    summaryContainer.querySelectorAll(".cart-line-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        cartLines.splice(parseInt(btn.dataset.index), 1);
        orderStatus = null;
        renderOrderSummary();
        renderProgressRail();
      });
    });

    summaryContainer.querySelectorAll("[data-order-scroll]").forEach((button) => {
      button.addEventListener("click", () => {
        setOrderSheetOpen(false);
        const target = document.getElementById(button.dataset.orderScroll);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    if (addToCartBtn) {
      addToCartBtn.disabled = specialColor || cartLines.length === 0;
      const _ct = getCartTotals();
      if (QUOTE_MODE) {
        addToCartBtn.textContent = specialColor
          ? "Inquire for special colors"
          : cartLines.length > 0
            ? `Request quote · ${_ct.totalQty} items · ${formatMoney(_ct.finalCents)}`
            : "Request a quote";
      } else {
        addToCartBtn.textContent = specialColor
          ? "Inquire for special colors"
          : cartLines.length > 0
            ? `Add ${_ct.totalQty} to cart · ${formatMoney(_ct.finalCents)}`
            : "Add to cart";
      }
    }
    updateMobileOrderBar();
  }

  /**
   * Load an image as a blob via fetch (same-origin), convert to an object URL,
   * and create an Image element from it. This avoids canvas taint from cross-origin images.
   */
  const _baseImageCache = {}; // cache base images per URL to avoid refetching
  async function loadImageAsBlob(url) {
    if (_baseImageCache[url]) return _baseImageCache[url];
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const img = await new Promise((resolve) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(null); };
        i.src = objectUrl;
      });
      if (img) _baseImageCache[url] = img;
      return img;
    } catch (e) {
      console.warn("[MockupEditor] Blob fetch failed:", url, e.message);
      return null;
    }
  }

  /** Pre-load all base images for uploaded views (called once before composites) */
  async function preloadBaseImages(views) {
    const promises = views.map(async (view) => {
      const imageKey = view === "front" ? selectedProduct.frontImageKey
        : view === "back" ? selectedProduct.backImageKey
        : selectedProduct.sideImageKey;
      if (imageKey) {
        const direct = (config.appUrl || APP_URL || "").replace(/\/+$/, "");
        const candidates = [
          direct ? `${direct}/api/serve-image?key=${encodeURIComponent(imageKey)}` : null,
          `/apps/mockup/api/serve-image?key=${encodeURIComponent(imageKey)}`,
        ].filter(Boolean);
        for (const proxyUrl of candidates) {
          const img = await loadImageAsBlob(proxyUrl);
          if (img) return;
        }
      }
      // Fallback to presigned URL
      const rawUrl = view === "front" ? selectedProduct.frontImageUrl
        : view === "back" ? selectedProduct.backImageUrl
        : selectedProduct.sideImageUrl;
      const baseUrl = resolveImageUrl(rawUrl);
      if (baseUrl) await loadImageAsBlob(baseUrl);
    });
    await Promise.all(promises);
  }

  const LIFESTYLE_ANGLE_ORDER = ["front", "front_closeup", "back", "back_closeup"];

  /**
   * Export one lifestyle plate (model photo + placed art) as a JPEG data URL.
   */
  async function captureLifestyleComposite(plate) {
    if (!plate || !plate.imageKey) return null;
    const view = plate.designView;
    const plateImg = await loadLifestylePlateImage(plate.imageKey);
    if (!plateImg) return null;

    const W = 480;
    const H = 640;
    const offscreen = document.createElement("canvas");
    offscreen.width = W;
    offscreen.height = H;
    const ctx = offscreen.getContext("2d");
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, W, H);

    const plateSize = getImageSize(plateImg);
    const contain = getContainRect(plateSize.w, plateSize.h, W, H);
    ctx.drawImage(plateImg, contain.x, contain.y, contain.w, contain.h);

    if (uploadedFiles[view]) {
      const b = getSavedLifestylePrintZone(plate, view);
      if (b) {
        const asset = await ensurePlacementAssets(view);
        if (asset && asset.designImg) {
          designDrawInfo[view] = computePlacementLayout(
            view,
            asset.baseImg,
            asset.designImg,
            PREVIEW_W,
            PREVIEW_H,
          );
          const zoneX = contain.x + b.x * contain.w;
          const zoneY = contain.y + b.y * contain.h;
          const zoneW = b.width * contain.w;
          const zoneH = b.height * contain.h;
          const mapW = zoneW * CLOSEUP_ZOOM;
          const mapH = zoneH * CLOSEUP_ZOOM;
          const rect = mapDesignFromFlatPrintArea(
            view,
            zoneX + (zoneW - mapW) / 2,
            zoneY + (zoneH - mapH) / 2,
            mapW,
            mapH,
          );
          ctx.drawImage(asset.designImg, rect.x, rect.y, rect.w, rect.h);
        }
      }
    }

    try {
      return offscreen.toDataURL("image/jpeg", 0.85);
    } catch (e) {
      console.warn("[MockupEditor] Lifestyle export failed:", plate.angle, e);
      return null;
    }
  }

  /**
   * Build a fresh off-screen composite canvas for a view and export it as a data URL.
   * Uses JPEG format (0.8 quality) for much smaller file sizes = faster upload.
   * Uses cached base images to avoid redundant fetches.
   */
  async function captureComposite(view) {
    if (!uploadedFiles[view] || !selectedProduct) return null;

    const W = 400, H = 480; // Smaller canvas = smaller file = faster upload
    const offscreen = document.createElement("canvas");
    offscreen.width = W;
    offscreen.height = H;
    const ctx = offscreen.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    const asset = await ensurePlacementAssets(view);
    const baseImg = asset && asset.baseImg ? asset.baseImg : null;
    const designImg = asset && asset.designImg ? asset.designImg : null;
    if (!designImg) return null;

    // Offsets are stored in PREVIEW_W×PREVIEW_H space — scale into export canvas
    const previewLayout = computePlacementLayout(view, baseImg, designImg, PREVIEW_W, PREVIEW_H);
    const sx = W / PREVIEW_W;
    const sy = H / PREVIEW_H;

    if (baseImg) {
      ctx.drawImage(
        baseImg,
        previewLayout.baseX * sx,
        previewLayout.baseY * sy,
        previewLayout.baseW * sx,
        previewLayout.baseH * sy
      );
    } else {
      ctx.fillStyle = "#f5f5f5";
      ctx.fillRect(0, 0, W, H);
    }

    ctx.drawImage(
      designImg,
      previewLayout.x * sx,
      previewLayout.y * sy,
      previewLayout.designW * sx,
      previewLayout.designH * sy
    );

    try {
      return offscreen.toDataURL("image/jpeg", 0.8);
    } catch (e) {
      console.error("[MockupEditor] Composite export failed:", e);
      return null;
    }
  }

  // ===== Upload helper (reusable) =====
  async function uploadToServer(orderId, contentType, imageData) {
    const payload = JSON.stringify({ orderId, contentType, imageData });
    const directUrl = (config.appUrl || APP_URL || "").replace(/\/+$/, "");
    const uploadUrls = [];
    if (directUrl) uploadUrls.push(`${directUrl}/api/upload-mockup`);
    if (!QUOTE_MODE) uploadUrls.push("/apps/mockup/api/upload-mockup");
    else if (!directUrl) uploadUrls.push("/apps/mockup/api/upload-mockup");

    for (const url of uploadUrls) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });
        const ct = res.headers.get("content-type") || "";
        if (res.ok && ct.includes("json")) {
          const result = await res.json();
          if (result.key) return result;
        }
      } catch (e) {
        console.warn("[MockupEditor] Upload to", url, "error:", e.message);
      }
    }
    return null;
  }

  // ===== Progress Tracker Helpers =====
  const PROGRESS_STEPS = [
    { id: "prepare",  label: "Getting ready…" },
    { id: "upload",   label: "Uploading art…" },
    { id: "mockup",   label: "Making preview…" },
    { id: "cart",     label: QUOTE_MODE ? "Preparing quote…" : "Adding to cart…" },
    { id: "done",     label: "Done!" },
  ];

  function showProgress() {
    const el = document.getElementById("upload-progress");
    const track = document.getElementById("upload-steps-track");
    if (!el) return;
    el.style.display = "";
    el.classList.remove("done");
    // Build step dots
    if (track) {
      track.innerHTML = PROGRESS_STEPS.slice(0, -1).map((s, i) => {
        const dot = `<div class="upload-step-dot" data-step="${s.id}"><span class="dot"></span><span class="dot-label">${
          s.id === "prepare" ? "Prepare" :
          s.id === "upload" ? "Upload" :
          s.id === "mockup" ? "Mockup" : "Cart"
        }</span></div>`;
        const connector = i < PROGRESS_STEPS.length - 2 ? `<div class="upload-step-connector" data-after="${s.id}"></div>` : "";
        return dot + connector;
      }).join("");
    }
    setProgressStep("prepare");
  }

  function setProgressStep(stepId) {
    const label = document.getElementById("upload-step-label");
    const step = PROGRESS_STEPS.find((s) => s.id === stepId);
    if (label && step) {
      // Smooth text swap with fade
      label.classList.add("fade-swap");
      setTimeout(() => {
        label.textContent = step.label;
        label.classList.remove("fade-swap");
      }, 200);
    }
    // Update dots
    const stepIdx = PROGRESS_STEPS.findIndex((s) => s.id === stepId);
    document.querySelectorAll(".upload-step-dot").forEach((dot) => {
      const dotStep = dot.getAttribute("data-step");
      const dotIdx = PROGRESS_STEPS.findIndex((s) => s.id === dotStep);
      dot.classList.remove("active", "done");
      if (dotIdx < stepIdx) dot.classList.add("done");
      else if (dotIdx === stepIdx) dot.classList.add("active");
    });
    // Update connectors
    document.querySelectorAll(".upload-step-connector").forEach((conn) => {
      const afterStep = conn.getAttribute("data-after");
      const afterIdx = PROGRESS_STEPS.findIndex((s) => s.id === afterStep);
      conn.classList.toggle("done", afterIdx < stepIdx);
    });
  }

  function hideProgress(success) {
    const el = document.getElementById("upload-progress");
    if (!el) return;
    if (success) {
      el.classList.add("done");
      setProgressStep("done");
      setTimeout(() => { el.style.display = "none"; el.classList.remove("done"); }, 2000);
    } else {
      el.style.display = "none";
    }
  }

  // ===== Add to Shopify Cart =====
  async function handleAddToCart() {
    if (isSpecialColorOrder()) {
      orderStatus = {
        type: "error",
        message: "Special order color — contact us to inquire.",
      };
      renderOrderSummary();
      return;
    }
    if (cartLines.length === 0) {
      orderStatus = { type: "error", message: "Add an item to your draft first." };
      renderOrderSummary();
      return;
    }
    const missingViews = getActiveViews().filter((view) => !uploadedFiles[view]);
    if (missingViews.length > 0) {
      orderStatus = { type: "error", message: `Upload art for ${missingViews.map(capitalize).join(" & ")} first.` };
      renderOrderSummary();
      return;
    }
    // Enforce MOQ
    const _moqCheck = (selectedProduct && selectedProduct.minOrderQty) ? selectedProduct.minOrderQty : 1;
    const _totalQtyCheck = cartLines.reduce((sum, l) => sum + l.quantity, 0);
    if (_totalQtyCheck < _moqCheck) {
      orderStatus = {
        type: "error",
        message: `Need at least ${_moqCheck} items (you have ${_totalQtyCheck}).`,
      };
      renderOrderSummary();
      return;
    }
    const btn = document.getElementById("btn-add-to-cart");
    if (btn) { btn.disabled = true; btn.textContent = "Working..."; }
    orderStatus = null;

    // Show animated progress tracker
    showProgress();

    try {
      const uploadedViews = getUploadedViews();
      const locationDesc = uploadedViews
        .map((v) => { const l = getLocationName(v); return l ? `${capitalize(v)}: ${l}` : capitalize(v); })
        .join(", ");

      // Step 1: Prepare — pre-load base images (cached for composites)
      setProgressStep("prepare");
      await preloadBaseImages(uploadedViews);

      // Step 2: Upload designs in parallel
      setProgressStep("upload");
      const designPromises = uploadedViews.map(async (view) => {
        const file = uploadedFiles[view];
        if (!file) return null;
        try {
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          const result = await uploadToServer(
            `design-${view}-${Date.now()}`,
            file.type || "image/png",
            dataUrl,
          );
          if (result) {
            const locName = getLocationName(view) || capitalize(view);
            return { view, locName, downloadUrl: result.downloadUrl, key: result.key };
          }
        } catch (e) {
          console.warn("[MockupEditor] Design upload error for", view, ":", e);
        }
        return null;
      });

      // Step 3: flat composites + lifestyle (4 model shots) in parallel with designs
      const compositePromises = uploadedViews.map(async (view) => {
        try {
          const dataUrl = await captureComposite(view);
          if (!dataUrl) return null;
          const result = await uploadToServer(
            `mockup-${view}-${Date.now()}`,
            "image/jpeg",
            dataUrl,
          );
          if (result) {
            return { view, key: result.key, downloadUrl: result.downloadUrl };
          }
        } catch (e) {
          console.warn("[MockupEditor] Composite error for", view, ":", e);
        }
        return null;
      });

      const lifestylePlates = getLifestylePlatesForGender()
        .slice()
        .sort(
          (a, b) =>
            LIFESTYLE_ANGLE_ORDER.indexOf(a.angle) -
            LIFESTYLE_ANGLE_ORDER.indexOf(b.angle),
        );
      const lifestylePromises = lifestylePlates.map(async (plate) => {
        try {
          const dataUrl = await captureLifestyleComposite(plate);
          if (!dataUrl) return null;
          const result = await uploadToServer(
            `lifestyle-${plate.angle}-${Date.now()}`,
            "image/jpeg",
            dataUrl,
          );
          if (result) {
            return {
              angle: plate.angle,
              key: result.key,
              downloadUrl: result.downloadUrl,
            };
          }
        } catch (e) {
          console.warn("[MockupEditor] Lifestyle upload error:", plate.angle, e);
        }
        return null;
      });

      // Wait for all uploads to finish in parallel
      const allUploads = Promise.all([
        Promise.all(designPromises),
        Promise.all(compositePromises),
        Promise.all(lifestylePromises),
      ]);

      // While uploads are running, advance to "mockup" step after a short delay
      // so the user sees each step tick forward smoothly
      const mockupStepTimer = setTimeout(() => setProgressStep("mockup"), 1800);
      const [designResults, compositeResults, lifestyleResults] = await allUploads;
      clearTimeout(mockupStepTimer);

      // Ensure mockup step shows briefly even if uploads were fast
      setProgressStep("mockup");
      await new Promise((r) => setTimeout(r, 400));

      const designLinks = designResults.filter(Boolean);
      const compositeLinks = compositeResults.filter(Boolean);
      if (designLinks.length !== uploadedViews.length) {
        throw new Error("Upload failed. Try again.");
      }
      if (compositeLinks.length !== uploadedViews.length) {
        throw new Error("Preview failed. Try again.");
      }

      let mockupUrl = "";
      let mockupKey = "";
      if (designLinks.length > 0) {
        mockupUrl = designLinks[0].downloadUrl || "";
        mockupKey = designLinks[0].key || "";
      }

      // Step 4: Add to cart
      setProgressStep("cart");

      // Build per-location surcharge breakdown (e.g. "Left Chest +$5.00, Big Back +$8.00")
      const locBreakdown = getLocationBreakdown();
      const surchargeDesc = locBreakdown
        .filter((l) => l.extraPriceCents > 0)
        .map((l) => {
          let desc = l.name;
          if (l.sizeName) desc += ` (${l.sizeName})`;
          desc += ` +${formatMoney(l.extraPriceCents)}`;
          return desc;
        })
        .join(", ");
      const totalSurchargeCents = getLocationSurcharge();

      // Build print sizes description
      const sizeDesc = locBreakdown
        .filter((l) => l.sizeName)
        .map((l) => `${capitalize(l.view)}: ${l.sizeName}${l.sizeLabel ? ` (${l.sizeLabel})` : ""}`)
        .join(", ");

      // Underscore props stay on the order for admin. Keep them SHORT (keys only) —
      // some themes still render "_" properties in the cart. Cart JS builds image URLs
      // from _mockup_key. Customer-visible: only "Print".
      const baseProperties = {
        _product_type: selectedProduct ? selectedProduct.name : "",
        _print_locations: locationDesc,
      };
      if (sizeDesc) {
        baseProperties._print_sizes = sizeDesc;
      }
      if (totalSurchargeCents > 0) {
        baseProperties._location_surcharge = formatMoney(totalSurchargeCents);
        baseProperties._location_surcharge_cents = String(totalSurchargeCents);
        baseProperties._surcharge_details = surchargeDesc;
      }

      // Design artwork keys (admin reconstructs download URLs)
      if (mockupKey) {
        baseProperties._design_key = mockupKey;
      }
      const designKeys = designLinks.map((dl) => dl.key).filter(Boolean);
      if (designKeys.length > 1) {
        baseProperties._design_keys = designKeys.join(",");
      } else if (designKeys.length === 1 && !baseProperties._design_key) {
        baseProperties._design_key = designKeys[0];
      }

      // Flat composites (staff) + lifestyle gallery (customer cart)
      const shopOrigin = window.location.origin;
      const serveProxy = (key) =>
        `${shopOrigin}/apps/mockup/api/serve-image?key=${encodeURIComponent(key)}`;

      const lifestyleLinks = (lifestyleResults || []).filter(Boolean);
      const lifestyleKeys = lifestyleLinks.map((l) => l.key).filter(Boolean);
      if (lifestyleKeys.length) {
        // Prefer per-slot props — Shopify caps each property value at 255 chars,
        // so a comma-joined list of long keys was getting dropped entirely.
        lifestyleLinks.forEach((link, i) => {
          if (!link || !link.key || i >= 4) return;
          baseProperties[`_lk${i + 1}`] = link.key;
          if (link.angle) baseProperties[`_la${i + 1}`] = link.angle;
        });
        const joinedKeys = lifestyleKeys.join(",");
        const joinedAngles = lifestyleLinks
          .map((l) => l.angle)
          .filter(Boolean)
          .join(",");
        if (joinedKeys.length <= 255) {
          baseProperties._lifestyle_keys = joinedKeys;
        }
        if (joinedAngles.length <= 255) {
          baseProperties._lifestyle_angles = joinedAngles;
        }
        // Primary mockup for checkout / legacy scripts = first lifestyle shot
        // Store KEY only (URLs often exceed 255 chars and get stripped).
        baseProperties._mockup_key = lifestyleKeys[0];
        const proxyPath = serveProxy(lifestyleKeys[0]);
        if (proxyPath.length <= 255) {
          baseProperties._mockup_url = proxyPath;
        }
      }

      const primaryComposite = compositeLinks.find((cl) => cl.key) || null;
      const compositeKey =
        (primaryComposite && primaryComposite.key) ||
        (compositeLinks.find((cl) => cl.key) || {}).key ||
        "";
      if (compositeKey) {
        baseProperties._flat_mockup_key = compositeKey;
        if (!baseProperties._mockup_key) {
          baseProperties._mockup_key = compositeKey;
          const proxyPath = serveProxy(compositeKey);
          if (proxyPath.length <= 255) {
            baseProperties._mockup_url = proxyPath;
          }
        }
      }
      const mockupKeys = compositeLinks.map((cl) => cl.key).filter(Boolean);
      if (mockupKeys.length > 1) {
        baseProperties._mockup_keys = mockupKeys.join(",");
      }

      // Store design placement / scale adjustments for staff
      const placementDesc = uploadedViews
        .filter((v) => isPlacementAdjusted(v))
        .map((v) => {
          const parts = [capitalize(v)];
          const off = designOffsets[v];
          if (off && (off.dx !== 0 || off.dy !== 0)) parts.push("moved");
          const scale = getDesignScale(v);
          if (Math.abs(scale - 1) > 0.01) parts.push(`${Math.round(scale * 100)}%`);
          return parts.join(": ");
        })
        .join(", ");
      if (placementDesc) {
        baseProperties._placement_adjusted = placementDesc;
      }
      const scaleDesc = uploadedViews
        .filter((v) => Math.abs(getDesignScale(v) - 1) > 0.01)
        .map((v) => `${capitalize(v)} ${Math.round(getDesignScale(v) * 100)}%`)
        .join(", ");
      if (scaleDesc) {
        baseProperties._design_scale = scaleDesc;
      }

      const trimmedNote = (staffNote || "").trim();
      if (trimmedNote) {
        baseProperties._staff_note = trimmedNote.slice(0, 500);
      }

      // Bulk discount info (staff / order meta)
      const _bulkTotals = getCartTotals();
      if (_bulkTotals.discountPct > 0) {
        baseProperties._bulk_discount = `${_bulkTotals.discountPct}% off`;
        baseProperties._bulk_savings = formatMoney(_bulkTotals.discountCents);
      }

      // One short customer-visible line (not the full meta dump)
      const printSummary = [locationDesc, sizeDesc].filter(Boolean).join(" · ");
      if (printSummary) {
        baseProperties.Print = printSummary;
      }

      // Main product line items
      const mainItems = cartLines.map((line) => ({
        id: parseInt(line.variantId),
        quantity: line.quantity,
        properties: { ...baseProperties },
      }));

      // Fee line items — one per priced location, quantity = total items ordered
      const totalQty = cartLines.reduce((sum, l) => sum + l.quantity, 0);
      const feeItems = [];
      for (const loc of locBreakdown) {
        if (loc.extraPriceCents > 0 && loc.feeVariantId) {
          feeItems.push({
            id: parseInt(loc.feeVariantId),
            quantity: totalQty,
            properties: {
              _fee_for: selectedProduct ? selectedProduct.name : "",
              _location: loc.name,
            },
          });
        }
      }

      const items = [...mainItems, ...feeItems];

      if (QUOTE_MODE) {
        hideProgress(true);
        const contact = await collectQuoteContact();
        if (!contact) {
          orderStatus = { type: "error", message: "Quote cancelled — your draft is still here." };
          return;
        }
        const appBase = (config.appUrl || APP_URL || "").replace(/\/+$/, "");
        const imageUrl = (key) =>
          key && appBase
            ? `${appBase}/api/serve-image?key=${encodeURIComponent(key)}`
            : "";
        const lifestyleUrls = lifestyleKeys.map(imageUrl).filter(Boolean);
        const payload = {
          type: "mockup-quote",
          ...contact,
          productType: selectedProduct ? selectedProduct.name : "",
          printLocations: locationDesc,
          printSizes: sizeDesc,
          estimatedTotalCents: getCartTotals().finalCents,
          estimatedTotal: formatMoney(getCartTotals().finalCents),
          quantity: getCartTotals().totalQty,
          lines: cartLines.map((line) => ({
            variantId: line.variantId,
            variantTitle: line.variantTitle,
            quantity: line.quantity,
            priceCents: line.priceCents,
          })),
          designKeys,
          mockupKey,
          lifestyleKeys,
          designUrls: designKeys.map(imageUrl).filter(Boolean),
          mockupUrl: imageUrl(mockupKey) || mockupUrl,
          lifestyleUrls,
          staffNote: staffNote || "",
          surchargeDetails: surchargeDesc || "",
        };
        const quoteRes = await fetch(QUOTE_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!quoteRes.ok) {
          const err = await quoteRes.json().catch(() => ({}));
          throw new Error(err.error || "Quote request failed");
        }
        cartLines = [];
        orderStatus = {
          type: "success",
          message: "Quote sent — we’ll email pricing and timing shortly.",
        };
        renderWorkspace();
      } else {
        const res = await fetch("/cart/add.js", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        });

        if (res.ok) {
          await refreshSidebarCart();
          hideProgress(true);
          cartLines = [];
          orderStatus = { type: "success", message: "Added to cart. Keep designing or check out." };
          renderWorkspace();
        } else {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.description || "Failed to add to cart");
        }
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      hideProgress(false);
      orderStatus = {
        type: "error",
        message: QUOTE_MODE
          ? `Couldn’t send quote. ${err.message}`
          : `Couldn’t add to cart. ${err.message}`,
      };
      renderOrderSummary();
    } finally {
      renderOrderSummary();
    }
  }

  function collectQuoteContact() {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "mockup-modal-overlay";
      overlay.innerHTML = `
        <div class="mockup-modal mockup-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="quote-modal-title">
          <h3 id="quote-modal-title">Request a quote</h3>
          <p>Tell us where to send pricing. Your mockups and size run will be attached.</p>
          <form id="quote-contact-form" class="quote-contact-form" style="display:grid;gap:0.75rem;text-align:left;margin-top:1rem;">
            <label style="display:grid;gap:0.3rem;font-weight:600;font-size:0.9rem;">Name
              <input name="name" required autocomplete="name" style="padding:10px 12px;border:1px solid #e5e5e5;border-radius:8px;font:inherit;" />
            </label>
            <label style="display:grid;gap:0.3rem;font-weight:600;font-size:0.9rem;">Email
              <input name="email" type="email" required autocomplete="email" style="padding:10px 12px;border:1px solid #e5e5e5;border-radius:8px;font:inherit;" />
            </label>
            <label style="display:grid;gap:0.3rem;font-weight:600;font-size:0.9rem;">Company / event
              <input name="company" autocomplete="organization" style="padding:10px 12px;border:1px solid #e5e5e5;border-radius:8px;font:inherit;" />
            </label>
            <label style="display:grid;gap:0.3rem;font-weight:600;font-size:0.9rem;">Shipping region
              <select name="region" style="padding:10px 12px;border:1px solid #e5e5e5;border-radius:8px;font:inherit;">
                <option>Alberta</option>
                <option>Rest of Canada</option>
                <option>Calgary pickup</option>
              </select>
            </label>
            <label style="display:grid;gap:0.3rem;font-weight:600;font-size:0.9rem;">Notes (optional)
              <textarea name="message" rows="3" style="padding:10px 12px;border:1px solid #e5e5e5;border-radius:8px;font:inherit;"></textarea>
            </label>
            <div class="modal-actions">
              <button type="button" class="mockup-btn mockup-btn-secondary" data-quote-cancel>Cancel</button>
              <button type="submit" class="mockup-btn mockup-btn-primary">Send quote request</button>
            </div>
          </form>
        </div>`;
      const finish = (value) => {
        overlay.remove();
        document.removeEventListener("keydown", onKeyDown);
        resolve(value);
      };
      const onKeyDown = (event) => {
        if (event.key === "Escape") finish(null);
      };
      overlay.querySelector("[data-quote-cancel]").addEventListener("click", () => finish(null));
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) finish(null);
      });
      overlay.querySelector("#quote-contact-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = Object.fromEntries(new FormData(form).entries());
        finish(data);
      });
      document.addEventListener("keydown", onKeyDown);
      (document.getElementById("mockup-editor") || document.body).appendChild(overlay);
      requestAnimationFrame(() => overlay.querySelector("input[name='name']")?.focus());
    });
  }

  // ===== Utilities =====
  function confirmDiscardWork(title, message) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "mockup-modal-overlay";
      overlay.innerHTML = `
        <div class="mockup-modal mockup-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="discard-modal-title">
          <h3 id="discard-modal-title">${escapeHtml(title)}</h3>
          <p>${escapeHtml(message)}</p>
          <div class="modal-actions">
            <button type="button" class="mockup-btn mockup-btn-secondary" data-discard-cancel>Cancel</button>
            <button type="button" class="mockup-btn mockup-btn-primary" data-discard-confirm>Yes, continue</button>
          </div>
        </div>`;
      const finish = (value) => {
        overlay.remove();
        document.removeEventListener("keydown", onKeyDown);
        resolve(value);
      };
      const onKeyDown = (event) => {
        if (event.key === "Escape") finish(false);
      };
      overlay.querySelector("[data-discard-cancel]").addEventListener("click", () => finish(false));
      overlay.querySelector("[data-discard-confirm]").addEventListener("click", () => finish(true));
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) finish(false);
      });
      document.addEventListener("keydown", onKeyDown);
      (document.getElementById("mockup-editor") || document.body).appendChild(overlay);
      requestAnimationFrame(() => overlay.querySelector("[data-discard-cancel]")?.focus());
    });
  }

  function showPreviewImage(elementId, file) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const reader = new FileReader();
    reader.onload = (e) => { el.src = e.target.result; };
    reader.readAsDataURL(file);
  }

  // ===== Image Quality & Background Analysis =====

  /**
   * Analyze an uploaded image for:
   * 1. Whether it has a non-transparent background
   * 2. Print quality based on resolution vs print area size
   * Returns { hasBackground, qualityLevel, qualityLabel, widthPx, heightPx, message }
   */
  function analyzeImage(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const w = img.naturalWidth;
          const h = img.naturalHeight;

          // --- Background detection ---
          // Sample corner pixels on a small canvas to check transparency
          const sampleCanvas = document.createElement("canvas");
          const sampleSize = Math.min(w, h, 200);
          sampleCanvas.width = sampleSize;
          sampleCanvas.height = sampleSize;
          const sCtx = sampleCanvas.getContext("2d");
          sCtx.drawImage(img, 0, 0, sampleSize, sampleSize);
          const corners = [
            sCtx.getImageData(0, 0, 1, 1).data,                                     // top-left
            sCtx.getImageData(sampleSize - 1, 0, 1, 1).data,                         // top-right
            sCtx.getImageData(0, sampleSize - 1, 1, 1).data,                         // bottom-left
            sCtx.getImageData(sampleSize - 1, sampleSize - 1, 1, 1).data,            // bottom-right
            sCtx.getImageData(Math.floor(sampleSize / 2), 0, 1, 1).data,             // top-center
            sCtx.getImageData(Math.floor(sampleSize / 2), sampleSize - 1, 1, 1).data // bottom-center
          ];
          // Check if most corners are opaque and similar color (likely has a background)
          let opaqueCorners = 0;
          let whiteCorners = 0;
          for (const px of corners) {
            if (px[3] > 240) opaqueCorners++;
            if (px[3] > 240 && px[0] > 230 && px[1] > 230 && px[2] > 230) whiteCorners++;
          }
          const hasBackground = opaqueCorners >= 5; // 5 out of 6 corners are opaque
          const isWhiteBg = whiteCorners >= 5;
          const isTransparent = opaqueCorners <= 1;

          // --- Print quality estimation ---
          // Typical print areas are ~8-12 inches wide.
          // 150 DPI = acceptable, 300 DPI = great.
          // We estimate based on the larger dimension for a 10-inch print area.
          const printSizeInches = 10;
          const effectiveDpi = Math.max(w, h) / printSizeInches;

          let qualityLevel, qualityLabel, qualityColor;
          if (effectiveDpi >= 250) {
            qualityLevel = "excellent";
            qualityLabel = "Looks sharp — good to print";
            qualityColor = "#16a34a";
          } else if (effectiveDpi >= 150) {
            qualityLevel = "good";
            qualityLabel = "Good print quality";
            qualityColor = "#16a34a";
          } else if (effectiveDpi >= 100) {
            qualityLevel = "fair";
            qualityLabel = "OK — may look soft if printed large";
            qualityColor = "#d97706";
          } else {
            qualityLevel = "low";
            qualityLabel = "Low quality — may look blurry";
            qualityColor = "#dc2626";
          }

          resolve({
            hasBackground,
            isWhiteBg,
            isTransparent,
            qualityLevel,
            qualityLabel,
            qualityColor,
            widthPx: w,
            heightPx: h,
            effectiveDpi: Math.round(effectiveDpi),
          });
        };
        img.onerror = () => resolve(null);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  // Store analysis results per view
  const imageAnalysis = {};

  function renderAnalysisBadges(view) {
    const analysis = imageAnalysis[view];
    const container = document.getElementById(`analysis-${view}`);
    if (!container || !analysis) return;

    let html = `<div class="analysis-badge" style="color: ${analysis.qualityColor}" title="${analysis.widthPx} × ${analysis.heightPx} px">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l2.5 2.5L16 9"/></svg>
      <span>${analysis.qualityLabel}</span>
    </div>`;

    if (analysis.hasBackground && !analysis.isTransparent) {
      const bgMsg = analysis.isWhiteBg
        ? "White background — may show on dark products"
        : "Solid background — PNG with clear bg works best";
      html += `<div class="analysis-badge analysis-badge-warn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span>${bgMsg}</span>
      </div>`;
    }

    container.innerHTML = html;
  }

  // ===== Checkout Guard =====

  function bindCheckoutGuard() {
    const checkoutBtn = document.getElementById("btn-checkout");
    if (!checkoutBtn) return;

    checkoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const proceed = await showCheckoutConfirmation();
      if (proceed) {
        window.location.href = "/checkout";
      }
    });
  }

  function showCheckoutConfirmation() {
    return new Promise((resolve) => {
      // Check if there's work in progress (uploads, selections, cart lines not yet added)
      const hasUploads = getUploadedViews().length > 0;
      const hasPendingLines = cartLines.length > 0;
      const inProgress = hasUploads || hasPendingLines;

      const warnings = [];
      if (hasPendingLines) {
        warnings.push("Draft items aren’t in the cart yet — tap Add to cart first.");
      }
      if (inProgress && !hasPendingLines && hasUploads) {
        warnings.push("Your art may not be in the cart yet.");
      }

      const previousFocus = document.activeElement;
      const overlay = document.createElement("div");
      overlay.className = "mockup-modal-overlay";
      overlay.innerHTML = `
        <div class="mockup-modal mockup-modal-checkout" role="dialog" aria-modal="true" aria-labelledby="checkout-modal-title">
          <div class="checkout-modal-icon" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h3 id="checkout-modal-title">Go to checkout?</h3>
          <p class="checkout-modal-text">
            ${inProgress ? "<strong>Unsaved work on this page will be lost.</strong>" : "You’ll leave this builder."}
          </p>
          ${warnings.length > 0 ? `<div class="checkout-modal-warnings">${warnings.map((w) => `<div class="checkout-modal-warn-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span>${w}</span></div>`).join("")}</div>` : ""}
          <p class="checkout-modal-subtext">Add everything to cart before you go.</p>
          <div class="modal-actions">
            <button type="button" class="mockup-btn mockup-btn-secondary" id="checkout-cancel">Stay here</button>
            <button type="button" class="mockup-btn mockup-btn-primary mockup-btn-checkout" id="checkout-proceed">Checkout</button>
          </div>
        </div>
      `;

      const editorRoot = document.getElementById("mockup-editor");
      (editorRoot || document.body).appendChild(overlay);

      const cancelBtn = overlay.querySelector("#checkout-cancel");
      const proceedBtn = overlay.querySelector("#checkout-proceed");
      const finish = (value) => {
        overlay.remove();
        document.removeEventListener("keydown", onKeyDown);
        if (!value && previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
        resolve(value);
      };
      const onKeyDown = (event) => {
        if (event.key === "Escape") finish(false);
      };

      cancelBtn.addEventListener("click", () => finish(false));
      proceedBtn.addEventListener("click", () => finish(true));
      overlay.addEventListener("click", (e) => { if (e.target === overlay) finish(false); });
      document.addEventListener("keydown", onKeyDown);
      requestAnimationFrame(() => cancelBtn.focus());
    });
  }

  // ===== Bootstrap =====
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
