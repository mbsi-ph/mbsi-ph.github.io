/**
 * Submission confirmation modal + toast notifications for MBSI forms.
 *
 * Works as progressive enhancement: without JS the forms keep their plain
 * admin-post.php POST. With JS, submitting opens a review dialog that lists
 * every entered value; nothing is sent until "Send Now" is confirmed.
 */
(function () {
  "use strict";

  var CONFIRMED_BODY_CLASS = "mbsi-form-confirm-open";
  var HANDLED_ACTIONS = ["mbsi_contact_submit", "mbsi_application_submit"];
  var SKIP_NAMES = ["action", "website", "_wp_http_referer", "_wpnonce"];

  var STATUS_MESSAGES = {
    mbsi_contact: {
      success: {
        type: "success",
        text: "Thank you. Your message has been received. Our team will respond using the contact details you provided.",
      },
      error: {
        type: "error",
        text: "Your message was not sent. Please review the required fields and try again.",
      },
    },
    mbsi_application: {
      success: {
        type: "success",
        text: "Thank you. Your application has been received. An acknowledgement has been sent to your email address.",
      },
      "email-warning": {
        type: "error",
        text: "Your application was received, but the acknowledgement email could not be sent. Please check your spam folder; you do not need to submit again.",
      },
      error: {
        type: "error",
        text: "Your application was not sent. Please complete all required fields and upload an accepted résumé file.",
      },
    },
  };

  /* ---------- Toasts ---------- */

  var toastRegion = null;

  function ensureToastRegion() {
    if (!toastRegion || !document.body.contains(toastRegion)) {
      toastRegion = document.createElement("div");
      toastRegion.className = "mbsi-toast-region";
      toastRegion.setAttribute("aria-live", "polite");
      toastRegion.setAttribute("aria-atomic", "false");
      toastRegion.setAttribute("popover", "manual");
    }
    // Keep notifications interactive inside the active modal and above its layer.
    var modals = document.querySelectorAll("dialog[open]");
    var host = modals.length ? modals[modals.length - 1] : document.body;
    if (typeof toastRegion.hidePopover === "function" && toastRegion.matches(":popover-open")) {
      toastRegion.hidePopover();
    }
    if (toastRegion.parentNode !== host) host.appendChild(toastRegion);
    if (typeof toastRegion.showPopover === "function" && !toastRegion.matches(":popover-open")) {
      toastRegion.showPopover();
    }
    return toastRegion;
  }
  function showToast(text, type, duration) {
    var kind = type === "success" || type === "error" ? type : "info";
    var region = ensureToastRegion();
    var life = duration || (kind === "error" ? 9000 : 6000);

    // Identical message already on screen: refresh it instead of stacking a copy.
    var duplicate = null;
    Array.prototype.slice.call(region.children).forEach(function (node) {
      var textNode = node.querySelector(".mbsi-toast-text");
      if (textNode && textNode.textContent === text && !node.classList.contains("is-leaving")) duplicate = node;
    });

    if (duplicate) {
      window.clearTimeout(duplicate.toastTimer);
      duplicate.toastTimer = window.setTimeout(function () {
        if (typeof duplicate.toastDismiss === "function") duplicate.toastDismiss();
      }, life);
      return duplicate;
    }

    var toast = document.createElement("div");
    toast.className = "mbsi-toast is-" + kind;
    toast.setAttribute("role", kind === "error" ? "alert" : "status");

    var icon = document.createElement("span");
    icon.className = "mbsi-toast-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = kind === "success" ? "\u2713" : kind === "error" ? "!" : "i";

    var message = document.createElement("span");
    message.className = "mbsi-toast-text";
    message.textContent = text;

    var close = document.createElement("button");
    close.type = "button";
    close.className = "mbsi-toast-close";
    close.setAttribute("aria-label", "Dismiss notification");
    close.innerHTML = "&times;";

    toast.appendChild(icon);
    toast.appendChild(message);
    toast.appendChild(close);
    region.appendChild(toast);

    var removed = false;
    function dismiss() {
      if (removed) return;
      removed = true;
      window.clearTimeout(timer);
      toast.classList.add("is-leaving");
      window.setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 220);
    }

    close.addEventListener("click", dismiss);
    toast.addEventListener("click", function (event) {
      if (event.target === close) return;
      dismiss();
    });

    var timer = window.setTimeout(dismiss, life);
    toast.toastDismiss = dismiss;
    toast.toastTimer = timer;
    return toast;
  }

  /* ---------- Field description ---------- */

  var lastValidationToastAt = 0;

  /**
   * Validation can raise several events for one attempt (native pre-submit
   * validation plus each invalid control), so collapse them into one toast.
   */
  function showValidationToast(text) {
    var now = Date.now();
    if (now - lastValidationToastAt < 1500) return;
    lastValidationToastAt = now;
    showToast(text, "error");
  }

  /**
   * Toast text for a failed submit. The inline message under each control is
   * the specific error; the toast only points at how many need attention so it
   * never restates the whole list.
   */
  function summarise(invalid) {
    if (invalid.length === 1) {
      var only = invalid[0];
      var where = only && typeof only.closest === "function"
        ? window.MBSIFormValidation.labelText(only)
        : "";
      return where ? "Please correct the highlighted field: " + where + "." : "Please correct the highlighted field.";
    }
    return invalid.length + " fields need your attention. Please correct the highlighted fields before continuing.";
  }

  function isReportable(field) {
    if (!field.name) return false;
    if (field.type === "hidden" || field.type === "submit" || field.type === "button" || field.type === "reset") return false;
    if (SKIP_NAMES.indexOf(field.name) !== -1) return false;
    if (field.name.indexOf("nonce") !== -1) return false;
    if (field.closest(".mbsi-honeypot")) return false;
    return true;
  }

  function labelFor(field) {
    if (field.type === "checkbox") return "Privacy consent";

    var wrap = field.closest("label");
    if (wrap) {
      var clone = wrap.cloneNode(true);
      clone.querySelectorAll("input, select, textarea, button, small").forEach(function (node) {
        node.parentNode.removeChild(node);
      });
      // Drop the required marker; the review list reads better without it.
      var text = clone.textContent.replace(/\*/g, "").replace(/\s+/g, " ").trim();
      if (text) return text;
    }

    return field.getAttribute("aria-label") || field.getAttribute("placeholder") || field.name;
  }

  function valueFor(field) {
    if (field.type === "checkbox") {
      return field.checked ? "Confirmed" : "Not confirmed";
    }

    if (field.type === "file") {
      return field.files && field.files.length ? field.files[0].name : "";
    }

    if (field.tagName === "SELECT") {
      if (field.selectedIndex < 0) return "";
      var option = field.options[field.selectedIndex];
      return (option.value || option.text || "").trim();
    }

    return (field.value || "").trim();
  }

  function emptyLabelFor(field) {
    return field.tagName === "SELECT" ? "Not selected" : "Not provided";
  }

  function describe(form) {
    return Array.prototype.slice
      .call(form.querySelectorAll("input, select, textarea"))
      .filter(isReportable)
      .map(function (field) {
        var value = valueFor(field);
        var isConsent = field.type === "checkbox";
        return {
          label: labelFor(field),
          value: value || emptyLabelFor(field),
          empty: !value,
          wide: field.tagName === "TEXTAREA" && !isConsent,
        };
      });
  }

  /* ---------- Confirmation modal ---------- */

  var overlay = null;
  var dialog = null;
  var list = null;
  var confirmButton = null;
  var cancelButton = null;
  var activeForm = null;
  var returnFocus = null;
  var submitting = false;

  function buildModal() {
    if (overlay && document.body.contains(overlay)) return;

    overlay = document.createElement("dialog");
    overlay.className = "mbsi-fc-overlay";
    overlay.hidden = true;

    dialog = document.createElement("div");
    dialog.className = "mbsi-fc-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "mbsi-fc-title");
    dialog.tabIndex = -1;

    var header = document.createElement("div");
    header.className = "mbsi-fc-header";
    header.innerHTML =
      '<p class="mbsi-fc-eyebrow">Review your submission</p>' +
      '<h2 class="mbsi-fc-title" id="mbsi-fc-title">Please confirm your details</h2>' +
      '<p class="mbsi-fc-intro">Check the information below before it is sent to MBSI.</p>';

    var body = document.createElement("div");
    body.className = "mbsi-fc-body";
    list = document.createElement("dl");
    list.className = "mbsi-fc-list";
    body.appendChild(list);

    var footer = document.createElement("div");
    footer.className = "mbsi-fc-footer";

    confirmButton = document.createElement("button");
    confirmButton.type = "button";
    confirmButton.className = "mbsi-fc-btn mbsi-fc-btn-confirm";
    confirmButton.textContent = "Confirm, All details are correct";

    cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "mbsi-fc-btn mbsi-fc-btn-cancel";
    cancelButton.textContent = "Cancel, I want to make changes.";

    footer.appendChild(confirmButton);
    footer.appendChild(cancelButton);

    dialog.appendChild(header);
    dialog.appendChild(body);
    dialog.appendChild(footer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  }

  function renderRows(form) {
    var rows = describe(form);
    list.textContent = "";

    if (!rows.length) {
      var empty = document.createElement("p");
      empty.className = "mbsi-fc-intro";
      empty.textContent = "There are no details to review.";
      list.appendChild(empty);
      return;
    }

    rows.forEach(function (row) {
      var wrapper = document.createElement("div");
      wrapper.className = "mbsi-fc-row" + (row.wide ? " is-wide" : "");

      var term = document.createElement("dt");
      term.textContent = row.label;

      var value = document.createElement("dd");
      value.textContent = row.value;
      if (row.empty) value.className = "is-empty";

      wrapper.appendChild(term);
      wrapper.appendChild(value);
      list.appendChild(wrapper);
    });
  }

  function focusableInModal() {
    return Array.prototype.slice.call(
      overlay.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')
    );
  }

  function openModal(form, trigger) {
    buildModal();
    activeForm = form;
    returnFocus = trigger || null;

    renderRows(form);

    overlay.hidden = false;
    overlay.showModal();
    document.body.classList.add(CONFIRMED_BODY_CLASS);
    window.requestAnimationFrame(function () {
      confirmButton.focus();
    });
  }

  function closeModal() {
    if (!overlay || overlay.hidden) return;
    overlay.close();
    overlay.hidden = true;
    document.body.classList.remove(CONFIRMED_BODY_CLASS);
    activeForm = null;
    if (returnFocus && document.contains(returnFocus)) {
      returnFocus.focus();
    }
    returnFocus = null;
  }

  function firstEditableField(form) {
    var fields = Array.prototype.slice.call(form.querySelectorAll("input, select, textarea"));
    for (var i = 0; i < fields.length; i += 1) {
      if (isReportable(fields[i]) && fields[i].type !== "checkbox") return fields[i];
    }
    return form.querySelector("input, select, textarea");
  }

  function cancelSubmission() {
    if (submitting) return;
    var form = activeForm;
    closeModal();
    showToast("Nothing was sent. You can edit your details and try again.", "info");
    if (form) {
      var field = firstEditableField(form);
      if (field) field.focus();
    }
  }

  function bindModal() {
    buildModal();

    confirmButton.addEventListener("click", function () {
      var form = activeForm;
      if (!form) return;
      if (submitting) return;
      submitting = true;
      overlay.setAttribute("aria-busy", "true");
      overlay.classList.add("is-submitting");
      confirmButton.disabled = true;
      cancelButton.disabled = true;
      confirmButton.textContent = "Submitting…";
      var status = document.createElement("p");
      status.className = "mbsi-fc-submitting";
      status.setAttribute("role", "status");
      status.textContent = form.querySelector('input[name="action"]').value === "mbsi_application_submit" ? "Submitting your application. Please wait…" : "Sending your message. Please wait…";
      dialog.querySelector(".mbsi-fc-footer").prepend(status);
      window.requestAnimationFrame(function () {
        window.setTimeout(function () { form.submit(); }, 0);
      });
    });

    cancelButton.addEventListener("click", cancelSubmission);

    overlay.addEventListener("mousedown", function (event) {
      if (event.target === overlay) cancelSubmission();
    });

    overlay.addEventListener("cancel", function (event) {
      event.preventDefault();
      cancelSubmission();
    });

    overlay.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        cancelSubmission();
        return;
      }

      if (event.key !== "Tab") return;

      var focusable = focusableInModal();
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------- Form wiring ---------- */

  function handlesForm(form) {
    var action = form.querySelector('input[name="action"]');
    if (!action) return false;
    return HANDLED_ACTIONS.indexOf(action.value) !== -1;
  }

  function wireForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("form.mbsi-form")).filter(handlesForm);
    if (!forms.length) return [];

    bindModal();

    // reportValidity() fires an invalid event per control; suppress those so a
    // single submit attempt only raises one notification.
    var suppressing = false;

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();

        var invalid = null;

        if (window.MBSIFormValidation) {
          window.MBSIFormValidation.markTouched(form);
          invalid = window.MBSIFormValidation.validateForm(form);
        } else if (!form.checkValidity()) {
          suppressing = true;
          form.reportValidity();
          window.setTimeout(function () {
            suppressing = false;
          }, 0);
          invalid = [true];
        }

        if (invalid && invalid.length) {
          if (window.MBSIFormValidation) {
            showValidationToast(summarise(invalid));
            var first = invalid[0];
            if (first && typeof first.focus === "function") first.focus();
          } else {
            showValidationToast("Please complete the highlighted fields before continuing.");
          }
          return;
        }

        openModal(form, event.submitter || form.querySelector('[type="submit"]'));
      });

      form.addEventListener(
        "invalid",
        function (event) {
          if (suppressing || window.MBSIFormValidation) return;
          if (event.target === form) return;
          var field = event.target;
          if (!isReportable(field)) return;
          showValidationToast(
            field.type === "checkbox"
              ? "Please confirm the privacy notice to continue."
              : "Please complete the highlighted fields before continuing."
          );
        },
        true
      );
    });

    return forms;
  }

  /* ---------- Server response toasts ---------- */

  function showApplicationSuccess(message, isContact) {
    var success = document.createElement("dialog");
    success.className = "mbsi-fc-overlay mbsi-application-success";
    success.setAttribute("aria-labelledby", "mbsi-application-success-title");
    success.innerHTML = '<div class="mbsi-fc-dialog"><div class="mbsi-fc-header"><p class="mbsi-fc-eyebrow">Application submitted</p><h2 class="mbsi-fc-title" id="mbsi-application-success-title">Thank you for applying.</h2></div><div class="mbsi-fc-body"><p class="mbsi-fc-intro"></p></div><div class="mbsi-fc-footer"><button type="button" class="mbsi-fc-btn mbsi-fc-btn-confirm">Done</button></div></div>';
    if (isContact) {
      success.querySelector(".mbsi-fc-eyebrow").textContent = "Message sent";
      success.querySelector(".mbsi-fc-title").textContent = "Thank you for contacting us.";
    }
    success.querySelector(".mbsi-fc-intro").textContent = message;
    document.body.appendChild(success);
    document.body.classList.add(CONFIRMED_BODY_CLASS);
    function finish() {
      document.querySelectorAll("dialog[open]").forEach(function (modal) { modal.close(); });
      document.body.classList.remove(CONFIRMED_BODY_CLASS);
      document.documentElement.classList.remove("career-dialog-open");
      success.remove();
      showToast(isContact ? "Your message has been sent successfully." : "Your application has been submitted successfully.", "success");
    }
    success.querySelector("button").addEventListener("click", finish);
    success.addEventListener("cancel", function (event) { event.preventDefault(); finish(); });
    success.showModal();
  }
  function announceServerStatus() {
    var params = new URLSearchParams(window.location.search);
    var announced = null;
    var handledKey = null;

    Object.keys(STATUS_MESSAGES).some(function (key) {
      var value = params.get(key);
      if (!value) return false;
      var message = STATUS_MESSAGES[key][value];
      if (!message) return false;
      announced = message;
      handledKey = key;
      return true;
    });

    if (!announced) return;

    // The server-rendered inline notice would duplicate the toast.
    Array.prototype.slice.call(document.querySelectorAll(".mbsi-form-notice")).forEach(function (notice) {
      notice.hidden = true;
    });

    if (params.get(handledKey) === "success") {
      showApplicationSuccess(announced.text, handledKey === "mbsi_contact");
    } else {
      showToast(announced.text, announced.type);
    }

    if (window.history && window.history.replaceState) {
      var cleaned = new URL(window.location.href);
      Object.keys(STATUS_MESSAGES).forEach(function (key) {
        cleaned.searchParams.delete(key);
      });
      window.history.replaceState({}, "", cleaned.toString());
    }

    if (handledKey && announced.type !== "success") {
      var anchor = document.querySelector(".mbsi-form-shell, .career-general-form");
      if (anchor) anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function init() {
    wireForms();
    new MutationObserver(function (changes) {
      if (toastRegion && toastRegion.children.length && changes.some(function (change) { return change.target.tagName === "DIALOG"; })) {
        ensureToastRegion();
      }
    }).observe(document.body, {subtree:true, attributes:true, attributeFilter:["open"]});
    announceServerStatus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();