const toggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const header = document.querySelector("[data-header]");
const brandLogo = document.querySelector(".brand-logo, .brand-logo-widget img");
const brandLogoData = brandLogo ? (brandLogo.closest(".brand-logo-widget") || brandLogo) : null;
const brandLogoDarkDefault = brandLogo?.src || "";
const brandLogoLightDefault = brandLogoDarkDefault.replace(/mbsi-logo-final\.png(?:\?.*)?$/i, "mbsi-logo-final-white.optimized.webp");
const scrollProgress = document.querySelector("[data-scroll-progress]");
const dropdownTriggers = document.querySelectorAll("[data-dropdown-trigger]");
const navItems = document.querySelectorAll(".nav-item");
const isTeamPath = window.location.pathname.replace(/\\\\/g, "/").startsWith("/our-team/") || window.location.pathname === "/our-team";

if (isTeamPath) {
  document.querySelectorAll("#primary .team-showcase-card").forEach((card) => {
    const nameLink = card.querySelector(".team-name-link[href]");
    if (!nameLink || card.querySelector(".team-card-link")) return;

    const name = nameLink.textContent.trim();
    const role = card.querySelector(".role")?.textContent.trim();
    const cardLink = document.createElement("a");
    cardLink.className = "team-card-link";
    cardLink.href = nameLink.href;
    cardLink.setAttribute("aria-label", `View ${name}${role ? `, ${role}` : ""} profile`);
    nameLink.replaceWith(document.createTextNode(name));
    card.append(cardLink);
  });
}

if (toggle && nav) {
  const mobilePanel = window.matchMedia("(max-width: 1160px)");

  const setMobileNavOpen = (isOpen) => {
    nav.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));

    /* Release the sticky header only while the mobile panel is open, so the
       document can scroll the expanded dropdowns into reach. On desktop the
       nav is permanently visible and must keep the sticky bar. */
    header?.classList.toggle("is-open", isOpen && mobilePanel.matches);
  };

  toggle.addEventListener("click", () => {
    setMobileNavOpen(!nav.classList.contains("is-open"));
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      setMobileNavOpen(false);
    }
  });

  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("is-open")) return;
    if (event.target.closest(".site-nav, [data-nav-toggle]")) return;
    setMobileNavOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setMobileNavOpen(false);
      toggle.focus();
    }
  });

  /* Rotating or crossing the desktop breakpoint while the panel is open would
     otherwise leave the non-sticky header behind. */
  mobilePanel.addEventListener("change", (event) => {
    if (!event.matches) setMobileNavOpen(false);
  });
}

dropdownTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const item = trigger.closest(".nav-item");
    const isActive = item.classList.contains("is-active");

    document.querySelectorAll(".nav-item.is-active").forEach((activeItem) => {
      if (activeItem !== item) activeItem.classList.remove("is-active");
    });

    item.classList.toggle("is-active", !isActive);
  });
});

const isDesktopPointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

navItems.forEach((item) => {
  let closeTimer;

  const clearCloseTimer = () => {
    if (closeTimer) window.clearTimeout(closeTimer);
  };

  const openItem = () => {
    if (!isDesktopPointer()) return;
    clearCloseTimer();

    document.querySelectorAll(".nav-item.is-active").forEach((activeItem) => {
      if (activeItem !== item) activeItem.classList.remove("is-active");
    });
    item.classList.add("is-active");
  };

  const closeItem = () => {
    if (!isDesktopPointer()) return;
    clearCloseTimer();
    closeTimer = window.setTimeout(() => {
      if (!item.matches(":hover") && !item.matches(":focus-within")) {
        item.classList.remove("is-active");
      }
    }, 120);
  };

  item.addEventListener("pointerenter", openItem);
  item.addEventListener("pointerover", openItem);
  item.addEventListener("mouseover", openItem);
  item.addEventListener("pointerleave", closeItem);
  item.addEventListener("mouseleave", closeItem);

  const panel = item.querySelector(".dropdown-panel");
  if (panel) {
    panel.addEventListener("pointerenter", openItem);
    panel.addEventListener("pointerover", openItem);
    panel.addEventListener("mouseover", openItem);
    panel.addEventListener("pointerleave", closeItem);
    panel.addEventListener("mouseleave", closeItem);
  }
});

nav?.addEventListener("pointerleave", () => {
  if (!isDesktopPointer()) return;
  window.setTimeout(() => {
    if (!nav.matches(":hover") && !nav.matches(":focus-within")) {
      document.querySelectorAll(".nav-item.is-active").forEach((item) => item.classList.remove("is-active"));
    }
  }, 140);
});

nav?.querySelectorAll(":scope > a").forEach((link) => {
  const closeOpenDropdowns = () => {
    if (!isDesktopPointer()) return;
    document.querySelectorAll(".nav-item.is-active").forEach((item) => item.classList.remove("is-active"));
  };

  link.addEventListener("pointerenter", closeOpenDropdowns);
  link.addEventListener("mouseover", closeOpenDropdowns);
  link.addEventListener("focus", closeOpenDropdowns);
});
document.addEventListener("click", (event) => {

  if (!event.target.closest(".nav-item")) {
    document.querySelectorAll(".nav-item.is-active").forEach((item) => item.classList.remove("is-active"));
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.querySelectorAll(".nav-item.is-active").forEach((item) => item.classList.remove("is-active"));
  }
});

document.querySelectorAll("[data-faq-directory], .mbsi-faq-directory").forEach((directory) => {
  const tabs = Array.from(directory.querySelectorAll("[data-faq-tab], .mbsi-faq-topic-nav [role='tab']"));
  const panels = Array.from(directory.querySelectorAll("[data-faq-panel], .mbsi-faq-topic-panel"));
  const tabTopic = (tab) => tab.dataset.faqTab?.trim().split(/\s+/)[0] || (tab.id || "").replace("mbsi-faq-tab-", "") || "general";
  const panelTopic = (panel) => panel.dataset.faqPanel?.trim().split(/\s+/)[0] || (panel.id || "").replace("mbsi-faq-panel-", "") || "general";

  const activateTopic = (topic, moveFocus = false) => {
    tabs.forEach((tab) => {
      const isActive = tabTopic(tab) === topic;
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      if (isActive && moveFocus) tab.focus();
    });
    panels.forEach((panel) => {
      panel.hidden = panelTopic(panel) !== topic;
    });
  };

  /* Some visual-editor conversions can preserve the FAQ answers while
   * flattening the generated directory list. Rebuild that navigation from the
   * actual questions so it always remains complete and in sync. */
  panels.forEach((panel) => {
    const indexList = panel.querySelector(".mbsi-faq-question-index ol");
    const questions = Array.from(panel.querySelectorAll(".mbsi-faq-answers details.mbsi-faq-item"));
    if (!(indexList instanceof HTMLOListElement) || !questions.length) return;
    if (indexList.querySelector("[data-faq-question-link]")) return;

    indexList.replaceChildren();
    questions.forEach((question, questionIndex) => {
      const summary = question.querySelector("summary .mbsi-faq-question, summary");
      const label = summary ? summary.textContent.trim().replace(/^\d+\s*/, "") : "";
      if (!label) return;
      if (!question.id) question.id = `mbsi-faq-${panelTopic(panel)}-${questionIndex + 1}`;

      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${question.id}`;
      link.dataset.faqQuestionLink = "";
      link.textContent = label;
      item.append(link);
      indexList.append(item);
    });
  });

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTopic(tabTopic(tab)));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      activateTopic(tabTopic(tabs[nextIndex]), true);
    });
  });

  directory.querySelectorAll("[data-faq-question-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href") || "";
      const target = targetId.startsWith("#") ? directory.querySelector(targetId) : null;
      if (target instanceof HTMLDetailsElement) {
        event.preventDefault();
        target.open = true;
        window.history.replaceState(null, "", targetId);
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      /* Elementor's native Accordion uses its title as the stable on-page
       * anchor. Open the matching answer before scrolling to it. */
      if (target instanceof HTMLElement && target.classList.contains("elementor-tab-title")) {
        event.preventDefault();
        window.history.replaceState(null, "", targetId);
        if (!target.classList.contains("elementor-active")) {
          target.click();
          /* Wait for Elementor's accordion slide animation so the final
           * document height is known before positioning the answer. */
          window.setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 450);
        } else {
          window.requestAnimationFrame(() => target.scrollIntoView({ behavior: "smooth", block: "start" }));
        }
      }
    });
  });

  if (window.location.hash.startsWith("#mbsi-faq-")) {
    const target = directory.querySelector(window.location.hash);
    const panel = target ? target.closest("[data-faq-panel], .mbsi-faq-topic-panel") : null;
    if (target instanceof HTMLDetailsElement && panel instanceof HTMLElement) {
      activateTopic(panelTopic(panel));
      target.open = true;
    }
  }

  if (window.location.hash.startsWith("#elementor-tab-title-")) {
    const target = directory.querySelector(window.location.hash);
    const panel = target ? target.closest("[data-faq-panel], .mbsi-faq-topic-panel") : null;
    if (target instanceof HTMLElement && target.classList.contains("elementor-tab-title")) {
      if (panel instanceof HTMLElement) activateTopic(panelTopic(panel));
      if (!target.classList.contains("elementor-active")) target.click();
    }
  }

  const selectedTab = tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0];
  if (selectedTab) activateTopic(tabTopic(selectedTab));
});

const motionRevealSelectors = [
  ".page-hero",
  ".about-hero",
  ".hero",
  ".hero-content > *",
  ".hero-stats > *",
  ".section",
  ".wp-content > div",
  ".wp-content > section",
  ".wp-content > article",
  ".service-card",
  ".service-feature",
  ".service-feature-copy > *",
  ".service-feature-media",
  ".home-about-story > *",
  ".home-proof-panel > *",
  ".why-card",
  ".process-step",
  ".industry-list article",
  ".team-grid article",
  ".leadership-card",
  ".team-group-heading",
  ".career-grid article",
  ".job-card",
  ".job-detail-sidebar",
  ".job-detail-body",
  ".contact-info-panel",
  ".contact-info-panel > *",
  ".contact-form",
  ".contact-map",
  ".contact-feature",
  ".mbsi-resource-post-card",
  ".mbsi-resource-tabs",
  ".mbsi-resources-layout > *",
  ".mbsi-resource-category-page > *",
  ".resource-designed-block",
  ".resource-article > *",
  ".mbsi-section-title",
  ".mbsi-bottom-cta",
  ".detail-cta",
  ".cta-section",
  ".about-cta",
  ".profile-header-card",
  ".profile-detail-grid > *",
  ".mbsi-profile-intro",
  ".site-footer .footer-column",
  ".site-footer .footer-brand"
];

const motionRevealItems = document.querySelectorAll(motionRevealSelectors.join(","));
motionRevealItems.forEach((item, index) => {
  if (!item.classList.contains("reveal")) item.classList.add("reveal");
  item.style.setProperty("--motion-order", String(index % 4));
});

// Decorative mouse-tilt classes are intentionally disabled.

const autoRevealSelectors = [
  "main > section",
  "main > article",
  "main > div",
  ".content-page > *",
  ".wp-content > *",
  ".section > .section-header",
  ".section > .container > *",
  ".page-hero > *",
  ".about-hero > *",
  ".contact-modern > *",
  ".contact-layout > *",
  ".contact-form .form-row",
  ".contact-form .form-group",
  ".admin-main > *",
  ".admin-panel > *",
  ".job-detail-body > *",
  ".job-detail-sidebar > *",
  ".profile-detail-grid > *",
  ".mbsi-profile-intro > *",
  ".mbsi-resource-listing > *",
  ".mbsi-resource-category-page > *",
  ".mbsi-resources-layout > *",
  ".resource-article > *",
  ".detail-card-grid > *",
  ".detail-card-grid-compact > *",
  ".footer-grid > *"
];

const shouldReveal = (item) => {
  if (!(item instanceof HTMLElement)) return false;
  if (item.closest(".site-header, .dropdown-panel, script, style")) return false;
  if (item.classList.contains("reveal")) return false;
  const rect = item.getBoundingClientRect();
  return rect.width > 24 && rect.height > 10;
};

document.querySelectorAll(autoRevealSelectors.join(",")).forEach((item, index) => {
  if (!shouldReveal(item)) return;
  item.classList.add("reveal");
  item.style.setProperty("--motion-order", String(index % 5));
});

document.querySelectorAll(".dropdown-panel").forEach((panel) => {
  panel.querySelectorAll(":scope > div, :scope > a").forEach((item, index) => {
    item.classList.add("menu-motion-item");
    item.style.setProperty("--menu-order", String(index));
  });
});

const revealItems = document.querySelectorAll(".reveal");
const countItems = document.querySelectorAll("[data-count]");
const initialRevealBoundary = window.innerHeight + Math.min(160, window.innerHeight * 0.18);

const isNearInitialViewport = (item) => {
  const rect = item.getBoundingClientRect();
  return rect.top <= initialRevealBoundary && rect.bottom >= -80;
};

const animateCount = (item) => {
  const target = Number(item.getAttribute("data-count") || 0);
  const suffix = item.getAttribute("data-suffix") || "";
  const duration = 1100;
  const startTime = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    item.textContent = `${Math.round(target * eased)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  revealItems.forEach((item) => {
    if (isNearInitialViewport(item)) {
      item.classList.add("is-visible");
      return;
    }
    revealObserver.observe(item);
  });

  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.45 }
  );

  countItems.forEach((item) => countObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
  countItems.forEach(animateCount);
}

// Pointer-following tilt and banner-glow effects are intentionally disabled.

const setHeaderState = () => {
  if (!header) return;
  const isScrolled = window.scrollY > 12;
  header.classList.toggle("is-scrolled", isScrolled);
  document.documentElement.style.setProperty("--header-height", `${Math.round(header.getBoundingClientRect().height)}px`);

  if (brandLogo) {
    const useLightLogo = document.documentElement.dataset.mbsiTheme === "dark" || (document.body.classList.contains("home-page") && !isScrolled && !header.matches(":focus-within"));
    if (window.mbsiLogoAssets) {
      brandLogo.src = useLightLogo ? window.mbsiLogoAssets.white : window.mbsiLogoAssets.blue;
      return;
    }
    brandLogo.src = useLightLogo
      ? (brandLogoData?.dataset.logoLight || brandLogoLightDefault || brandLogoDarkDefault)
      : (brandLogoData?.dataset.logoDark || brandLogoDarkDefault);
  }
};

const setScrollProgress = () => {
  if (!scrollProgress) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
  scrollProgress.style.width = `${progress * 100}%`;
};

setHeaderState();
setScrollProgress();
window.addEventListener("scroll", () => {
  setHeaderState();
  setScrollProgress();
}, { passive: true });
header?.addEventListener("focusin", setHeaderState);
header?.addEventListener("focusout", () => window.requestAnimationFrame(setHeaderState));

const richEditors = document.querySelectorAll("[data-rich-editor]");

const richTemplates = {
  callout: '<section class="resource-designed-block resource-callout"><span class="resource-block-icon" aria-hidden="true"></span><h2>Practical reminder</h2><p>Write the important advisory or business context here.</p></section><p></p>',
  note: '<section class="resource-designed-block resource-note"><span class="resource-block-icon" aria-hidden="true"></span><h2>Management note</h2><p>Write the supporting note here.</p></section><p></p>',
  checklist: '<section class="resource-designed-block resource-checklist"><h2>Checklist</h2><ul><li><span aria-hidden="true"></span>First checklist item</li><li><span aria-hidden="true"></span>Second checklist item</li><li><span aria-hidden="true"></span>Third checklist item</li></ul></section><p></p>',
  steps: '<section class="resource-designed-block resource-steps"><h2>Recommended process</h2><ol><li>First step in the process</li><li>Second step in the process</li><li>Third step in the process</li></ol></section><p></p>'
};

richEditors.forEach((editor) => {
  const field = editor.closest("[data-rich-field]") || editor.closest(".admin-rich-field");
  const form = editor.closest("form");
  const input = field?.querySelector("[data-rich-input]");
  const toolbar = field?.querySelector(".admin-rich-toolbar");
  if (!form || !field || !input || !toolbar) return;

  const sync = () => {
    input.value = editor.innerHTML.trim();
  };

  toolbar.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    event.preventDefault();
    editor.focus();

    if (button.dataset.richBlock) {
      document.execCommand("formatBlock", false, button.dataset.richBlock);
    } else if (button.dataset.richCommand) {
      document.execCommand(button.dataset.richCommand, false, null);
    } else if (button.hasAttribute("data-rich-link")) {
      const url = window.prompt("Enter the link URL");
      if (url) document.execCommand("createLink", false, url);
    } else if (button.dataset.richTemplate) {
      document.execCommand("insertHTML", false, richTemplates[button.dataset.richTemplate] || "");
    }

    sync();
  });

  const escapeHtml = (value) => value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const plainTextToRichHtml = (value) => {
    const lines = value.replace(/\r\n/g, "\n").split("\n");
    let html = "";
    let paragraph = [];
    let list = [];

    const flushParagraph = () => {
      if (!paragraph.length) return;
      const text = paragraph.join(" ").trim();
      if (text) html += `<p>${escapeHtml(text)}</p>`;
      paragraph = [];
    };

    const flushList = () => {
      if (!list.length) return;
      html += `<ul>${list.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
      list = [];
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushParagraph();
        flushList();
        return;
      }

      const bullet = trimmed.match(/^[-*]\s+(.+)/);
      if (bullet) {
        flushParagraph();
        list.push(bullet[1].trim());
        return;
      }

      const markdownHeading = trimmed.match(/^\*\*(.+)\*\*$/);
      const looksLikeHeading = !/[.!?]$/.test(trimmed) && trimmed.length <= 70 && paragraph.length === 0;
      if (markdownHeading || looksLikeHeading) {
        flushParagraph();
        flushList();
        html += `<h2>${escapeHtml((markdownHeading ? markdownHeading[1] : trimmed).trim())}</h2>`;
        return;
      }

      flushList();
      paragraph.push(trimmed.replace(/^\*\*(.+)\*\*$/, "$1"));
    });

    flushParagraph();
    flushList();
    return html;
  };

  editor.addEventListener("paste", (event) => {
    const html = event.clipboardData?.getData("text/html") || "";
    const text = event.clipboardData?.getData("text/plain") || "";
    if (!html && !text) return;
    event.preventDefault();
    document.execCommand("insertHTML", false, html || plainTextToRichHtml(text));
    sync();
  });
  editor.addEventListener("input", sync);
  editor.addEventListener("blur", sync);
  form.addEventListener("submit", sync);
  sync();
});document.querySelectorAll("[data-image-picker]").forEach((picker) => {
  const input = picker.querySelector("[data-image-input]");
  const buttons = picker.querySelectorAll("[data-image-preset]");
  if (!input || !buttons.length) return;

  const syncSelected = () => {
    buttons.forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.imagePreset === input.value.trim());
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      input.value = button.dataset.imagePreset || "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      syncSelected();
    });
  });

  input.addEventListener("input", syncSelected);
  syncSelected();
});
const contactFeedback = document.querySelector("[data-contact-feedback]");
if (contactFeedback) {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("mbsi_contact") || params.get("contact");
  if (status === "success" || status === "error") {
    contactFeedback.hidden = false;
    contactFeedback.classList.toggle("form-message-success", status === "success");
    contactFeedback.textContent = status === "success"
      ? "Thank you. Your message has been received."
      : "Please complete the required fields and try again.";
  }
}

let privacyModal = document.querySelector("[data-mbsi-privacy-modal]");
if (privacyModal && !(privacyModal instanceof HTMLDialogElement)) {
  const modal = document.createElement("dialog");
  Array.from(privacyModal.attributes).forEach(attribute => modal.setAttribute(attribute.name, attribute.value));
  while (privacyModal.firstChild) modal.appendChild(privacyModal.firstChild);
  privacyModal.replaceWith(modal);
  privacyModal = modal;
}
if (privacyModal) {
  const privacyDialog = privacyModal.querySelector('[role="dialog"]');
  const privacyCloseControls = privacyModal.querySelectorAll("[data-mbsi-privacy-close]");
  let privacyReturnFocus = null;

  const getPrivacyFocusable = () => Array.from(
    privacyModal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
  ).filter((item) => !item.hasAttribute("hidden"));

  const closePrivacyModal = () => {
    if (privacyModal.open) privacyModal.close();
    privacyModal.hidden = true;
    privacyModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("mbsi-privacy-modal-open");
    privacyReturnFocus?.focus();
    privacyReturnFocus = null;
  };

  const openPrivacyModal = (trigger) => {
    privacyReturnFocus = trigger;
    privacyModal.hidden = false;
    privacyModal.setAttribute("aria-hidden", "false");
    if (!privacyModal.open) privacyModal.showModal();
    document.body.classList.add("mbsi-privacy-modal-open");
    window.requestAnimationFrame(() => privacyDialog?.focus());
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-mbsi-privacy-open]");
    if (!trigger) return;
    event.preventDefault();
    openPrivacyModal(trigger);
  });

  privacyModal.addEventListener("cancel", (event) => { event.preventDefault(); closePrivacyModal(); });

  privacyCloseControls.forEach((control) => control.addEventListener("click", closePrivacyModal));

  privacyModal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closePrivacyModal();
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = getPrivacyFocusable();
    if (!focusable.length) {
      event.preventDefault();
      privacyDialog?.focus();
      return;
    }

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







