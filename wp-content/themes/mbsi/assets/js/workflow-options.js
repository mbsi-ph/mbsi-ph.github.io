(() => {
  const controls = document.querySelector("[data-workflow-options-controls]");
  const flow = document.querySelector("[data-workflow-options-flow]");
  const status = document.querySelector("[data-workflow-options-status]");
  const localPreviewHosts = new Set(["localhost", "127.0.0.1", "::1"]);
  const isCloudflarePreview = window.location.hostname.endsWith(
    ".trycloudflare.com"
  );

  if (
    !controls ||
    !flow ||
    (!localPreviewHosts.has(window.location.hostname) && !isCloudflarePreview)
  ) {
    return;
  }

  controls.hidden = false;

  const buttons = Array.from(
    controls.querySelectorAll("[data-workflow-option]")
  );
  const validLayouts = new Set(["semicircle", "up-down"]);

  const selectLayout = (layout) => {
    const selectedLayout = validLayouts.has(layout) ? layout : "semicircle";
    flow.setAttribute("data-layout", selectedLayout);

    buttons.forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.getAttribute("data-workflow-option") === selectedLayout)
      );
    });

    const selectedButton = buttons.find(
      (button) =>
        button.getAttribute("data-workflow-option") === selectedLayout
    );

    if (status && selectedButton) {
      status.textContent = `${selectedButton.textContent.trim()} selected.`;
    }

    try {
      window.sessionStorage.setItem(
        "mbsi-workflow-final-option",
        selectedLayout
      );
    } catch (error) {
      // The comparison remains usable without browser storage.
    }
  };

  let initialLayout = "semicircle";
  try {
    initialLayout =
      window.sessionStorage.getItem("mbsi-workflow-final-option") ||
      "semicircle";
  } catch (error) {
    initialLayout = "semicircle";
  }
  selectLayout(initialLayout);

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      selectLayout(button.getAttribute("data-workflow-option"));
    });
  });
})();

