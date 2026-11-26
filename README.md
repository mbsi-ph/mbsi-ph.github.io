# MBSI Official Website â€” Static Website

> This is MBSI's website publishing repository. It contains the static website output prepared for GitHub Pages, rather than the working WordPress application.

Website address: **https://mbsi-ph.github.io/**. Availability depends on GitHub Pages being enabled and its deployment succeeding.

## What This Repository Contains

- HTML pages for company information, services, team profiles, resources, careers, and contact information.

- CSS, JavaScript, website images, fonts, and supporting assets.

- Responsive layouts, appearance controls, navigation, and loading animations from the exported website.

- `.nojekyll` for direct static publishing and `.gitignore` for common private-file exclusions.

The `wp-content/` and `wp-includes/` names may appear because the assets originate from WordPress. PHP, the WordPress dashboard, and the database do not run here.

## Publishing

1. Keep `index.html` at the repository root.

2. In **Settings > Pages**, choose **Deploy from a branch**, **main**, and **/ (root)**.

3. Leave **Custom domain** blank when using `mbsi-ph.github.io`.

4. Check the **Actions** tab and the published pages after deployment.

Export links must use the root path `/`, not `/MBSI-Website/`.

## Update Workflow

1. Make changes in the original WordPress development site.

2. Generate a static export for the root website address.

3. Exclude applications, credentials, database exports, test pages, and local backup files.

4. Test the export and store an approved snapshot in the the static export backup repository.

5. Publish the reviewed static files here, preserving `.git`, this README, `.gitignore`, and `.nojekyll`.

6. Verify navigation, images, desktop/mobile layouts, appearance modes, and any services.

## Current Functional Limits

**The exported contact, application, and subscription forms are not connected to a working submission service.** Some exported actions reference the local WordPress server. Do not use these forms to send personal information or documents. Connect an approved backend before enabling submissions; until then disable submission controls or provide a verified alternative contact method.

WordPress-powered search, filtering, pagination, and other server-dependent features require separate handling and testing. Editing WordPress does not automatically update this published copy.

## Copyright and Third-Party Materials

This project supports the website of **Millennium Business Services, Inc. (MBSI)**. MBSI branding and company-provided materials remain subject to their applicable ownership and usage permissions. Access does not grant permission to reuse company branding or confidential materials.

WordPress, Elementor, plugins, themes, libraries, fonts, icons, images, and other third-party materials retain their respective copyright notices and licenses. Consult their original notices and distributions. This README does not replace those terms, relicense third-party components, or restrict rights already granted by their licenses.

Project-specific work and permitted reuse remain subject to applicable agreements and licenses. No individual ownership claim over the complete codebase is made by this documentation.

## Contact

Use the official MBSI contact channels listed on the company website for company-related questions. Send sensitive maintenance or security information through approved channels.
