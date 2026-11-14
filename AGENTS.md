<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the static portfolio in `public/portfolio`; use CDN asset pointers beside its image directories and their returned URLs in static markup/data so uploaded media stays out of source control.
- Certificate entries may omit verification URLs; both book layouts must omit credential links when no URL is supplied to avoid fabricated or broken destinations.
- Keep management in separate authenticated TanStack routes and enforce owner roles on every server action; the static portfolio must never carry private credentials.
- Keep managed projects additive to authored slides and publish through a no-store public feed; this supports static hosting without repository writes.
- Store screenshots privately and serve published images through status-checked public endpoints; drafts must not acquire public signed URLs.
