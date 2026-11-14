# Portfolio Project Manager

## Access
Open `/manager` on this Lovable preview or your deployed Lovable website. Sign in with the verified portfolio owner email. Owner access is assigned only to the confirmed `olifman787@gmail.com` account; other accounts cannot manage projects. Email account creation requires clicking the confirmation email. Google and Lovable sign-in are also available.

## Publication
The four existing featured projects remain authored static content. New projects are stored separately. Add a project, upload its screenshot, save the draft, and then choose **Publish project**. Saving an edited published project returns it to Draft until explicitly published again. **Unpublish** hides its project and screenshot from new public requests. Previously downloaded images cannot be recalled from visitors.

Draft screenshots are private. Public image requests check current publication status rather than issuing public expiring signed URLs. Unsaved screenshot uploads may remain as private orphan files; they are not publicly readable.

## Deployment
This project was not automatically published. Deploy the Lovable app before relying on publication on a live website. On Lovable, the static portfolio reads the same-origin `/api/public/projects` list with caching disabled.

For GitHub Pages, deploy the manager on Lovable first, then set `serviceOrigin` in `public/portfolio/assets/js/managed-projects.js` to that exact HTTPS Lovable origin. Add that same origin to `connect-src` and `img-src` in the portfolio's existing CSP. Upload the updated static portfolio to Pages once, keeping existing asset paths valid. The public service allows read access from `https://olifman.github.io`; it does not change any repositories. Subsequent publication reads from the deployed service, without rebuilding Pages.

Existing CDN pointer URLs beginning `/__l5e/` are hosted by Lovable and cannot be assumed to work unchanged on GitHub Pages. For a Pages export, resolve those image URLs against the actual deployed Lovable origin, including the certificate data, or export the original supplied images into matching static paths. This export/deployment step has not been performed here.

Never deploy just the manager HTML to Pages: its sign-in, private writes, and public service require the Lovable deployment.

## Verification status
See the latest chat report for checks actually performed. Authenticated owner workflows require the owner to sign in first; an empty public list is not an end-to-end publication test. Contact email delivery and the live GitHub Pages deployment are not verified.