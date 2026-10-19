# Private Portfolio Project Manager

## Preserve your current portfolio
- Keep the four existing featured projects, their order, screenshots, and content unchanged.
- Preserve your profile photo, certificates, personal information, GitHub links, Contact Me, navigation, footer, social links, and Speed Insights.
- Keep GitHub repositories completely separate: no discovery, imports, repository changes, or automatic project cards.
- A backup has been created before implementation.

## Add private project management
- Add a separate Project Manager page without changing the public navigation.
- Enable Lovable Cloud for persistent project details, screenshot storage, and sign-in.
- Restrict management to your verified owner account through server-enforced access; signing in alone will not grant management privileges.
- Include project name, short description, screenshot upload, technologies, optional category, optional live demo URL, optional repository URL, and Draft/Published status.
- Support adding, saving drafts, private preview, editing, explicit publishing, unpublishing, and deletion with confirmation.
- Keep drafts and their screenshots private. Do not create sample projects or guess any content or links.

## Public publishing
- Keep the four hand-authored projects as the existing showcase. Append only new projects you explicitly publish.
- A protected publishing service will provide a public list containing published projects only. Unpublishing removes a new project from that list.
- Once the updated portfolio and manager are deployed on Lovable, project publication updates the public list without rebuilding the website.
- If your public website remains on GitHub Pages, deploy the manager/service on Lovable and update the Pages site once to read its public list. GitHub Pages cannot host the private service itself.
- Do not access or modify any GitHub repositories. You will need to deploy the updated static portfolio to Pages yourself if Pages is your live host; explain the exact required configuration after implementation.
- No live site is currently published through this Lovable project. Live deployment verification will remain pending until a supported public deployment exists; local testing is not proof that your live Pages website updated.

## Technical implementation
- Keep the static portfolio in `public/portfolio`; add separate TanStack routes for sign-in and the private manager.
- Use Lovable Cloud tables with explicit grants and row-level access rules, a separate owner-role record, and protected server functions for management.
- Use private screenshot storage with owner access and public access limited to screenshots belonging to published projects. Validate uploads and project fields, including URL protocols and length limits.
- Add a read-only public project feed with no owner information or draft data. For a Pages deployment, restrict cross-origin access appropriately and configure the exact service origin.
- Load published projects before the existing carousel initializes; retain existing projects if the feed is unavailable.
- Make the minimum required security-policy and service-worker adjustments so the public feed stays fresh and private pages/data are never cached by the portfolio worker.

## Verification and handover
- Test creation, draft persistence after refresh, screenshot upload, editing, preview, publication, public readback, unpublication, and confirmed deletion.
- Check that visitors and other accounts cannot manage projects or read drafts/private screenshots.
- Verify existing featured projects and GitHub links remain intact; test desktop and mobile views.
- Report exact changed files, the manager address, owner access setup, publication behavior, and any unverified deployment steps.
- Do not claim publishing works until the full workflow has been exercised; distinguish preview verification from live-site verification.