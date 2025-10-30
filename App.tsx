import React, { useState, useCallback, useMemo } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SplashScreen } from './components/SplashScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { LoginScreen } from './components/LoginScreen';
import { HomeDashboard } from './components/HomeDashboard';
import { ReportIssueScreen } from './components/ReportIssueScreen';
import { ConfirmationScreen } from './components/ConfirmationScreen';
import { TrackIssuesScreen } from './components/TrackIssuesScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { FeedbackScreen } from './components/FeedbackScreen';
import { ProfileScreen } from './components/ProfileScreen';

export type Screen = 
  | 'splash' 
  | 'onboarding' 
  | 'login' 
  | 'home' 
  | 'report' 
  | 'confirmation' 
  | 'track' 
  | 'admin' 
  | 'super-admin' 
  | 'feedback' 
  | 'profile';

export type UserRole = 'citizen' | 'admin' | 'super-admin';

export type Language = 'en' | 'hi' | 'mr';

export interface AppState {
  currentScreen: Screen;
  userRole: UserRole;
  language: Language;
  isLoggedIn: boolean;
  currentIssueId?: string;
  navigationHistory: Screen[];
}

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    currentScreen: 'splash',
    userRole: 'citizen',
    language: 'en',
    isLoggedIn: false,
    navigationHistory: [],
  });

  const navigateTo = useCallback((screen: Screen, issueId?: string) => {
    setAppState(prev => {
      // Prevent navigation to same screen
      if (prev.currentScreen === screen) return prev;
      
      // Prevent adding duplicate consecutive entries and limit history size
      const newHistory = prev.currentScreen !== 'splash' 
        ? [...prev.navigationHistory.slice(-9), prev.currentScreen] // Limit to last 10 screens
        : prev.navigationHistory;
      
      return {
        ...prev,
        currentScreen: screen,
        currentIssueId: issueId,
        navigationHistory: newHistory,
      };
    });
  }, []);

  const goBack = useCallback(() => {
    setAppState(prev => {
      const newHistory = [...prev.navigationHistory];
      const previousScreen = newHistory.pop();
      
      if (previousScreen && previousScreen !== prev.currentScreen) {
        return {
          ...prev,
          currentScreen: previousScreen,
          navigationHistory: newHistory,
          currentIssueId: previousScreen === 'feedback' ? prev.currentIssueId : undefined,
        };
      }
      
      // Default fallback if no history or same screen
      const fallbackScreen = prev.isLoggedIn ? 'home' : 'login';
      return {
        ...prev,
        currentScreen: fallbackScreen,
        navigationHistory: [],
        currentIssueId: undefined,
      };
    });
  }, []);

  const setUserRole = useCallback((role: UserRole) => {
    setAppState(prev => ({ ...prev, userRole: role }));
  }, []);

  const setLanguage = useCallback((language: Language) => {
    setAppState(prev => ({ ...prev, language }));
  }, []);

  const login = useCallback((role: UserRole = 'citizen') => {
    setAppState(prev => ({
      ...prev,
      isLoggedIn: true,
      userRole: role,
      currentScreen: role === 'super-admin' ? 'super-admin' : role === 'admin' ? 'admin' : 'home',
      navigationHistory: [], // Clear history on login
    }));
  }, []);

  const currentScreen = useMemo(() => {
    switch (appState.currentScreen) {
      case 'splash':
        return <SplashScreen onComplete={() => navigateTo('onboarding')} />;
      case 'onboarding':
        return <OnboardingScreen onComplete={() => navigateTo('login')} />;
      case 'login':
        return (
          <LoginScreen
            language={appState.language}
            onLanguageChange={setLanguage}
            onLogin={login}
          />
        );
      case 'home':
        return (
          <HomeDashboard
            language={appState.language}
            onNavigate={navigateTo}
          />
        );
      case 'report':
        return (
          <ReportIssueScreen
            language={appState.language}
            onSubmit={(issueId) => navigateTo('confirmation', issueId)}
            onBack={goBack}
          />
        );
      case 'confirmation':
        return (
          <ConfirmationScreen
            issueId={appState.currentIssueId || 'NM2024001'}
            onBack={goBack}
            onTrack={() => navigateTo('track')}
          />
        );
      case 'track':
        return (
          <TrackIssuesScreen
            language={appState.language}
            onNavigate={navigateTo}
            onFeedback={(issueId) => navigateTo('feedback', issueId)}
          />
        );
      case 'admin':
        return (
          <AdminDashboard
            language={appState.language}
            onNavigate={navigateTo}
          />
        );
      case 'super-admin':
        return (
          <SuperAdminDashboard
            language={appState.language}
            onNavigate={navigateTo}
          />
        );
      case 'feedback':
        return (
          <FeedbackScreen
            issueId={appState.currentIssueId || 'NM2024001'}
            onSubmit={() => navigateTo('track')}
            onBack={goBack}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            language={appState.language}
            onLanguageChange={setLanguage}
            onBack={goBack}
          />
        );
      default:
        return <SplashScreen onComplete={() => navigateTo('onboarding')} />;
    }
  }, [appState.currentScreen, appState.language, appState.currentIssueId, navigateTo, setLanguage, login, goBack]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white overflow-hidden">
        <div className="max-w-sm mx-auto min-h-screen relative">
          <div key={appState.currentScreen}>
            {currentScreen}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
import { useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  useEffect(() => {
    async function loadReports() {
      const { data, error } = await supabase.from('reports').select('*')
      if (error) console.error(error)
      else console.log("Reports from DB:", data)
    }
    loadReports()
  }, [])

  return <h1>Hello NagarNiyantran 👋</h1>
}

export default App
