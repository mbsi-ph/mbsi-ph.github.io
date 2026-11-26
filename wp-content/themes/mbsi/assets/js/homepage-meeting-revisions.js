(function () {
  "use strict";

  const industryTabs = Array.from(document.querySelectorAll("[data-industry-service]"));
  const industryPanel = document.querySelector("[data-industry-panel]");
  const industryStatus = document.querySelector("[data-industry-status]");

  const activateIndustryService = (tab, moveFocus = false) => {
    if (!industryPanel || !tab) return;

    const service = tab.getAttribute("data-industry-service") || "accounting";
    const label = tab.textContent.trim();

    industryTabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.setAttribute("tabindex", selected ? "0" : "-1");
    });

    industryPanel.setAttribute("data-service", service);
    industryPanel.setAttribute("aria-labelledby", tab.id);
    industryPanel.setAttribute("aria-label", `Industries supported through ${label}`);
    if (industryStatus) industryStatus.textContent = `Showing industries supported through ${label}.`;

    industryPanel.classList.remove("is-switching");
    window.requestAnimationFrame(() => industryPanel.classList.add("is-switching"));
    window.setTimeout(() => industryPanel.classList.remove("is-switching"), 240);

    if (moveFocus) tab.focus();
  };

  industryTabs.forEach((tab) => {
    tab.addEventListener("click", () => activateIndustryService(tab));
  });

  const industryTabList = industryTabs[0]?.closest('[role="tablist"]');
  industryTabList?.addEventListener("keydown", (event) => {
    const currentIndex = industryTabs.indexOf(document.activeElement);
    if (currentIndex < 0) return;

    let nextIndex = currentIndex;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % industryTabs.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (currentIndex - 1 + industryTabs.length) % industryTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = industryTabs.length - 1;
    if (nextIndex === currentIndex && !["Home", "End"].includes(event.key)) return;

    event.preventDefault();
    activateIndustryService(industryTabs[nextIndex], true);
  });

  const workflowControls = document.querySelector("[data-workflow-review-controls]");
  const workflowFlow = document.querySelector("[data-workflow-flow]");
  const workflowStatus = document.querySelector("[data-workflow-status]");
  const localPreviewHosts = new Set(["localhost", "127.0.0.1", "::1"]);

  if (workflowControls && workflowFlow && localPreviewHosts.has(window.location.hostname)) {
    workflowControls.hidden = false;
    const workflowButtons = Array.from(workflowControls.querySelectorAll("[data-workflow-layout]"));

    const selectWorkflowLayout = (layout) => {
      const selectedLayout = layout === "reverse-c" ? "reverse-c" : "z";
      workflowFlow.setAttribute("data-layout", selectedLayout);

      workflowButtons.forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.getAttribute("data-workflow-layout") === selectedLayout)
        );
      });

      const selectedButton = workflowButtons.find(
        (button) => button.getAttribute("data-workflow-layout") === selectedLayout
      );
      if (workflowStatus && selectedButton) {
        workflowStatus.textContent = `${selectedButton.textContent.trim()} selected.`;
      }

      try {
        window.sessionStorage.setItem("mbsi-workflow-layout", selectedLayout);
      } catch (error) {
        // The comparison remains usable when browser storage is unavailable.
      }
    };

    let initialLayout = "z";
    try {
      initialLayout = window.sessionStorage.getItem("mbsi-workflow-layout") || "z";
    } catch (error) {
      initialLayout = "z";
    }
    selectWorkflowLayout(initialLayout);

    workflowButtons.forEach((button) => {
      button.addEventListener("click", () => {
        selectWorkflowLayout(button.getAttribute("data-workflow-layout"));
      });
    });
  }
})();
