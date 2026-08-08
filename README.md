# Couplebook <3

A mobile-optimized, goofy-cartoon-themed website for Angelos & Aliki — a
month-by-month journey of the two of you, with photos and stories.

## Structure

```
index.html          Login page — real email/password sign-in (Supabase Auth)
journey.html         Main page with the swipeable month tabs + bottom nav
css/style.css         All styling (pink/red theme, blue theme for Angelos)
js/data.js             Local fallback data (used if Supabase is unreachable)
js/supabase-client.js  Supabase project URL + publishable key, creates the client
js/login.js            Handles sign-in, redirects to journey.html
js/journey.js           Auth guard, tabs/panels, Supabase fetch, swipe/lightbox
photos/month-01/ ...    Local fallback photos (only used if Supabase is down)
photos/month-10/
supabase/schema.sql     Run once in the Supabase SQL Editor to set up the DB + bucket
```

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

## Login: real Supabase Auth

Login is backed by actual Supabase Auth accounts — email + password,
verified server-side. There is no sign-up page anywhere in the app, so the
only accounts that can ever exist are the ones created directly in the
Supabase dashboard.

**One-time setup, per account (do this for both of you):**

1. Dashboard → **Authentication → Users → Add user** — set an email and a
   password (check "Auto Confirm User"). This step needs no code changes;
   any email/password works with the login form as-is.
2. Tag the account with a display name so the app knows who's who, via SQL
   Editor:
   ```sql
   update auth.users
   set raw_user_meta_data = raw_user_meta_data || '{"name":"Aliki"}'::jsonb
   where email = 'the-email-you-used';
   ```
   Use `"Angelos"` for the other account. The app reads this `name` to
   decide the color theme (`"Angelos"` → blue, anything else → pink/red) and
   to label the Profile tab.
3. Dashboard → **Authentication → Settings** → turn **off** "Allow new
   users to sign up". This is what actually prevents a third profile from
   ever being created — the app having no sign-up UI is necessary but not
   sufficient, since anyone with the (public, client-side) anon key could
   otherwise call the sign-up API directly.

**How it behaves:** `journey.html` calls `supabaseClient.auth.getSession()`
before rendering anything; no session means an immediate redirect to
`index.html`, so there's nothing to flash for a signed-out visitor.
Sessions persist in the browser (via `localStorage`, managed by
`supabase-js` itself), so you only sign in again after explicitly hitting
**Sign out** on the Profile tab or clearing site data. Switching who's
"logged in" now genuinely requires the other person's password — there's no
more one-tap switching, which is the actual security upgrade here over the
previous shared-passcode approach.

Months are already dated from Oct 28, 2025 (month 1) through the 10-month
milestone on Aug 28, 2026 (month 10). The streak badge in the top-right of
the header (🔥 + day count) counts down to that date automatically, flips to
a 🎉 on the day itself, then counts up (💕 +Nd) afterward. Tap-and-hold (or
hover on desktop) for the full sentence via its tooltip.

The tab you land on by default, the tab sparkle, and the "✨ Current month"
badge are all just whichever row has the highest `number` in the `months`
table — not the `current` column, and not a calendar calculation. Add a new
month row (e.g. number 12) when that month starts, and the app points at it
automatically. No manual flag to flip, no date math to keep correct.

## Navigation

The journey page has a fixed bottom nav with two tabs:

- **Journey** — header with the streak badge, month tabs, and month content
  (the original page).
- **Profile** — an avatar/name card for whoever's signed in, two live stats
  (days together, since Oct 28, 2025; months logged, just `months.length`),
  and a **Sign out** button.

## Performance

Two things keep the Supabase load feeling fast:

- **Parallel fetch** — `js/journey.js` fires the `months` table query and
  the photo-folder `list()` calls for every already-known month at the same
  time, instead of waiting for the table to respond before starting any
  storage requests. Any brand-new month (not yet known locally) gets its
  photo listing kicked off as soon as the table response reveals it.
- **Session cache** — the fully resolved month list (text + public photo
  URLs) is cached in `sessionStorage`. On the very first load in a browser
  tab it still has to hit the network, but reopening/reloading within the
  same session paints instantly from cache while a fresh copy loads quietly
  in the background.

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
