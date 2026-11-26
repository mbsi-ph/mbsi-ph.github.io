# MBSI Official Website

> This repository contains the public static version of the Millennium Business Services, Inc. (MBSI) website. It supports MBSI website publishing, maintenance, and technical documentation.

## About This Repository

The website presents MBSI services, company information, team profiles, resources, career opportunities, and contact details.

The original website is developed with WordPress and Elementor. This repository contains exported HTML, CSS, JavaScript, images, and other public assets for GitHub Pages. WordPress itself, its administration dashboard, PHP processing, and its database do not run in this static version.

This repository is a publishing copy, not a complete WordPress backup. Website address: **https://mbsi-ph.github.io/**.

## Website Features

The website includes:

- Improving service pages, cards, typography, spacing, and calls to action.
- Refining desktop and mobile navigation and responsive layouts.
- Adding light and dark appearance settings and theme-aware logos.
- Improving loading transitions, careers listings, and resource empty states.
- Integrating Elementor layouts and organizing shared styles.
- Optimizing images and preparing the static publishing copy.

Features must be tested in the published environment after each update.

## Files and Folders

| Location | Contents |
| --- | --- |
| `index.html` | Homepage |
| `about-us/`, `our-services/`, `our-team/` | Company, service, and team pages |
| `careers/` and job-detail folders | Exported career information |
| `resources/`, `news/` | Exported resource and news pages |
| `contact-us/`, `privacy-policy/` | Contact and privacy information |
| `wp-content/`, `wp-includes/` | Exported public assets used by the pages; these names do not mean WordPress runs here |
| `.nojekyll` | Publishes the static files without Jekyll processing |
| `.gitignore` | Helps exclude private files, local backups, and test content from Git |

## Publishing with GitHub Pages

1. Upload this folder's contents to the approved public website repository. Keep `index.html` at the repository root.
2. Open **Settings > Pages**.
3. Choose **Deploy from a branch**, select **main**, and choose **/ (root)**.
4. Save and check the **Actions** tab for the deployment result.
5. Open the published website and test desktop/mobile layouts, navigation, images, logos, and both appearance modes.

Exported links use the `/` path. Changing the repository name, publishing path, or domain requires updating the export settings and checking the generated links again.

## Forms and Other Limitations

**The exported contact, application, and subscription forms are not connected to a working public submission service. Do not use them to send personal information or documents.**

Some exported form actions still reference the local WordPress server. These must be replaced with an approved hosted submission service or backend before the forms can be used publicly. Until that work is complete, remove or disable the submission controls on the public site, or clearly direct visitors to a verified alternative contact method.

WordPress-powered search, server-side filtering, pagination, and other dynamic behavior may also need separate handling. A feature that works locally must be tested again after static export. WordPress dashboard changes do not automatically update this repository.

## Updating the Website

1. Make changes in the original WordPress development website.
2. Generate a new static export with the `/` URL path.
3. Remove private files, test content, and unnecessary backup assets before copying the export into this repository.
4. Preserve this README, `.gitignore`, `.nojekyll`, and the repository's `.git` directory.
5. Review the changed files and test the static copy before committing and pushing.
6. Check the GitHub Pages deployment and verify the published pages.

Do not use this public repository to store the WordPress database, `wp-config.php`, credentials, applicant files, or private company records. Keep the WordPress source in the separate private `MBSI` repository, with protected database, media, and configuration backups stored separately.

## Privacy and Responsible Use

- Only approved public website content belongs in this repository.
- Private application storage under `wp-content/uploads/mbsi-private/`, test pages, and author archives were excluded from the initial cleaned export. Repeat the checks after every new export.
- `.gitignore` does not protect files uploaded through the GitHub website, remove files already tracked by Git, or erase earlier history.
- If a secret or private file is published, remove it from public access, revoke affected credentials where applicable, and address any copies in repository history.
- Share security concerns through an authorized private contact rather than including confidential details in public issues.

These are project maintenance expectations, not a statement that a formal security, privacy, or legal review has been completed.

## Copyright, Attribution, and Licensing

### Company identity and materials

The MBSI name, logos, company identity, and company-provided content remain attributable to MBSI and/or their respective rights holders. Public access to this repository does not grant permission to reuse company branding, confidential information, or materials outside their applicable permissions.

### Third-party components

The website uses output and assets from WordPress, Elementor, plugins, themes, libraries, fonts, icons, and other resources created by their respective contributors. Those components retain their existing copyright notices and applicable licenses. Consult the relevant component notices and original distributions for their terms.

This README does not replace existing licenses, relicense third-party materials, or restrict rights granted by those licenses. Images and other media may have separate usage terms; their inclusion does not establish unrestricted reuse permission.

## Project Contact

For website maintenance, access, or company-related questions, use the official MBSI contact channels listed on the website.
