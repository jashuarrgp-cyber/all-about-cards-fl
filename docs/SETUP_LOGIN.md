# Turning on real login — setup guide

Plain-language, click-by-click. Written for Josh. The goal: real
"Sign in with Google," your own saved collection, and you as the owner.

**What's already done (in the code, no action needed):**

- "Sign in with Google" button is built. It stays off until the settings
  below are filled in, then it just works.
- You become the **owner automatically** the first time you sign in with
  your own email — no command line, no script to run.
- Everyone else who signs in starts with no access until you enable them
  (customer spaces come in a later phase).

**What needs _you_ (about 15–20 minutes, one time):** a few clicks inside
_your own_ Google and Vercel accounts. I can't do these because they're
tied to your logins — and you wouldn't want me able to log in as you.
Nothing here costs money on the free tiers.

Do the steps in order.

---

## Step 1 — Create the database (where your data lives)

This is the notebook that remembers your collection.

1. Go to your project on **vercel.com** → open the **Storage** tab.
2. Click **Create Database** → choose **Postgres** → give it any name →
   **Create**.
3. When it asks which project to connect it to, pick
   **all-about-cards-fl** and click **Connect**.

That's it — Vercel automatically hands the app the database's address, so
there's nothing to copy or paste for this part.

---

## Step 2 — Create your Google sign-in app (the "Sign in with Google" button)

1. Go to **console.cloud.google.com** and sign in with your Google
   account.
2. At the top, click the project dropdown → **New Project** → name it
   anything (e.g. "All About Cards") → **Create**, then make sure it's
   selected.
3. In the search bar, type **"OAuth consent screen"** and open it.
   - Choose **External** → **Create**.
   - Fill in the app name (e.g. "All About Cards"), your email where it
     asks for support/developer contact, and **Save and Continue**
     through the steps (you can leave the optional parts blank).
4. In the search bar, type **"Credentials"** → open it → click
   **Create Credentials** → **OAuth client ID**.
   - Application type: **Web application**.
   - Under **Authorized redirect URIs**, click **Add URI** and paste this,
     replacing the address with your real site address:

     ```
     https://YOUR-SITE.vercel.app/api/auth/callback/google
     ```

     (Your site address is the one Vercel shows for the project. If you
     later add a custom domain like allaboutcardsfl.com, add a second URI
     with `https://allaboutcardsfl.com/api/auth/callback/google` too.)

   - Click **Create**.

5. Google shows you a **Client ID** and a **Client secret**. Keep this
   window open (or copy both somewhere safe) — you'll paste them in the
   next step. Treat the secret like a password.

---

## Step 3 — Put the settings into Vercel

1. On **vercel.com** → your project → **Settings** → **Environment
   Variables**.
2. Add these, one at a time (Name on the left, Value on the right):

   | Name                  | Value                                        |
   | --------------------- | -------------------------------------------- |
   | `AUTH_GOOGLE_ID`      | the **Client ID** from Google (Step 2)       |
   | `AUTH_GOOGLE_SECRET`  | the **Client secret** from Google (Step 2)   |
   | `INITIAL_OWNER_EMAIL` | your own email (the one you'll sign in with) |
   | `AUTH_SECRET`         | a long random string (see note below)        |
   | `AUTH_TRUST_HOST`     | `true`                                       |
   - **AUTH_SECRET**: this just needs to be a long random string (32+
     characters). Easiest way: open a new browser tab, go to
     **generate-secret.vercel.app/32**, and copy what it shows.
   - `DATABASE_URL` should already be there from Step 1 — leave it alone.

3. Click **Save**, then go to the **Deployments** tab and **Redeploy** the
   latest one, so the new settings take effect.

---

## Step 4 — Set up the tables and roles (one-time, done together)

The database from Step 1 starts empty — it needs its tables created and
the basic roles added once. These are two commands run against the live
database. **This is the one part I can do _with_ you** in a working
session, or you can paste them yourself if you're comfortable. Ping me
"ready to set up the database" once Steps 1–3 are done and we'll do it in
two minutes. For reference, the two commands are:

```
DATABASE_URL="<the production database url>" npm run prisma:migrate:deploy
DATABASE_URL="<the production database url>" npm run prod:init
```

The first creates the tables; the second adds the roles. Both are safe to
run again if needed — they never duplicate or erase anything. `prod:init`
adds **only** roles/permissions, never any sample cards or fake inventory.

---

## Step 5 — Sign in (you become the owner automatically)

1. Go to your site → **Sign in** → **Sign in with Google** → pick your
   account (the same email you put in `INITIAL_OWNER_EMAIL`).
2. Because your email matches, you're made the **owner** on that first
   sign-in — you go straight into the app with full access.
3. Anyone else who signs in lands on a friendly "your account needs
   enabling" page until you (or a future customer feature) grant access.

That's it — real login is on, and your collection now saves to your own
private space.

---

## If something looks off

- **Button still says "not turned on yet":** the redeploy in Step 3
  probably hasn't finished, or one of `AUTH_GOOGLE_ID` /
  `AUTH_GOOGLE_SECRET` is blank. Re-check them and redeploy.
- **Google shows a "redirect_uri_mismatch" error:** the redirect URI in
  Step 2 doesn't exactly match your site address. Copy your real site
  address and make sure it ends in `/api/auth/callback/google`.
- **You sign in but land on "account needs enabling":** the email you
  signed in with doesn't match `INITIAL_OWNER_EMAIL`, or Step 4 hasn't
  been run yet. Fix the email (and redeploy) or finish Step 4.
