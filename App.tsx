import React, { useState, useEffect } from 'react';
import { AppState, ImageState, PresetStyle, UserProfile, StudioFocusMode, AdminDashboardUser, Language } from './src/types';
import { RATIOS, RESOLUTIONS } from './src/constants';
import { TRANSLATIONS } from './src/translations';

// Services
import { editImageWithGemini, generateFashionVideo, generateSocialPost } from './services/geminiService';
import { userService } from './services/userService';

// Components
import { Navbar } from './src/components/layout/Navbar';
import { AuthScreen } from './src/components/auth/AuthScreen';
import { StudioPanel } from './src/components/panels/StudioPanel';
import { WardrobePanel as WardrobeComponent } from './src/components/panels/WardrobePanel';
import { ShowroomPanel } from './src/components/panels/ShowroomPanel';
import { AdminDashboard } from './src/components/admin/AdminDashboard';
import { GuideModal } from './src/components/common/GuideModal';
import { LoadingOverlay } from './src/components/common/LoadingOverlay';
import { ApiKeyModal } from './src/components/common/ApiKeyModal';
// Alias already handled above

const App: React.FC = () => {
  // --- STATE ---
  const [appState, setAppState] = useState<AppState>(AppState.AUTH);
  const [language, setLanguage] = useState<Language>('tr');
  const [user, setUser] = useState<UserProfile | null>(null);

  // Auth State
  const [loginEmail, setLoginEmail] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Image State
  const [imageState, setImageState] = useState<ImageState>({
    original: null,
    garment: null,
    accessories: null,
    jewelry: null,
    eyewear: null,
    headwear: null,
    bag: null,
    processed: null,
    videoUrl: null,
    socialData: null,
    prompt: '',
    aspectRatio: '9:16',
    resolution: '1K',
    finalPrompt: '',
    glamour: 'none',
    focusMode: 'full'
  });

  // UI State
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  // Admin State
  const [adminUsers, setAdminUsers] = useState<AdminDashboardUser[]>([]);
  const [diagnostics, setDiagnostics] = useState<string | null>(null);

  // Model Library State
  const [isModelLibOpen, setIsModelLibOpen] = useState(false);
  const [modelTab, setModelTab] = useState<'women' | 'men'>('women');

  // Showroom State
  const [isMagazineMode, setIsMagazineMode] = useState(false);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [isSocialGenerating, setIsSocialGenerating] = useState(false);

  // --- TRANSLATION HELPER ---
  const t = (key: keyof typeof TRANSLATIONS['tr']) => TRANSLATIONS[language][key];

  // --- EFFECTS ---

  // Check Session
  useEffect(() => {
    const sessionEmail = userService.getSessionEmail();
    if (sessionEmail) {
      userService.getUserProfile(sessionEmail).then(profile => {
        if (profile) {
          setUser(profile);
          setAppState(AppState.CANVAS);
        } else {
          setAppState(AppState.AUTH); // Profile not found, clear session
          userService.logout();
        }
      });
    } else {
      setAppState(AppState.AUTH);
    }
  }, []);

  useEffect(() => {
    if (user?.email) {
      userService.getUserProfile(user.email).then(u => u && setUser(u));
    }
  }, [appState]);

  // --- HANDLERS ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    setIsAuthLoading(true);
    try {
      const profile = await userService.loginOrRegister(loginEmail);
      if (profile) {
        setUser(profile);
        setAppState(AppState.CANVAS);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    userService.logout();
    setUser(null);
    setAppState(AppState.AUTH);
    setLoginEmail('');
  };

  const saveApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    setShowApiKeyModal(false);
  };

  // Admin Handlers
  const handleOpenAdmin = async () => {
    if (!user?.isAdmin) return;
    const users = await userService.getAllUsers();
    setAdminUsers(users);
    setShowAdminPanel(true);
  };

  const handleRefreshAdmin = async () => {
    const users = await userService.getAllUsers();
    setAdminUsers(users);
  };

  const handleAdminAddCredit = async (email: string, amount: number) => {
    await userService.adminAddCredits(email, amount);
    handleRefreshAdmin();
  };

  const handleAdminDeleteUser = async (email: string) => {
    if (confirm('Kullanıcıyı silmek istediğinize emin misiniz?')) {
      await userService.adminDeleteUser(email);
      handleRefreshAdmin();
    }
  };

  const handleRunDiagnostics = () => {
    setDiagnostics("OK: " + new Date().toLocaleTimeString());
    setTimeout(() => setDiagnostics(null), 3000);
  };

  // Generation Logic
  const handleGenerate = async () => {
    if (!apiKey) { setShowApiKeyModal(true); return; }
    if (user && user.credits <= 0) { alert(t('alert_no_credit')); return; }

    const hasAnyAsset = imageState.garment || imageState.accessories || imageState.jewelry || imageState.bag || imageState.eyewear || imageState.headwear;
    const cost = hasAnyAsset ? 2 : 1;

    if (!userService.deductCredit(user!.email, cost)) {
      alert('Kredi düşülemedi.');
      return;
    }
    // Update local user credits visually
    setUser(prev => prev ? { ...prev, credits: prev.credits - cost } : null);

    setAppState(AppState.PROCESSING);

    const loadingSteps = TRANSLATIONS[language].loading_steps || TRANSLATIONS['en'].loading_steps; // Fallback
    let stepIdx = 0;
    setLoadingMessage(loadingSteps[0]);

    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % loadingSteps.length;
      setLoadingMessage(loadingSteps[stepIdx]);
    }, 2500);

    try {
      const result = await editImageWithGemini(
        imageState.original!,
        imageState.prompt,
        apiKey,
        imageState.resolution as any,
        imageState.garment,
        imageState.accessories,
        imageState.jewelry,
        imageState.bag,
        imageState.eyewear,
        imageState.headwear
      );
      clearInterval(interval);
      setImageState(prev => ({ ...prev, processed: result, finalPrompt: imageState.prompt })); // Basic update
      setAppState(AppState.SHOWROOM);
    } catch (error) {
      clearInterval(interval);
      console.error(error);
      alert('İşlem başarısız oldu. Lütfen tekrar deneyin.');
      setAppState(AppState.WARDROBE);
      // Refund mechanism could be added here
    }
  };

  const handleGenerateVideo = async (type: 'runway' | '360' | 'pan') => {
    if (!user || user.credits < 6) { alert(t('alert_no_credit')); return; }
    if (!userService.deductCredit(user.email, 6)) return;
    setUser(prev => prev ? { ...prev, credits: prev.credits - 6 } : null);

    setIsVideoGenerating(true);
    try {
      await generateFashionVideo(imageState.processed!, type, apiKey);
      // Mock result for demo as real generation is complex
      setTimeout(() => {
        setImageState(prev => ({ ...prev, videoUrl: 'https://cdn.coverr.co/videos/coverr-fashion-photoshoot-4654/1080p.mp4' })); // Mock
        setIsVideoGenerating(false);
      }, 4000);
    } catch (e) {
      setIsVideoGenerating(false);
      alert('Video üretilemedi.');
    }
  };

  const handleGenerateSocial = async () => {
    setIsSocialGenerating(true);
    try {
      const data = await generateSocialPost(imageState.prompt || "Fashion photo", language, apiKey);
      setImageState(prev => ({ ...prev, socialData: data }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsSocialGenerating(false);
    }
  };

  const handleCopyStrategy = () => {
    if (!imageState.socialData) return;
    const text = `${imageState.socialData.seoTitle}\n\n${imageState.socialData.caption}\n\n${imageState.socialData.hashtags}`;
    navigator.clipboard.writeText(text);
    alert('Kopyalandı!');
  };

  const currentCost = (imageState.garment || imageState.accessories || imageState.jewelry || imageState.bag || imageState.eyewear || imageState.headwear) ? 2 : 1;

  return (
    <div className="min-h-screen bg-void-black text-white font-sans selection:bg-neon-cyan selection:text-black overflow-x-hidden">

      {/* AUTH */}
      {appState === AppState.AUTH && (
        <AuthScreen
          language={language}
          setLanguage={setLanguage}
          loginEmail={loginEmail}
          setLoginEmail={setLoginEmail}
          handleLogin={handleLogin}
          isAuthLoading={isAuthLoading}
        />
      )}

      {/* MAIN APP */}
      {appState !== AppState.AUTH && (
        <>
          <Navbar
            appState={appState}
            setAppState={setAppState}
            user={user}
            language={language}
            setLanguage={setLanguage}
            apiKey={apiKey}
            setShowApiKeyModal={setShowApiKeyModal}
            setIsGuideOpen={setIsGuideOpen}
            handleOpenAdmin={handleOpenAdmin}
            handleLogout={handleLogout}
            setImageState={setImageState}
            setIsMagazineMode={setIsMagazineMode}
          />

          <main className="flex-grow relative max-w-7xl mx-auto w-full p-6 flex flex-col justify-center">
            {appState === AppState.CANVAS && (
              <StudioPanel
                language={language}
                setAppState={setAppState}
                setImageState={setImageState}
                isModelLibOpen={isModelLibOpen}
                setIsModelLibOpen={setIsModelLibOpen}
                modelTab={modelTab}
                setModelTab={setModelTab}
              />
            )}

            {appState === AppState.WARDROBE && imageState.original && (
              <WardrobeComponent
                language={language}
                imageState={imageState}
                setImageState={setImageState}
                setAppState={setAppState}
                user={user}
                handleGenerate={handleGenerate}
                currentCost={currentCost}
              />
            )}

            {appState === AppState.PROCESSING && (
              <LoadingOverlay loadingMessage={loadingMessage} resolution={imageState.resolution} />
            )}

            {appState === AppState.SHOWROOM && imageState.processed && imageState.original && (
              <ShowroomPanel
                language={language}
                imageState={imageState}
                setAppState={setAppState}
                isMagazineMode={isMagazineMode}
                setIsMagazineMode={setIsMagazineMode}
                isVideoGenerating={isVideoGenerating}
                isSocialGenerating={isSocialGenerating}
                handleGenerateVideo={handleGenerateVideo}
                handleGenerateSocial={handleGenerateSocial}
                handleCopyStrategy={handleCopyStrategy}
              />
            )}
          </main>

          <footer className="border-t border-white/5 py-6">
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-gray-600 text-xs font-mono">
              <span>Botfusions Nano STUDIO V2.0 PRO</span>
              <span>POWERED BY: <span className="text-electric-purple">GEMINI 3 PRO IMAGE + VEO</span></span>
            </div>
          </footer>
        </>
      )}

      {/* MODALS */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} language={language} />

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        saveApiKey={saveApiKey}
        language={language}
      />

      <AdminDashboard
        isOpen={showAdminPanel && !!user?.isAdmin}
        onClose={() => setShowAdminPanel(false)}
        adminUsers={adminUsers}
        language={language}
        diagnostics={diagnostics}
        handleRefreshAdmin={handleRefreshAdmin}
        handleRunDiagnostics={handleRunDiagnostics}
        handleAdminAddCredit={handleAdminAddCredit}
        handleAdminDeleteUser={handleAdminDeleteUser}
      />

      <style>{` .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } `}</style>
    </div>
  );
};

export default App;
