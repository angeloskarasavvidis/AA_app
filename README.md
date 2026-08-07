# The double A journey <3

A mobile-optimized, goofy-cartoon-themed website for Angelos & Aliki — a
month-by-month journey of the two of you, with photos and stories.

## Structure

```
index.html          Login page — tap "Aliki" or "Angelos" (no password)
journey.html         Main page with the swipeable month tabs
css/style.css         All styling (pink/red theme, blue theme for Angelos)
js/data.js             Local fallback data (used if Supabase is unreachable)
js/supabase-client.js  Supabase project URL + publishable key, creates the client
js/login.js            Stores the chosen profile, redirects to journey.html
js/journey.js           Renders tabs/panels, fetches from Supabase, swipe/lightbox
photos/month-01/ ...    Local fallback photos (only used if Supabase is down)
photos/month-10/
supabase/schema.sql     Run once in the Supabase SQL Editor to set up the DB + bucket
```

## Data: Supabase-backed, dashboard-managed

Month text and photos live in Supabase, not in this repo, so you can update
either from your phone without touching code:

- **Text** — Supabase dashboard → **Table Editor** → `months` table. Edit
  `title`, `range`, `description`, or `current` directly in the spreadsheet
  view.
- **Photos** — Supabase dashboard → **Storage** → `photos` bucket →
  `month-XX` folder. Drag photos in; the app lists whatever's in each folder
  automatically, no filenames to register anywhere.

The anon/publishable key in `js/supabase-client.js` is read-only by design
(see `supabase/schema.sql` — there's a `select` policy but no `insert`/
`update`/`delete` policy for it). Only edits made through the dashboard
(using your own login) can write. Nothing in the app itself can modify data,
so there's no login-abuse surface to worry about.

If Supabase is ever unreachable, the app falls back to whatever is in
`js/data.js` / `photos/` so it never shows a broken page — but that local
copy isn't kept in sync automatically, so treat Supabase as the source of
truth going forward.

## Login / profiles

There's no password — tapping a name on the login page stores it in
`localStorage` and opens the journey. Picking "Angelos" recolors the whole
journey page blue (via a `theme-blue` class that overrides the same CSS
variables); "Aliki" keeps the default pink/red look. A "Switch" button in
the journey header clears the stored profile and returns to the login page.
Visiting `journey.html` directly without picking a profile first bounces you
back to `index.html`.

Months are already dated from Oct 28, 2025 (month 1) through the 10-month
milestone on Aug 28, 2026 (month 10, marked "current"). The countdown banner
at the top counts down to that date automatically.

## Running it locally

Just open `index.html` in a browser, or serve the folder so relative paths
and fonts load cleanly:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Deploying (optional)

This is a static site — it works as-is on GitHub Pages, Netlify, or Vercel.
For GitHub Pages: push this repo and enable Pages on the `main` branch.
