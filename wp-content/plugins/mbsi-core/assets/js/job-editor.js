(function (wp) {
  if (!wp?.plugins || !wp?.editPost || !wp?.components || !wp?.data || !wp?.element) return;

  const el = wp.element.createElement;
  const { useEffect } = wp.element;
  const { PluginDocumentSettingPanel } = wp.editPost;
  const { TextControl, SelectControl } = wp.components;
  const { useDispatch, useSelect } = wp.data;
  const { __ } = wp.i18n;

  const defaults = {
    _mbsi_application_email: "central@mbsi.com.ph",
  };

  const employmentOptions = [
    { label: __("Not specified", "mbsi-core"), value: "" },
    { label: __("Full-time", "mbsi-core"), value: "Full-time" },
    { label: __("Part-time", "mbsi-core"), value: "Part-time" },
    { label: __("Contract", "mbsi-core"), value: "Contract" },
    { label: __("Temporary", "mbsi-core"), value: "Temporary" },
    { label: __("Internship", "mbsi-core"), value: "Internship" },
  ];

  const setupOptions = [
    { label: __("Not specified", "mbsi-core"), value: "" },
    { label: __("On-site", "mbsi-core"), value: "On-site" },
    { label: __("Hybrid", "mbsi-core"), value: "Hybrid" },
    { label: __("Work from home", "mbsi-core"), value: "Work from home" },
    { label: __("Remote", "mbsi-core"), value: "Remote" },
  ];

  function JobDetailsPanel() {
    const postType = useSelect((select) => select("core/editor").getCurrentPostType(), []);
    const position = useSelect((select) => select("core/editor").getEditedPostAttribute("title") || "", []);
    const meta = useSelect((select) => select("core/editor").getEditedPostAttribute("meta") || {}, []);
    const { editPost } = useDispatch("core/editor");

    const updateMeta = (key, value) => {
      editPost({ meta: { ...meta, [key]: value } });
    };

    useEffect(() => {
      if (postType !== "mbsi_job") return;
      const missingDefaults = Object.fromEntries(
        Object.entries(defaults).filter(([key, value]) => value && !String(meta[key] || "").trim())
      );
      if (Object.keys(missingDefaults).length) {
        editPost({ meta: { ...meta, ...missingDefaults } });
      }
    }, [postType, meta, editPost]);

    useEffect(() => {
      if (postType !== "mbsi_job") return;
      const key = "mbsi-job-details/mbsi-job-details";
      const selector = wp.data.select("core/edit-post");
      const dispatcher = wp.data.dispatch("core/edit-post");
      if (selector.isEditorPanelOpened && !selector.isEditorPanelOpened(key)) dispatcher.toggleEditorPanelOpened(key);
    }, [postType]);

    if (postType !== "mbsi_job") return null;

    return el(
      PluginDocumentSettingPanel,
      {
        name: "mbsi-job-details",
        initialOpen: true,
        title: __("Job Details", "mbsi-core"),
        className: "mbsi-job-editor-panel",
      },
      el(
        "p",
        { className: "components-base-control__help" },
        __("Department appears on the Careers card and as the job banner eyebrow. Open positions, employment type, work setup, and application deadline appear in Position details. Leave any optional field blank to hide it.", "mbsi-core")
      ),
      el(TextControl, {label: __("Position", "mbsi-core"), value: position, onChange: (value) => editPost({title:value}), help: __("Job title shown on Careers and in Position details.", "mbsi-core")}),
      el(TextControl, {
        label: __("Department", "mbsi-core"),
        value: meta._mbsi_department || "",
        onChange: (value) => updateMeta("_mbsi_department", value),
        placeholder: __("Optional", "mbsi-core"),
        help: __("Leave blank to hide the category from the Careers card.", "mbsi-core"),
      }),
      el(TextControl, {
        label: __("Open Positions", "mbsi-core"),
        type: "number",
        min: 1,
        step: 1,
        value: meta._mbsi_open_positions || "",
        onChange: (value) => updateMeta("_mbsi_open_positions", value ? Math.max(1, parseInt(value, 10) || 1) : ""),
        placeholder: __("Optional", "mbsi-core"),
        help: __("Enter the number of available openings. Leave blank to hide it from Position details.", "mbsi-core"),
      }),
      el(SelectControl, {
        label: __("Employment Type", "mbsi-core"),
        value: meta._mbsi_employment_type || "",
        options: employmentOptions,
        onChange: (value) => updateMeta("_mbsi_employment_type", value),
      }),
      el(SelectControl, {
        label: __("Work Setup", "mbsi-core"),
        value: meta._mbsi_work_setup || "",
        options: setupOptions,
        onChange: (value) => updateMeta("_mbsi_work_setup", value),
      }),
      el(TextControl, {
        label: __("Application Email", "mbsi-core"),
        help: window.mbsiJobDelivery?.devInbox ? "Development mode: notifications and résumés go to " + window.mbsiJobDelivery.devInbox + ". This saved address is used when the development override is disabled." : "Receives application notifications and résumés.",
        type: "email",
        value: meta._mbsi_application_email || defaults._mbsi_application_email,
        onChange: (value) => updateMeta("_mbsi_application_email", value),
        required: true,
      }),
      el(TextControl, {
        label: __("Application Deadline", "mbsi-core"),
        type: "date",
        value: meta._mbsi_expires_at || "",
        onChange: (value) => updateMeta("_mbsi_expires_at", value),
        help: __("Optional. Displayed in Position details; the opening is automatically removed from Careers after this date.", "mbsi-core"),
      })
    );
  }

  wp.plugins.registerPlugin("mbsi-job-details", {
    render: JobDetailsPanel,
    icon: "businessperson",
  });
})(window.wp);
