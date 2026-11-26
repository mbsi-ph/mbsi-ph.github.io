/**
 * Per-field validation for MBSI contact and careers forms.
 *
 * Native `required` alone produces a single generic bubble and leaves the
 * invalid control unstyled, which is not enough guidance on a form this long.
 * This module replaces the native reporting with:
 *   - a specific message per field, rendered under the control,
 *   - a red border on the control itself,
 *   - a summary toast naming how many fields still need attention,
 *   - live re-checking once a field has been flagged, so errors clear as the
 *     visitor types.
 *
 * Phone inputs accept digits and dashes only; other characters are stripped as
 * they are typed or pasted.
 *
 * Progressive enhancement: the forms still carry native `required`, `type` and
 * `accept` attributes, so validation still happens without JavaScript.
 */
(function () {
  "use strict";

  var PHONE_ALLOWED = /[^0-9-]/g;
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var RESUME_PATTERN = /\.(pdf|doc|docx)$/i;
  var MAX_RESUME_BYTES = 5 * 1024 * 1024;
  var SKIP_NAMES = ["action", "website", "_wp_http_referer", "_wpnonce"];
  var REQUIRED_TEXT_ATTR = { rows: 1, cols: 1 };

  /* ---------- Field metadata ---------- */

  function isReportable(field) {
    if (!field.name) return false;
    if (SKIP_NAMES.indexOf(field.name) !== -1) return false;
    if (field.name.indexOf("nonce") !== -1) return false;
    if (["hidden", "submit", "button", "reset"].indexOf(field.type) !== -1) return false;
    if (field.closest(".mbsi-honeypot")) return false;
    return true;
  }

  function reportableFields(form) {
    return Array.prototype.slice
      .call(form.querySelectorAll("input, select, textarea"))
      .filter(isReportable);
  }

  /**
   * Human label for a control, taken from the shared `.mbsi-label` run so the
   * required marker is stripped out of the message text.
   */
  function labelText(field) {
    if (field.type === "checkbox") return "Privacy consent";

    var wrapper = field.closest("label");
    if (wrapper) {
      var run = wrapper.querySelector(".mbsi-label");
      if (run) {
        var text = run.textContent.replace(/\*/g, "").replace(/\s+/g, " ").trim();
        if (text) return text;
      }
      var clone = wrapper.cloneNode(true);
      clone.querySelectorAll("input, select, textarea, button, small").forEach(function (node) {
        node.parentNode.removeChild(node);
      });
      var fallback = clone.textContent.replace(/\s+/g, " ").trim();
      if (fallback) return fallback;
    }

    return field.getAttribute("aria-label") || field.getAttribute("placeholder") || field.name;
  }

  function isPhone(field) {
    return field.type === "tel" || field.name === "phone";
  }

  /* ---------- Messages ---------- */

  function messageFor(field) {
    var label = labelText(field);

    if (field.type === "checkbox") {
      return field.checked ? "" : "You must confirm the Privacy Notice to continue.";
    }

    var value = (field.value || "").trim();
    var required = field.hasAttribute("required");

    if (field.type === "file") {
      if (!field.files || !field.files.length) {
        return required ? label + " is required. Please attach your file." : "";
      }
      var file = field.files[0];
      if (field.name === "resume" && !RESUME_PATTERN.test(file.name)) {
        return label + " must be a PDF, DOC, or DOCX file.";
      }
      if (file.size > MAX_RESUME_BYTES) {
        return label + " must be 5 MB or smaller.";
      }
      return "";
    }

    if (field.tagName === "SELECT") {
      if (!value) return required ? label + " cannot be empty. Please choose an option." : "";
      return "";
    }

    if (!value) {
      if (required) return label + " cannot be empty.";
      if (isPhone(field) && field.value && !field.value.trim()) return "";
      return "";
    }

    if (field.type === "email" && !EMAIL_PATTERN.test(value)) {
      return label + " is not valid. Please enter an email address in the format name@example.com.";
    }

    if (isPhone(field)) {
      if (PHONE_ALLOWED.test(value)) {
        return label + " can only contain numbers and dashes.";
      }
      var digits = value.replace(/-/g, "");
      if (digits.length < 7) {
        return label + " is too short. Please enter at least 7 digits.";
      }
    }

    return "";
  }

  /* ---------- Message elements ---------- */

  function hostFor(field) {
    return field.closest("label") || field.parentElement;
  }

  function errorId(field) {
    if (!field.id) {
      field.id = field.name + "-mbsi-" + Math.random().toString(36).slice(2, 8);
    }
    return field.id + "-error";
  }

  /* Hints are rendered by the theme without ids; assign one lazily so the
     control can point at both its hint and its error through
     aria-describedby. */
  function hintId(hint) {
    if (!hint.id) hint.id = "mbsi-hint-" + Math.random().toString(36).slice(2, 9);
    return hint.id;
  }

  function errorNode(field) {
    var host = hostFor(field);
    if (!host) return null;
    return host.querySelector(".mbsi-field-error");
  }

  function ensureErrorNode(field) {
    var host = hostFor(field);
    if (!host) return null;

    var existing = host.querySelector(".mbsi-field-error");
    if (existing) return existing;

    var node = document.createElement("small");
    node.className = "mbsi-field-error";
    node.id = errorId(field);
    node.setAttribute("role", "alert");
    node.hidden = true;

    var hint = host.querySelector(".mbsi-hint");
    if (hint) {
      hint.parentNode.insertBefore(node, hint.nextSibling);
    } else {
      host.appendChild(node);
    }
    return node;
  }

  function clearFieldError(field) {
    field.classList.remove("is-invalid");
    field.removeAttribute("aria-invalid");

    var node = errorNode(field);
    if (node) {
      node.hidden = true;
      node.textContent = "";
    }
  }

  function showFieldError(field, text) {
    var node = ensureErrorNode(field);
    if (!node) return;

    node.textContent = text;
    node.hidden = false;
    field.classList.add("is-invalid");
    field.setAttribute("aria-invalid", "true");

    var described = [];
    var hint = hostFor(field).querySelector(".mbsi-hint");
    if (hint) described.push(hintId(hint));
    described.push(node.id);
    field.setAttribute("aria-describedby", described.join(" "));
  }

  /* ---------- Validation runs ---------- */

  function validateField(field) {
    var message = messageFor(field);
    if (message) {
      showFieldError(field, message);
      return false;
    }
    clearFieldError(field);
    return true;
  }

  /**
   * Validate every reportable control. Returns the invalid fields in document
   * order so the caller can focus the first one.
   */
  function validateForm(form) {
    var invalid = [];

    reportableFields(form).forEach(function (field) {
      if (!validateField(field)) invalid.push(field);
    });

    return invalid;
  }

  /* ---------- Phone input filter ---------- */

  function stripPhoneNoise(field) {
    var before = field.value;
    var after = before.replace(PHONE_ALLOWED, "");
    if (after !== before) field.value = after;
  }

  /**
   * A field counts as "touched" once the visitor has tried to submit, which is
   * when errors start being rendered and re-checked as they type.
   */
  function isTouched(form, field) {
    return !!(form.__mbsiTouched && form.__mbsiTouched.has(field));
  }

  function markTouched(form) {
    if (!form.__mbsiTouched) form.__mbsiTouched = new WeakSet();
    reportableFields(form).forEach(function (field) {
      form.__mbsiTouched.add(field);
    });
  }

  function wirePhone(form, field) {
    stripPhoneNoise(field);

    field.addEventListener("input", function () {
      stripPhoneNoise(field);
      if (isTouched(form, field) && field.getAttribute("aria-invalid") === "true") {
        validateField(field);
      }
    });

    field.addEventListener("blur", function () {
      if (isTouched(form, field) || field.hasAttribute("required")) {
        validateField(field);
      }
    });
  }

  function wireField(form, field) {
    if (isPhone(field)) {
      wirePhone(form, field);
      return;
    }

    if (field.type === "file" || field.type === "checkbox") {
      field.addEventListener("change", function () {
        if (isTouched(form, field) || field.hasAttribute("required")) validateField(field);
      });
      return;
    }

    field.addEventListener("blur", function () {
      if (isTouched(form, field) || field.hasAttribute("required")) validateField(field);
    });

    field.addEventListener("input", function () {
      if (isTouched(form, field) && field.getAttribute("aria-invalid") === "true") {
        validateField(field);
      }
    });
  }

  /* ---------- Wiring ---------- */

  function wireForm(form) {
    // Native constraint UI is suppressed so only the inline messages appear.
    form.setAttribute("novalidate", "novalidate");

    var fields = reportableFields(form);
    fields.forEach(function (field) {
      wireField(form, field);
      if (isPhone(field)) {
        field.setAttribute("inputmode", "tel");
      }
    });
  }

  function init() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("form.mbsi-form"));
    forms.forEach(wireForm);

    window.MBSIFormValidation = {
      validateForm: validateForm,
      reportableFields: reportableFields,
      labelText: labelText,
      markTouched: markTouched,
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();