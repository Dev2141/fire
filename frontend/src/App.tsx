import React, { useState } from 'react';
import { ScreenTab, ThermalEpisode, IndustrialFacility, AnalystUser } from './types';
import { INITIAL_EPISODES, INITIAL_FACILITIES, CURRENT_ANALYST } from './data/generatedData';
import { Header } from './components/Header';
import { MapDashboardScreen } from './components/MapDashboardScreen';
import { ReviewQueueScreen } from './components/ReviewQueueScreen';
import { EpisodesTableScreen } from './components/EpisodesTableScreen';
import { FacilitiesDirectoryScreen } from './components/FacilitiesDirectoryScreen';
import { AnalyticsTrendsScreen } from './components/AnalyticsTrendsScreen';
import { AuthScreen } from './components/AuthScreen';
import { LoginModal } from './components/LoginModal';
import { SearchModal } from './components/SearchModal';
import { DispatchAlertModal } from './components/DispatchAlertModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ScreenTab>('review');
  const [episodes, setEpisodes] = useState<ThermalEpisode[]>(INITIAL_EPISODES);
  const [facilities, setFacilities] = useState<IndustrialFacility[]>(INITIAL_FACILITIES);
  const [analyst, setAnalyst] = useState<AnalystUser>(CURRENT_ANALYST);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [dispatchModalData, setDispatchModalData] = useState<{
    isOpen: boolean;
    episode: ThermalEpisode | null;
    classification: string;
    confidence: number;
  }>({
    isOpen: false,
    episode: null,
    classification: '',
    confidence: 95,
  });

  // Action handlers
  const handleConfirmEpisode = (
    id: string,
    classification: string,
    confidence: number,
    notes: string,
    directAlert: boolean
  ) => {
    const ep = episodes.find((e) => e.id === id);
    if (!ep) return;

    setEpisodes((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: 'CONFIRMED',
              groundTruthClassification: classification,
              confidence,
              notes,
              directAlertSent: directAlert,
            }
          : e
      )
    );

    if (directAlert) {
      setDispatchModalData({
        isOpen: true,
        episode: ep,
        classification,
        confidence,
      });
    } else {
      alert(`Episode ${id} verified and classified as "${classification}" by ${analyst.name}.`);
    }
  };

  const handleRejectGlint = (id: string) => {
    setEpisodes((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: 'REJECTED_GLINT',
              confidence: 5,
              mlInference: 'Solar Glint (Rejected)',
            }
          : e
      )
    );
    alert(`Episode ${id} rejected as sensor glint / solar artifact. Telemetry masked.`);
  };

  const handleRequestSecondReview = (id: string) => {
    alert(`Episode ${id} escalated to Senior Imagery Specialist for secondary validation.`);
  };

  const handleSelectEpisodeToReview = (id: string) => {
    setActiveTab('review');
  };

  const handleSelectEpisodeForMap = (id: string) => {
    setActiveTab('map');
  };

  const handleOpenFacilityDossier = (facilityId?: string) => {
    setActiveTab('facilities');
  };

  const pendingReviewCount = episodes.filter((e) => e.status === 'AWAITING VERIFICATION').length;

  return (
    <div className="min-h-screen bg-[#10141a] text-[#dfe2eb] flex flex-col antialiased selection:bg-[#ff6b00] selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        reviewCount={pendingReviewCount}
        analyst={analyst}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1 w-full pb-12">
        {activeTab === 'auth' && (
          <AuthScreen
            currentAnalyst={analyst}
            onLoginSuccess={(newAnalyst) => {
              setAnalyst(newAnalyst);
            }}
            onNavigateToConsole={(tab) => {
              setActiveTab(tab || 'review');
            }}
          />
        )}

        {activeTab === 'review' && (
          <ReviewQueueScreen
            episodes={episodes}
            onConfirmEpisode={handleConfirmEpisode}
            onRejectGlint={handleRejectGlint}
            onRequestSecondReview={handleRequestSecondReview}
            onSelectEpisodeForMap={handleSelectEpisodeForMap}
          />
        )}

        {activeTab === 'episodes' && (
          <EpisodesTableScreen
            episodes={episodes}
            onSelectEpisodeToReview={handleSelectEpisodeToReview}
            onSelectEpisodeForMap={handleSelectEpisodeForMap}
          />
        )}

        {activeTab === 'facilities' && (
          <FacilitiesDirectoryScreen
            facilities={facilities}
            onInspectEpisode={handleSelectEpisodeToReview}
            onOpenMapForFacility={handleSelectEpisodeForMap}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTrendsScreen
            onOpenReviewQueue={() => setActiveTab('review')}
            onInspectEpisode={handleSelectEpisodeToReview}
          />
        )}

        {activeTab === 'map' && (
          <MapDashboardScreen
            onSelectEpisodeToReview={handleSelectEpisodeToReview}
            onOpenFacilityDossier={handleOpenFacilityDossier}
          />
        )}
      </main>

      {/* Quick Search Modal (⌘K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        episodes={episodes}
        facilities={facilities}
        onSelectEpisode={handleSelectEpisodeToReview}
        onSelectFacility={handleOpenFacilityDossier}
        setActiveTab={setActiveTab}
      />

      {/* Analyst Access Login / Switch Profile Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        currentAnalyst={analyst}
        onLoginSuccess={(newAnalyst) => setAnalyst(newAnalyst)}
      />

      {/* Emergency Disaster Dispatch Broadcast Modal */}
      <DispatchAlertModal
        isOpen={dispatchModalData.isOpen}
        onClose={() => setDispatchModalData((prev) => ({ ...prev, isOpen: false }))}
        episode={dispatchModalData.episode}
        classification={dispatchModalData.classification}
        confidence={dispatchModalData.confidence}
      />
    </div>
  );
}
