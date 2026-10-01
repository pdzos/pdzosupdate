import React, { useState } from 'react';
import { Copy, Check, Terminal, Smartphone, Globe, BookOpen, HardDrive, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useToast } from '../components/Toast';

export const DocsPage: React.FC = () => {
  const { showToast } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copySnippet = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    showToast({ type: 'success', title: 'Code Copied to Clipboard' });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const kotlinCode = `package com.hexos.zyra.update

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import com.hexos.zyra.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

object HexOSUpdateChecker {

    // 1. YOUR PERMANENT UPDATE ENDPOINT (NEVER CHANGES)
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
                // Open APK in browser or DownloadManager
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
}`;

  const jsCode = `// Fetch HexOS permanent update endpoint in JavaScript
async function checkHexOSUpdate(packageName) {
  const endpoint = \`https://updates.hexos.in/api/\${packageName}.json\`;
  const response = await fetch(endpoint, { cache: 'no-cache' });
  const data = await response.json();

  if (data.success) {
    console.log('App:', data.app.name);
    console.log('Latest Version:', data.update.version);
    console.log('Version Code:', data.update.versionCode);
    console.log('APK Link:', data.update.apkUrl);
    console.log('Force Update:', data.update.forceUpdate);
  }
  return data;
}`;

  const curlCode = `# Test permanent update endpoint using cURL
curl -s "https://updates.hexos.in/api/com.hexos.zyra.json" | jq .`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <span>HexOS Developer & API Documentation</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Everything you need to integrate HexOS permanent update endpoints into your Android applications.
        </p>
      </div>

      {/* Section 1: Endpoint Specification */}
      <div className="p-6 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>1. Permanent Endpoint Specification</span>
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed">
          Every registered Android application has exactly <strong>ONE permanent JSON endpoint</strong>. This URL
          never changes across versions, channels, or rollbacks.
        </p>

        <div className="bg-[#08090e] p-3 rounded-xl border border-slate-800 font-mono text-xs flex items-center justify-between">
          <span className="text-emerald-400 font-bold select-none mr-2">GET</span>
          <span className="text-blue-300 truncate flex-1">
            https://updates.hexos.in/api/&#123;packageName&#125;.json
          </span>
          <span className="text-[10px] text-slate-500 ml-2">HTTP 200 OK</span>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block font-mono">
            Standard JSON Response Format:
          </span>
          <pre className="p-4 rounded-xl bg-[#08090e] border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
{`{
  "success": true,
  "app": {
    "name": "ZYRA",
    "packageName": "com.hexos.zyra",
    "icon": "https://example.com/icon.png",
    "description": "Personal AI Assistant",
    "developer": "HexOS Systems"
  },
  "update": {
    "version": "1.6.0",
    "versionCode": 16,
    "apkUrl": "https://drive.google.com/uc?export=download&id=...",
    "fileSize": "52 MB",
    "minimumAndroid": 26,
    "forceUpdate": false,
    "channel": "stable",
    "releaseDate": "2026-10-01",
    "changelog": [
      "Faster AI responses",
      "New voice features",
      "Bug fixes"
    ]
  }
}`}
          </pre>
        </div>
      </div>

      {/* Section 2: Android Kotlin Integration */}
      <div className="p-6 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>2. Android Kotlin Integration Code</span>
          </h2>
          <button
            onClick={() => copySnippet(kotlinCode, 'kotlin')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors border border-slate-700"
          >
            {copiedKey === 'kotlin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Kotlin File</span>
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Place this helper class inside your Android Studio project. It queries the permanent endpoint,
          compares <code className="text-cyan-400 font-mono">BuildConfig.VERSION_CODE</code>, and triggers the standard
          Android package installer.
        </p>

        <pre className="p-4 rounded-xl bg-[#08090e] border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto max-h-[450px] leading-relaxed">
          {kotlinCode}
        </pre>
      </div>

      {/* Section 3: Android Security Rules & Package Installation */}
      <div className="p-6 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>3. Android Security & Installation Rules</span>
        </h2>

        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-slate-300 space-y-2 leading-relaxed">
          <p className="font-semibold text-purple-300">
            Android Security Requirements Compliance:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400 text-[11px]">
            <li>
              <strong>No Silent Installation:</strong> Android OS does not permit non-root applications to silently install APKs without user consent.
            </li>
            <li>
              <strong>Install Permission:</strong> If your app downloads APKs directly via <code className="text-purple-300">DownloadManager</code>, declare <code className="text-purple-300">&lt;uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES"/&gt;</code> in your <code className="text-purple-300">AndroidManifest.xml</code>.
            </li>
            <li>
              <strong>FileProvider:</strong> When launching the package installer with <code className="text-purple-300">Intent.ACTION_VIEW</code>, provide a content URI via Android <code className="text-purple-300">FileProvider</code> with <code className="text-purple-300">FLAG_GRANT_READ_URI_PERMISSION</code>.
            </li>
          </ul>
        </div>
      </div>

      {/* Section 4: Google Drive Hosting Guide */}
      <div className="p-6 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-amber-400" />
          <span>4. Google Drive APK Hosting Guide & Limitations</span>
        </h2>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Google Drive acts as free storage for APK binaries. Because it is completely free, keep in mind these important rules:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#121422] border border-slate-800 space-y-1.5">
              <span className="font-bold text-white block">1. File Sharing Permissions</span>
              <p className="text-[11px] text-slate-400">
                In Google Drive, right click the APK -&gt; Share -&gt; Set General Access to <strong>"Anyone with the link can view"</strong>. Never require a Google account login.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#121422] border border-slate-800 space-y-1.5">
              <span className="font-bold text-white block">2. Virus Scan Confirmation &gt;100MB</span>
              <p className="text-[11px] text-slate-400">
                Google Drive cannot automatically scan files larger than 100MB for viruses, which presents a confirmation interstitial. Keep APKs under 100MB or test direct user downloads.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#121422] border border-slate-800 space-y-1.5">
              <span className="font-bold text-white block">3. Traffic & Quota Limits</span>
              <p className="text-[11px] text-slate-400">
                Google Drive is not a dedicated high-bandwidth CDN. If thousands of users download simultaneously, Drive may temporarily throttle downloads.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#121422] border border-slate-800 space-y-1.5">
              <span className="font-bold text-white block">4. Direct Conversion Format</span>
              <p className="text-[11px] text-slate-400 font-mono text-[10px]">
                HexOS automatically converts sharing links into:<br />
                <code className="text-cyan-400">https://drive.google.com/uc?export=download&id=FILE_ID</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: cURL & JavaScript */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* cURL */}
        <div className="p-5 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-mono uppercase">cURL Example</span>
            <button
              onClick={() => copySnippet(curlCode, 'curl')}
              className="text-slate-400 hover:text-white p-1"
            >
              {copiedKey === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <pre className="p-3 rounded-xl bg-[#08090e] border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
            {curlCode}
          </pre>
        </div>

        {/* JS */}
        <div className="p-5 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-mono uppercase">JavaScript Example</span>
            <button
              onClick={() => copySnippet(jsCode, 'js')}
              className="text-slate-400 hover:text-white p-1"
            >
              {copiedKey === 'js' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <pre className="p-3 rounded-xl bg-[#08090e] border border-slate-800 font-mono text-[11px] text-amber-300 overflow-x-auto">
            {jsCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
