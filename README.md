# Melt

A dating app that connects people through shared sports and fitness interests. Sign in with a
magic link, build a profile, discover people ranked by shared sports and distance, melt
(like), match and chat.

**Stack:** TanStack Start (React 19, SSR) · Vite · Tailwind v4 · shadcn/ui · Supabase (Postgres,
Auth, Storage, Realtime) · deployed as a Cloudflare Worker. Originally generated with
[Lovable](https://lovable.dev/projects/52fda359-3a0f-4108-8cc1-f6633a4e59fb).

## How it fits together

- The browser talks to Supabase directly with the public anon key. **Row-level security (RLS) is
  the security boundary**: every table has policies, and anything that needs other people's data
  (discovery, likes, chat list, export, account deletion) goes through `security definer`
  functions that check the caller.
- The schema lives in [`supabase/migrations/`](supabase/migrations):
  1. `…01_init.sql`: tables, RLS, the 18+ trigger, consent capture, the private photo bucket
     and the realtime publication
  2. `…02_core_flows.sql`: discovery ranking, swipes/matches, chat list
  3. `…03_safety_gdpr.sql`: blocked list, data export, account deletion
- Privacy by design: locations are rounded to about 5 km **on the device** and only ever exposed
  as a distance. Photos are private and served through short-lived signed URLs, with EXIF
  metadata removed before upload.
- Data access code is in [`src/lib/api/`](src/lib/api); auth and route protection are in
  [`src/lib/auth.tsx`](src/lib/auth.tsx).
- The **Activities** tab is still a preview with sample data, and is labelled as such in the app.

## Run locally

Prerequisites: [Bun](https://bun.sh) (or Node 20+ with npm), and a Supabase project.

1. **Create a Supabase project** at [supabase.com](https://supabase.com) in region **Central EU
   (Frankfurt)**. The free plan is enough for testing.
2. **Apply the migrations.** In the dashboard, open **SQL Editor** and run the three files in
   `supabase/migrations/` in order. Alternatively, use the CLI:
   `npx supabase link --project-ref <ref>` then `npx supabase db push`.
3. **Configure Auth** (Dashboard → Authentication):
   - **Sign In / Providers → Email**: enabled. Leave "Confirm email" on; magic links confirm
     the address.
   - **URL Configuration → Site URL**: `http://localhost:8080` (later your production URL).
   - **URL Configuration → Redirect URLs**: add `http://localhost:8080/auth/callback` and
     `https://<your-domain>/auth/callback`.
   - **Emails → SMTP**: Supabase's built-in email is rate-limited to a handful of emails per
     hour. Before inviting testers, connect an SMTP provider (several have free tiers).
4. **Environment:** `cp .env.example .env.local`, then fill in `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` (Dashboard → Project Settings → API).
5. **Start:**
   ```sh
   bun install
   bun run dev        # http://localhost:8080
   ```
   Open the magic link in the **same browser** you requested it from (it uses PKCE).

To test matching you need two accounts: use two browsers, or a normal and a private window, with
two email addresses.

### Fully local Supabase (optional)

With Docker Desktop installed, `npx supabase start` runs Postgres, Auth, Storage and Realtime
locally, applies the migrations and prints a local URL and anon key for `.env.local`. Magic-link
emails land in the local inbox at http://localhost:54324.

## Tests

```sh
bun run test        # Vitest: age/18+ rules, location rounding & distance, form schemas,
                    # profile mapping, auth-gate redirects, consent
bun run test:db     # pgTAP (via `npx supabase test db`, needs Docker): RLS, 18+ trigger,
                    # consent, matching, ranking, messaging, blocking, reports, export, deletion
```

The database tests are in [`supabase/tests/database/`](supabase/tests/database). They run against
the local Supabase stack, impersonating users with `request.jwt.claims`.

## Deploy

The production build is a Cloudflare Worker (`bun run build` writes `.output/`). `VITE_*`
variables are **inlined at build time**, so they must be set in the environment that runs the
build.

- **Lovable Publish:** Lovable builds from this repo. Make sure the two `VITE_SUPABASE_*` values
  are available to its build. They are public (protected by RLS), so committing a
  `.env.production` is acceptable. If you do, add `!.env.production` to `.gitignore`.
- **Cloudflare directly:**
  ```sh
  VITE_SUPABASE_URL=… VITE_SUPABASE_ANON_KEY=… VITE_SITE_URL=https://your-domain bun run build
  npx wrangler login
  npx nitro deploy --prebuilt
  ```

After deploying, add the production URL to the Supabase **Site URL** and **Redirect URLs**.

## Moderation

Reports are written to the `reports` table and are not readable through the API. Review them in
the Supabase dashboard (Table Editor → `reports`, filter `status = open`). To remove an abusive
user, delete them under Authentication → Users; their data cascades.

## Before a public launch

- Fill in every highlighted `[placeholder]` on `/privacy` and `/terms`, and have both reviewed.
  They are drafts, not legal advice.
- Replace the **mock Impressum** (`/impressum`, § 5 DDG) with your real details.
- Fonts are self-hosted via `@fontsource` (imported in `src/styles.css`), so no visitor data goes
  to Google Fonts. Keep it that way.
- Accept Supabase's DPA (Dashboard → Organization → Legal Documents), and set up custom SMTP.
