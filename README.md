# HexOS Update Center 🚀

> **Free Central Android App Update Manager**  
> Powered by **React + TypeScript + Tailwind CSS + Cloudflare Pages + GitHub JSON + Google Drive APK Storage**.  
> **100% Zero-Cost Architecture** — No Cloudflare D1, no Cloudflare R2, no Firebase DB, no paid backends.

---

## 🎯 Main Concept: ONE APP → ONE PERMANENT UPDATE ENDPOINT

Every Android application managed by **HexOS Update Center** gets **ONE PERMANENT update URL** that never changes:

```text
https://updates.hexos.in/api/com.hexos.zyra.json
```

- When you release version `1.5.0` → this URL returns version `1.5.0` with its Google Drive APK link.
- When you release version `1.6.0` → **this URL remains identical**, but returns version `1.6.0` with the new Google Drive APK link.
- When you release version `2.0.0` → **the URL still remains identical**.
- **Android clients never need a new update URL!**

### ❌ WRONG (Version in URL):
```text
/api/com.hexos.zyra/1.6.0.json   <-- Breaks Android clients on the next version!
```

### ✅ CORRECT (HexOS Permanent Endpoint):
```text
/api/com.hexos.zyra.json         <-- Permanent and immutable forever!
```

---

## 🏛️ Free Architecture Diagram

```text
                          CLOUDFLARE PAGES
                 (Free static website & API hosting)
                                │
                                ▼
                       HEXOS UPDATE CENTER
                  (Developer dashboard UI & tools)
                                │
                                ▼
                           GITHUB REPO
                 (Free metadata JSON file storage)
                                │
                      ┌─────────┴─────────┐
                      │                   │
                 apps/*.json        releases/*/*.json
                      │
                      ▼
             ANDROID APPLICATION
       (Checks permanent endpoint via HTTP GET)
                      │
                      ▼
                GOOGLE DRIVE
        (Free APK binary storage & direct links)
                      │
                      ▼
                   APK FILE
```

| Component | Provider | Cost | Purpose |
|---|---|---|---|
| **Frontend Dashboard & API** | Cloudflare Pages | **$0 (Free)** | Hosts website & serves static `/api/{packageName}.json` endpoints |
| **Metadata Storage** | GitHub Repository | **$0 (Free)** | Versioned JSON storage for app configurations and release history |
| **APK Binary Hosting** | Google Drive | **$0 (Free)** | Stores `.apk` build binaries with public direct download URLs |
| **Android Client** | Kotlin / Android SDK | **$0 (Free)** | Compares `versionCode` and installs APKs with Android system security |

---

## 📁 Project Directory Structure

```text
app-update/
│
├── src/
│   ├── components/
│   │   ├── HexLogo.tsx             # Custom HexOS geometric neon logo
│   │   ├── Navbar.tsx              # Top bar with global search, stats & profile
│   │   ├── Sidebar.tsx             # Navigation tabs & mobile drawer
│   │   ├── AppCard.tsx             # Modern glassmorphism card for apps
│   │   ├── RecentReleasesTable.tsx # Release list with badges, actions & rollback
│   │   ├── GoogleDriveValidator.tsx# Analyzes Drive URLs & generates direct links
│   │   ├── GitHubExportModal.tsx   # 1-click exporter for GitHub repository structure
│   │   ├── JsonViewerModal.tsx     # Formatted JSON inspector
│   │   ├── AppManageModal.tsx      # Edit apps, channels and rollbacks
│   │   ├── Toast.tsx               # Floating feedback notifications
│   │   └── Modal.tsx               # Accessible modal overlay
│   ├── pages/
│   │   ├── DashboardPage.tsx       # Metrics, flow diagram, recent releases
│   │   ├── AppsPage.tsx            # Filterable grid of all registered apps
│   │   ├── AddAppPage.tsx          # App creation with instant permanent URL generator
│   │   ├── ReleasesPage.tsx        # Version history & rollback engine
│   │   ├── CreateReleasePage.tsx   # Release publisher with Google Drive validator
│   │   ├── UpdateUrlsPage.tsx      # Permanent URLs list, cURL snippets & QR codes
│   │   ├── ApiTesterPage.tsx       # Android simulator & versionCode comparison
│   │   ├── DocsPage.tsx            # Complete API spec & Kotlin integration code
│   │   ├── PublicAppPage.tsx       # Clean public download portal (/apps/:packageName)
│   │   ├── ActivityPage.tsx        # Zero-DB audit trail of releases & events
│   │   └── SettingsPage.tsx        # Domain, GitHub repo & data backup/restore
│   ├── types/
│   │   └── index.ts                # TypeScript data models and contracts
│   ├── data/
│   │   └── initialData.ts          # Seed data (ZYRA, WinArt, Tredmpt, HexPIYUSH, Meshopz)
│   ├── utils/
│   │   ├── googleDrive.ts          # Drive file ID extractor & direct link generator
│   │   ├── version.ts              # Strict Android integer versionCode comparison
│   │   ├── storage.ts              # Local persistence, rollback & payload generator
│   │   └── githubExporter.ts       # GitHub repo structure exporter
│   ├── App.tsx                     # Main application state and routing
│   ├── main.tsx                    # React DOM entrypoint
│   └── index.css                   # Tailwind styles, glassmorphism & gradients
│
├── public/
│   └── api/                        # Permanent static endpoints served by Cloudflare
│       ├── com.hexos.zyra.json
│       ├── com.hexoswin.art.json
│       ├── com.hexos.tredmpt.json
│       ├── com.hexos.hexpiyushide.json
│       └── com.hexos.meshopz.json
│
├── github/                         # Ready-to-commit GitHub repo template
│   ├── apps/
│   └── releases/
│
├── .github/
│   └── workflows/
│       └── validate-updates.yml    # GitHub Actions automated schema validator
│
├── index.html                      # HTML document with custom favicon & fonts
├── package.json                    # Project dependencies
├── vite.config.ts                  # Vite build configuration
├── tailwind.config.js              # HexOS dark-first theme styling
└── tsconfig.json                   # TypeScript configuration
```

---

## 🚀 Step-by-Step Deployment Guide

### 1. How to Test & Run Locally
```bash
# Enter directory
cd "e:\Users\Administrator\Desktop\HexOS\app-update"

# Install dependencies (already installed)
npm install

# Start local development server
npm run dev

# Or build production static assets
npm run build
```

---

### 2. How to Deploy to Cloudflare Pages (100% Free)

1. Push this folder to a GitHub repository (e.g. `hexos-update-center`).
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Select your repository.
4. Set the build configuration:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click **Save and Deploy**.
6. Cloudflare Pages will build and deploy your site to a free subdomain:
   ```text
   https://hexos-update-center.pages.dev
   ```
7. Your permanent endpoints will immediately be live:
   ```text
   https://hexos-update-center.pages.dev/api/com.hexos.zyra.json
   ```

---

### 3. How to Connect a Custom Domain (e.g. `updates.hexos.in`)

1. In Cloudflare Pages, open your project → click the **Custom domains** tab.
2. Click **Set up a custom domain** and enter:
   ```text
   updates.hexos.in
   ```
3. Cloudflare will automatically configure the DNS CNAME record and issue a free SSL certificate.
4. In **HexOS Update Center** → open **Settings**:
   - Set **Custom Domain** to: `updates.hexos.in`
   - Set **API Base URL** to: `https://updates.hexos.in/api`
   - Click **Save Settings**.
5. Your permanent endpoint is now active on your custom domain:
   ```text
   https://updates.hexos.in/api/com.hexos.zyra.json
   ```

---

### 4. How to Host APKs on Google Drive (Free Storage)

1. Upload your compiled `.apk` file into Google Drive (e.g. into a folder named `HexOS Apps/ZYRA`).
2. **CRITICAL STEP**: Right-click the uploaded `.apk` file → click **Share** → **Share**.
3. Under **General access**, change from *Restricted* to:
   👉 **"Anyone with the link"** (Role: *Viewer*).
4. Click **Copy link** (e.g. `https://drive.google.com/file/d/1ZyRa_ExAmPLe_FiLeId_160_GoogleDrive/view?usp=sharing`).
5. Open **HexOS Update Center** → **New Release**.
6. Paste the link into the **Google Drive APK URL** field.
7. Click **Validate Link**. HexOS will automatically extract the File ID and convert it into a direct download endpoint:
   ```text
   https://drive.google.com/uc?export=download&id=1ZyRa_ExAmPLe_FiLeId_160_GoogleDrive
   ```

#### ⚠️ Important Google Drive Limitations to Know:
- **Sharing Access**: You must set "Anyone with the link can view". If left restricted, Android downloads will fail with an HTTP 403 or redirect to a Google login page.
- **Large Files (>100MB)**: Google Drive cannot automatically run virus scans on files exceeding 100MB, and displays a confirmation interstitial. Keep your APK files under 100MB for seamless one-tap downloads.
- **Download Quotas**: Google Drive is free personal cloud storage, not an enterprise CDN. If tens of thousands of users download simultaneously, Google may temporarily throttle the link for 24 hours.

---

### 5. How to Create an App

1. In the sidebar, click **Add App**.
2. Enter **App Name** (e.g. `ZYRA`).
3. Enter **Package Name** (e.g. `com.hexos.zyra`).
4. Notice that the system **automatically generates the permanent update URL**:
   ```text
   https://updates.hexos.in/api/com.hexos.zyra.json
   ```
5. Fill in description, icon URL, developer, initial version (`1.0.0`), initial version code (`1`), and minimum Android SDK (`26`).
6. Click **Register & Generate Endpoint**.

---

### 6. How to Publish a New Release

1. In the sidebar, click **Releases** → click **New Release** (or click **New Release** on an app card).
2. Select your target application.
3. Enter the new **Version Name** (e.g. `1.6.0`).
4. Enter the new **Version Code** (must be a higher integer, e.g. `16`).
5. Choose channel (**Stable**, **Beta**, or **Alpha**).
6. Paste your Google Drive APK link and click **Validate Link**.
7. Toggle **Force Update** (ON/OFF).
8. Add changelog bullet points in the "What's New" editor.
9. Click **Publish Release**.
10. The permanent endpoint `/api/com.hexos.zyra.json` is updated immediately!

---

### 7. How Android Checks for Updates (Strict Integer Comparison)

Android requires strictly comparing integer `versionCode` values, never strings:

```kotlin
val installedCode = BuildConfig.VERSION_CODE  // e.g. 15
val serverCode = update.getInt("versionCode")  // e.g. 16

if (installedCode < serverCode) {
    // UPDATE AVAILABLE -> Prompt user to download
} else if (installedCode == serverCode) {
    // UP TO DATE
} else {
    // NEWER VERSION ALREADY INSTALLED (Developer / Debug build)
}
```

---

### 8. How to Rollback a Release

If version `1.6.0` has a critical bug and you want clients to stay on or revert to `1.5.0`:

1. Go to **Releases** or click **Manage** on the app.
2. Find version `1.5.0` in the history table.
3. Click the **Rollback** button.
4. Confirm the prompt.
5. The permanent JSON endpoint `/api/com.hexos.zyra.json` immediately points back to version `1.5.0`.
6. **Version `1.6.0` is NOT deleted!** It remains safely archived in release history.

---

### 9. Android Kotlin Integration Example

Save this as `HexOSUpdateChecker.kt` in your Android project:

```kotlin
package com.hexos.zyra.update

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.appcompat.app.AlertDialog
import com.hexos.zyra.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

object HexOSUpdateChecker {

    // 1. YOUR PERMANENT UPDATE ENDPOINT (NEVER CHANGES ACROSS RELEASES)
    private const val UPDATE_ENDPOINT = "https://updates.hexos.in/api/com.hexos.zyra.json"

    data class UpdateResult(
        val isUpdateAvailable: Boolean,
        val versionName: String,
        val versionCode: Int,
        val apkUrl: String,
        val forceUpdate: Boolean,
        val changelog: List<String>
    )

    suspend fun checkUpdate(): UpdateResult? = withContext(Dispatchers.IO) {
        try {
            val url = URL(UPDATE_ENDPOINT)
            val connection = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = 10000
                readTimeout = 10000
                setRequestProperty("Accept", "application/json")
            }

            if (connection.responseCode != 200) return@withContext null

            val jsonString = connection.inputStream.bufferedReader().use { it.readText() }
            val root = JSONObject(jsonString)
            if (!root.optBoolean("success", false)) return@withContext null

            val update = root.getJSONObject("update")
            val serverVersionCode = update.getInt("versionCode")
            val serverVersionName = update.getString("version")
            val apkUrl = update.getString("apkUrl")
            val forceUpdate = update.optBoolean("forceUpdate", false)

            val changelogArray = update.optJSONArray("changelog")
            val changelog = mutableListOf<String>()
            if (changelogArray != null) {
                for (i in 0 until changelogArray.length()) {
                    changelog.add(changelogArray.getString(i))
                }
            }

            // Android Rule: Strictly compare integer versionCode
            val installedCode = BuildConfig.VERSION_CODE
            val isAvailable = installedCode < serverVersionCode

            return@withContext UpdateResult(
                isUpdateAvailable = isAvailable,
                versionName = serverVersionName,
                versionCode = serverVersionCode,
                apkUrl = apkUrl,
                forceUpdate = forceUpdate,
                changelog = changelog
            )
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    /**
     * Displays a clean update dialog and opens the Google Drive APK download link.
     * Complies with Android security requirements (No unauthorized silent installation).
     */
    fun showUpdateDialog(context: Context, result: UpdateResult) {
        val changelogText = result.changelog.joinToString("\n") { "• $it" }
        val message = "Version \${result.versionName} is ready for installation.\n\nWhat's New:\n$changelogText"

        val builder = AlertDialog.Builder(context)
            .setTitle(if (result.forceUpdate) "Mandatory Update Required" else "Update Available")
            .setMessage(message)
            .setPositiveButton("Download & Install") { _, _ ->
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(result.apkUrl))
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
            }

        if (!result.forceUpdate) {
            builder.setNegativeButton("Later", null)
        } else {
            builder.setCancelable(false)
        }

        builder.show()
    }
}
```

---

## 🔒 Security & Privacy Guarantees

1. **No Frontend Secrets**: No GitHub Personal Access Tokens or API passwords are ever required or stored in frontend JavaScript or browser storage.
2. **No Silent APK Installs**: Complies strictly with Android security rules. Updates are downloaded via standard Android mechanisms and confirmed by the user.
3. **No Database Leaks**: No credentials or connection strings exist because there is no database.

---

## 📱 Pre-Configured Demo Applications

The dashboard is seeded with rich, realistic demo applications:
1. **ZYRA** (`com.hexos.zyra`): v1.6.0 (versionCode 16), personal AI assistant, release history v1.6.0, v1.5.0, v1.4.0, v1.0.0.
2. **WinArt** (`com.hexoswin.art`): v1.2.0 (versionCode 12), Windows 11 style UI launcher suite.
3. **Tredmpt** (`com.hexos.tredmpt`): v2.0.1 (versionCode 201), cryptographic security suite with Force Update demonstrated.
4. **HexPIYUSH IDE** (`com.hexos.hexpiyushide`): v1.0.4 (versionCode 104), Android on-device developer IDE.
5. **Meshopz** (`com.hexos.meshopz`): v1.0.0 (versionCode 100), Android commerce app.

---

## 💻 Tech Stack
- **Framework**: React 18 + Vite 6
- **Language**: TypeScript 5.6
- **Styling**: Tailwind CSS 3.4 (Dark-first glassmorphism design)
- **Icons**: Lucide React
- **Hosting**: Cloudflare Pages (Free)
- **Metadata**: GitHub JSON
- **APK Hosting**: Google Drive (Free)

---

Developed for **HexOS** Systems.
