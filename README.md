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
js/config.js            Gitignored, generated — holds PASSCODE, see below
photos/month-01/ ...    Local fallback photos (only used if Supabase is down)
photos/month-10/
supabase/schema.sql     Run once in the Supabase SQL Editor to set up the DB + bucket
scripts/build-config.js Generates js/config.js from .env
.env.example             Copy to .env and fill in your own PASSCODE
```

## First-time setup

`js/config.js` is gitignored (it holds the passcode) so it isn't in the
repo. After cloning, generate it once:

```bash
cp .env.example .env   # then edit .env and set PASSCODE
node scripts/build-config.js
```

Re-run `node scripts/build-config.js` any time you change `.env`. Without
this step the login page's PIN check will fail (`PASSCODE is not defined`)
because `js/config.js` won't exist yet.

## Data: Supabase-backed, dashboard-managed

Month text and photos live in Supabase, not in this repo, so you can update
either from your phone without touching code:

- **Text** — Supabase dashboard → **Table Editor** → `months` table. Edit
  `title`, `range`, or `description` directly in the spreadsheet view. (The
  `current` column still exists but is no longer read by the app — see
  below.)
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

The login page is gated by a shared 4-digit passcode, read from `PASSCODE`
in `js/config.js` (generated from `.env` — see "First-time setup" above).
Enter it correctly and the two profile buttons — "Aliki" and "Angelos" —
appear; there's no sign-up option, so those are the only two profiles that
can ever exist. Tapping one stores the name in `localStorage` and opens the
journey. Picking "Angelos" recolors the whole journey page blue (via a
`theme-blue` class that overrides the same CSS variables); "Aliki" keeps the
default pink/red look. A "Switch" button in the journey header clears the
stored profile and returns to the (passcode-gated) login page. Visiting
`journey.html` directly without picking a profile first bounces you back to
`index.html`.

Worth knowing: this is a static site with no backend auth, so the passcode
check happens entirely in the browser. Keeping it in `.env`/`js/config.js`
(both gitignored) keeps it out of the git history and off GitHub — but the
live page still has to send the plaintext value to the browser to check it,
so anyone who opens dev tools on the deployed site can still read it, and
anyone could set `localStorage.aa_profile` directly to skip the gate
entirely. This setup stops casual link-sharing and keeps the repo clean; it
is not a real security boundary. If this ever needs to survive a public
link against a determined snoop, swap it for real Supabase Auth accounts
instead.

Months are already dated from Oct 28, 2025 (month 1) through the 10-month
milestone on Aug 28, 2026 (month 10). The countdown banner at the top counts
down to that date automatically.

The tab you land on by default, the tab sparkle, and the "✨ Current month"
badge are all just whichever row has the highest `number` in the `months`
table — not the `current` column, and not a calendar calculation. Add a new
month row (e.g. number 12) when that month starts, and the app points at it
automatically. No manual flag to flip, no date math to keep correct.

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
