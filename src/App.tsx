import React, { useState } from 'react';
import { AppRecord, SiteSettings, ActivityEvent, ReleaseInfo } from './types';
import {
  getStoredApps,
  saveApps,
  getStoredSettings,
  saveSettings,
  getStoredActivity,
  logActivity,
  resetToCleanSlate,
  loadSampleDemoApps,
  rollbackAppRelease
} from './utils/storage';
import { isAuthenticated, logout } from './utils/auth';
import { ToastProvider, useToast } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { LoginScreen } from './components/LoginScreen';
import { DashboardPage } from './pages/DashboardPage';
import { AppsPage } from './pages/AppsPage';
import { AddAppPage } from './pages/AddAppPage';
import { ReleasesPage } from './pages/ReleasesPage';
import { CreateReleasePage } from './pages/CreateReleasePage';
import { UpdateUrlsPage } from './pages/UpdateUrlsPage';
import { ApiTesterPage } from './pages/ApiTesterPage';
import { DocsPage } from './pages/DocsPage';
import { ActivityPage } from './pages/ActivityPage';
import { SettingsPage } from './pages/SettingsPage';
import { PublicAppPage } from './pages/PublicAppPage';
import { GitHubExportModal } from './components/GitHubExportModal';
import { JsonViewerModal } from './components/JsonViewerModal';
import { AppManageModal } from './components/AppManageModal';

function AppContent() {
  const { showToast } = useToast();

  // Authentication State: Strict mode — requires password every single time the site is opened
  const [isAuth, setIsAuth] = useState(false);

  const [apps, setApps] = useState<AppRecord[]>(getStoredApps);
  const [settings, setSettings] = useState<SiteSettings>(getStoredSettings);
  const [activity, setActivity] = useState<ActivityEvent[]>(getStoredActivity);

  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Modals state
  const [managingApp, setManagingApp] = useState<AppRecord | null>(null);
  const [releaseTargetApp, setReleaseTargetApp] = useState<AppRecord | null>(null);
  const [isGitHubExportOpen, setIsGitHubExportOpen] = useState(false);
  const [jsonViewerState, setJsonViewerState] = useState<{
    isOpen: boolean;
    title: string;
    data: any;
    filename?: string;
  }>({
    isOpen: false,
    title: '',
    data: null,
  });

  // Public app page view mode (e.g. /apps/com.hexos.zyra)
  const [publicViewPackage, setPublicViewPackage] = useState<string | null>(null);

  // Sync state changes with persistence
  const updateAppsList = (newApps: AppRecord[]) => {
    setApps(newApps);
    saveApps(newApps);
  };

  const updateSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleLogout = () => {
    logout();
    setIsAuth(false);
    showToast({ type: 'info', title: 'Logged Out', message: 'Admin session closed.' });
  };

  // Rollback release handler
  const handleRollback = (packageName: string, releaseId: string, version: string) => {
    const confirmed = window.confirm(
      `Rollback ${packageName} to v${version}?\n\nThe permanent update endpoint will immediately serve this version. Newer releases remain safely archived in history.`
    );
    if (!confirmed) return;

    const res = rollbackAppRelease(packageName, releaseId);
    if (res.success) {
      setApps(getStoredApps());
      setActivity(getStoredActivity());
      showToast({
        type: 'success',
        title: 'Rollback Completed Successfully',
        message: `Permanent endpoint now points to v${version}.`
      });
    } else {
      showToast({ type: 'error', title: 'Rollback Failed', message: res.message });
    }
  };

  // Save new release
  const handleSaveRelease = (packageName: string, newRelease: ReleaseInfo, makeActive: boolean) => {
    const updatedApps = apps.map(app => {
      if (app.packageName !== packageName) return app;

      const updatedReleases = makeActive
        ? app.releases.map(r => ({ ...r, isCurrentActive: false }))
        : [...app.releases];

      return {
        ...app,
        currentVersion: makeActive ? newRelease.version : app.currentVersion,
        currentVersionCode: makeActive ? newRelease.versionCode : app.currentVersionCode,
        updatedAt: new Date().toISOString().split('T')[0],
        totalReleases: app.totalReleases + 1,
        releases: [newRelease, ...updatedReleases]
      };
    });

    updateAppsList(updatedApps);

    logActivity({
      type: makeActive ? 'release_published' : 'release_draft',
      title: `${newRelease.version} ${makeActive ? 'Published' : 'Draft Saved'} for ${packageName}`,
      description: `Targeting APK source ${newRelease.apkSource} (versionCode: ${newRelease.versionCode})`,
      packageName,
      version: newRelease.version,
      versionCode: newRelease.versionCode,
    });
    setActivity(getStoredActivity());

    showToast({
      type: 'success',
      title: makeActive ? 'Release Published Successfully!' : 'Release Draft Saved',
      message: `Permanent endpoint /api/${packageName}.json updated.`
    });

    setReleaseTargetApp(null);
    setCurrentTab('releases');
  };

  // Add new app
  const handleSaveApp = (newApp: AppRecord) => {
    const updated = [newApp, ...apps];
    updateAppsList(updated);

    logActivity({
      type: 'app_created',
      title: `App Registered: ${newApp.name}`,
      description: `Permanent endpoint /api/${newApp.packageName}.json created.`,
      packageName: newApp.packageName,
      version: newApp.currentVersion,
      versionCode: newApp.currentVersionCode,
    });
    setActivity(getStoredActivity());

    setCurrentTab('apps');
  };

  // Reset to clean slate (0 apps)
  const handleResetCleanSlate = () => {
    resetToCleanSlate();
    setApps([]);
    setActivity([]);
  };

  // Optional Load Sample Demo Apps
  const handleLoadDemoApps = () => {
    const loaded = loadSampleDemoApps();
    setApps(loaded);
  };

  // Public App Page (doesn't require password, allowing public download)
  if (publicViewPackage) {
    const publicApp = apps.find(a => a.packageName === publicViewPackage);
    if (publicApp) {
      return (
        <PublicAppPage
          app={publicApp}
          onBack={() => setPublicViewPackage(null)}
        />
      );
    }
  }

  // Password Lock Screen: If not logged in, prompt for admin password
  if (!isAuth) {
    return <LoginScreen onLoginSuccess={() => setIsAuth(true)} />;
  }

  // All total releases count
  const totalReleasesCount = apps.reduce((acc, a) => acc + a.releases.length, 0);

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        searchQuery={globalSearch}
        onSearchChange={(q) => {
          setGlobalSearch(q);
          if (q.trim() && currentTab !== 'apps') {
            setCurrentTab('apps');
          }
        }}
        onOpenDocs={() => setCurrentTab('docs')}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex w-full">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setReleaseTargetApp(null);
          }}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          appsCount={apps.length}
          releasesCount={totalReleasesCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
          {currentTab === 'dashboard' && (
            <DashboardPage
              apps={apps}
              settings={settings}
              onNavigate={setCurrentTab}
              onSelectApp={(app) => {
                setManagingApp(app);
              }}
              onRollback={handleRollback}
              onViewJson={(rel) => {
                setJsonViewerState({
                  isOpen: true,
                  title: `${rel.appPackageName} v${rel.version}`,
                  data: rel,
                  filename: `${rel.appPackageName}-${rel.version}.json`
                });
              }}
              onExportGitHub={() => setIsGitHubExportOpen(true)}
            />
          )}

          {currentTab === 'apps' && (
            <AppsPage
              apps={apps}
              apiBaseUrl={settings.apiBaseUrl}
              onNavigate={setCurrentTab}
              onManageApp={(app) => setManagingApp(app)}
              onNewReleaseForApp={(app) => {
                setReleaseTargetApp(app);
                setCurrentTab('create-release');
              }}
              onViewPublic={(pkg) => setPublicViewPackage(pkg)}
            />
          )}

          {currentTab === 'create-release' && (
            <CreateReleasePage
              apps={apps}
              initialApp={releaseTargetApp}
              onSaveRelease={handleSaveRelease}
              onCancel={() => setCurrentTab('releases')}
            />
          )}

          {currentTab === 'add-app' && (
            <AddAppPage
              apiBaseUrl={settings.apiBaseUrl}
              onSaveApp={handleSaveApp}
              onCancel={() => setCurrentTab('apps')}
              onViewPublic={(pkg) => setPublicViewPackage(pkg)}
            />
          )}

          {currentTab === 'releases' && (
            <ReleasesPage
              apps={apps}
              onNavigate={setCurrentTab}
              onRollback={handleRollback}
              onViewJson={(rel) => {
                setJsonViewerState({
                  isOpen: true,
                  title: `${rel.appPackageName} v${rel.version}`,
                  data: rel,
                  filename: `${rel.appPackageName}-${rel.version}.json`
                });
              }}
              onNewRelease={(app) => {
                setReleaseTargetApp(app || null);
                setCurrentTab('create-release');
              }}
            />
          )}

          {currentTab === 'update-urls' && (
            <UpdateUrlsPage
              apps={apps}
              settings={settings}
              onViewJson={(payload) => {
                setJsonViewerState({
                  isOpen: true,
                  title: `Permanent JSON Payload: ${payload.app.packageName}`,
                  data: payload,
                  filename: `${payload.app.packageName}.json`
                });
              }}
            />
          )}

          {currentTab === 'api-tester' && (
            <ApiTesterPage
              apps={apps}
              apiBaseUrl={settings.apiBaseUrl}
            />
          )}

          {currentTab === 'docs' && <DocsPage apiBaseUrl={settings.apiBaseUrl} />}

          {currentTab === 'activity' && (
            <ActivityPage
              activity={activity}
              onClearActivity={() => {
                resetToCleanSlate();
                setActivity([]);
              }}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              settings={settings}
              apps={apps}
              onSaveSettings={updateSettings}
              onResetCleanSlate={handleResetCleanSlate}
              onLoadDemoApps={handleLoadDemoApps}
              onImportData={(imported) => {
                updateAppsList(imported);
                setActivity(getStoredActivity());
              }}
            />
          )}
        </main>
      </div>

      {/* GitHub Repository Exporter Modal */}
      <GitHubExportModal
        isOpen={isGitHubExportOpen}
        onClose={() => setIsGitHubExportOpen(false)}
        apps={apps}
      />

      {/* App Details / Manage Modal */}
      <AppManageModal
        isOpen={!!managingApp}
        onClose={() => setManagingApp(null)}
        app={managingApp}
        onUpdateApp={(updated) => {
          const newApps = apps.map(a => a.packageName === updated.packageName ? updated : a);
          updateAppsList(newApps);
        }}
        onDeleteApp={(pkg) => {
          const newApps = apps.filter(a => a.packageName !== pkg);
          updateAppsList(newApps);
        }}
        onRollback={handleRollback}
      />

      {/* JSON Viewer Modal */}
      <JsonViewerModal
        isOpen={jsonViewerState.isOpen}
        onClose={() => setJsonViewerState(prev => ({ ...prev, isOpen: false }))}
        title={jsonViewerState.title}
        data={jsonViewerState.data}
        filename={jsonViewerState.filename}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
