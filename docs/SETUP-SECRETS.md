# Secrets setup (all from your phone, all free)

Secrets live in GitHub: repo **Shorts** -> Settings -> Secrets and variables -> Actions -> **New repository secret**.
(GitHub mobile app: open the repo in the browser view, or use github.com in Chrome/Safari with "Desktop site" on.)
Nothing here costs money. Never paste these values into a chat.

## Google Drive (rclone) - 3 secrets

You have no PC, so instead of running `rclone config` we create the same login with Google's own web tools.
The workflows build the rclone config from these 3 secrets at run time.

### 1. Make a free Google Cloud project (no billing account needed)
1. Open https://console.cloud.google.com (switch the browser to **Desktop site**). Sign in with the Google account whose Drive you want.
2. Top bar -> project picker -> **New project** -> name it `shorts-drive` -> Create. Select it.
3. Menu -> **APIs & Services -> Library** -> search **Google Drive API** -> **Enable**.

### 2. Consent screen
1. **APIs & Services -> OAuth consent screen** (may be called "Google Auth Platform" -> Branding).
2. User type **External** -> app name `shorts-drive`, your email as support + developer contact -> Save.
3. **Audience**: add your own Gmail as a **Test user**.
4. Then press **Publish app** (status "In production"). Important: in "Testing" mode Google expires the login every 7 days.
   You'll see an "unverified app" warning later; that's expected for a personal app (verification is only needed for 100+ users).

### 3. OAuth client
1. **APIs & Services -> Credentials -> Create credentials -> OAuth client ID**.
2. Application type **Web application**, name `shorts-rclone`.
3. **Authorized redirect URIs** -> Add: `https://developers.google.com/oauthplayground`
4. Create. Copy the **Client ID** and **Client secret**.

### 4. Get a refresh token with the OAuth Playground
1. Open https://developers.google.com/oauthplayground (Desktop site).
2. Gear icon (top right) -> tick **Use your own OAuth credentials** -> paste Client ID + Client secret. Close.
3. Left box "Input your own scopes": type `https://www.googleapis.com/auth/drive` -> **Authorize APIs**.
4. Pick your account -> "Google hasn't verified this app" -> **Advanced** -> **Go to shorts-drive (unsafe)** -> Continue/Allow.
5. Back in the Playground press **Exchange authorization code for tokens**. Copy the **Refresh token** (starts with `1//`).

### 5. Add the secrets
| Name | Value |
|---|---|
| `GDRIVE_CLIENT_ID` | the Client ID |
| `GDRIVE_CLIENT_SECRET` | the Client secret |
| `GDRIVE_REFRESH_TOKEN` | the refresh token |

(Alternative: if you ever have an `rclone.conf` with a `[gdrive]` remote, you can store the whole file as one secret `RCLONE_CONF` instead.)

Then run **Actions -> health-check -> Run workflow**. Its "drive" job creates `/Shorts/Review`, `/Shorts/Approved`,
`/Shorts/Published` and `/Shorts/Rejected` in your Drive and says "drive: connected".

## Optional repository variables (Settings -> Secrets and variables -> Actions -> Variables tab)
| Name | Default | Meaning |
|---|---|---|
| `NARRATOR_ENGINE` | `kokoro` | `kokoro` or `voicestudio` |
| `NARRATOR_VOICE` | `am_michael` | Kokoro voice id picked after the health check |
