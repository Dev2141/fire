import React, { useState, useEffect, lazy, Suspense } from 'react';
import { ScreenTab, ThermalEpisode, IndustrialFacility, AnalystUser } from './types';
import { CURRENT_ANALYST } from './data/generatedData';
import { Header } from './components/Header';
import { DispatchAlertModal } from './components/DispatchAlertModal';

// Lazy-load all heavy screens — each only loads when first visited
const MapDashboardScreen = lazy(() => import('./components/MapDashboardScreen').then(m => ({ default: m.MapDashboardScreen })));
const ReviewQueueScreen = lazy(() => import('./components/ReviewQueueScreen').then(m => ({ default: m.ReviewQueueScreen })));
const EpisodesTableScreen = lazy(() => import('./components/EpisodesTableScreen').then(m => ({ default: m.EpisodesTableScreen })));
const FacilitiesDirectoryScreen = lazy(() => import('./components/FacilitiesDirectoryScreen').then(m => ({ default: m.FacilitiesDirectoryScreen })));
const AnalyticsTrendsScreen = lazy(() => import('./components/AnalyticsTrendsScreen').then(m => ({ default: m.AnalyticsTrendsScreen })));
const AuthScreen = lazy(() => import('./components/AuthScreen').then(m => ({ default: m.AuthScreen })));
const LoginModal = lazy(() => import('./components/LoginModal').then(m => ({ default: m.LoginModal })));
const SearchModal = lazy(() => import('./components/SearchModal').then(m => ({ default: m.SearchModal })));

const API = 'http://localhost:3001/api';

const LoadingScreen = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-[#ff6b00] border-t-transparent rounded-full animate-spin" />
      <span className="text-[#a98a7d] text-xs font-mono tracking-wider">LOADING MODULE...</span>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<ScreenTab>('review');
  const [episodes, setEpisodes] = useState<ThermalEpisode[]>([]);
  const [facilities, setFacilities] = useState<IndustrialFacility[]>([]);
  const [analyst, setAnalyst] = useState<AnalystUser>(CURRENT_ANALYST);
  const [isLoading, setIsLoading] = useState(true);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [dispatchModalData, setDispatchModalData] = useState<{
    isOpen: boolean;
    episode: ThermalEpisode | null;
    classification: string;
    confidence: number;
  }>({ isOpen: false, episode: null, classification: '', confidence: 95 });

  // Fetch initial data from the backend API
  useEffect(() => {
    const load = async () => {
      try {
        const [firesRes, facsRes] = await Promise.all([
          fetch(`${API}/fires?limit=200`),
          fetch(`${API}/facilities?limit=208`),
        ]);

        if (firesRes.ok) {
          const data = await firesRes.json();
          // Map API response to ThermalEpisode shape
          const eps: ThermalEpisode[] = data.items.map((f: any) => ({
            id: f.id,
            title: f.title,
            districtState: f.state || 'Southern Zone',
            coordinates: {
              lat: f.lat,
              lng: f.lng,
              latStr: `${f.lat.toFixed(4)}° N`,
              lngStr: `${f.lng.toFixed(4)}° E`,
            },
            sensorPlatform: f.satellite || 'VIIRS SNPP',
            firstDetectedUtc: `${f.acq_date} UTC`,
            timelineAge: 'Active (Recent)',
            relativeTime: 'Recent',
            radiantHeatMw: f.frp,
            frpPeakMw: f.frp,
            mlInference: f.classification.toUpperCase(),
            confidence: f.confidence,
            riskLevel: f.risk,
            urgencyTier: f.risk === 'CRITICAL' ? 'TIER 1 - IMMEDIATE' : f.risk === 'HIGH' ? 'TIER 2 - PRIORITY' : 'ROUTINE',
            ppacProximityKm: f.dist_km,
            status: 'AWAITING VERIFICATION',
            groundTruthClassification: undefined,
            topoData: {
              frontAdvance: 'N/A',
              perimeter: `${f.dist_km} km`,
              elevation: 'Unknown',
              landCoverMatrix: `Dominant: ${f.lulc_dominant}`,
              flameFrontWidth: 'N/A',
              imageUrl: '',
            },
            thermalData: {
              temperatureRange: 'SLSTR TIR',
              contrast: `${f.frp} MW`,
              facilityBufferCheck: `${f.dist_km} km`,
              imageUrl: '',
            },
            lulcData: {
              dominantClass: f.lulc_dominant,
              cropsPct: f.lulc_crops,
              treesPct: f.lulc_trees,
              urbanPct: f.lulc_urban,
              rangelandPct: f.lulc_rangeland,
            },
          }));
          setEpisodes(eps);
        }

        if (facsRes.ok) {
          const data = await facsRes.json();
          const facs: IndustrialFacility[] = data.items.map((f: any) => ({
            id: f.id,
            name: f.name,
            shortName: f.name.substring(0, 30),
            category: f.type?.includes('thermal') || f.type?.includes('power') ? 'Thermal' : 'Refineries',
            stateZone: f.state,
            district: f.district,
            coordinates: {
              lat: f.lat,
              lng: f.lng,
              latStr: `${f.lat.toFixed(4)}° N`,
              lngStr: `${f.lng.toFixed(4)}° E`,
            },
            bufferRadiusKm: 5.0,
            status: f.status,
            linkedEpisodesCount: f.fire_count,
            baselineOperatingMw: 100,
            peakFrp12mMw: f.avg_frp,
            nominalFrpCapMw: 200,
            registeredStacks: 'Unknown',
            bufferOverlaps: `Risk Score: ${f.risk_score}`,
            satelliteFeed: { orbitPass: '12:00 UTC', fov: '5.0 KM²', target: 'MAIN', coreTemp: 'N/A', sensor: 'VIIRS', calibration: 'STD', imageUrl: '' },
            cctvFeed: { title: 'GROUND TRUTH', exceedanceStatus: f.status, flameVelocity: 'N/A', stackHeight: 'N/A', analytics: 'Risk Engine', plumeDispersion: 'N/A', imageUrl: '' },
            monthlyFRP: [],
            recentDetections: [],
          }));
          setFacilities(facs);
        }
      } catch (err) {
        console.warn('API server not reachable, using empty data. Run: npm run server');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleConfirmEpisode = (id: string, classification: string, confidence: number, notes: string, directAlert: boolean) => {
    const ep = episodes.find((e) => e.id === id);
    if (!ep) return;
    setEpisodes((prev) =>
      prev.map((e) => e.id === id ? { ...e, status: 'CONFIRMED', groundTruthClassification: classification, confidence, notes, directAlertSent: directAlert } : e)
    );
    if (directAlert) {
      setDispatchModalData({ isOpen: true, episode: ep, classification, confidence });
    }
  };

  const handleRejectGlint = (id: string) => {
    setEpisodes((prev) =>
      prev.map((e) => e.id === id ? { ...e, status: 'REJECTED_GLINT', confidence: 5, mlInference: 'Solar Glint (Rejected)' } : e)
    );
  };

  const handleRequestSecondReview = (id: string) => {
    alert(`Episode ${id} escalated to Senior Imagery Specialist.`);
  };

  const handleSelectEpisodeToReview = (_id: string) => setActiveTab('review');
  const handleSelectEpisodeForMap = (_id: string) => setActiveTab('map');
  const handleOpenFacilityDossier = (_facilityId?: string) => setActiveTab('facilities');
  const pendingReviewCount = episodes.filter((e) => e.status === 'AWAITING VERIFICATION').length;

  return (
    <div className="min-h-screen bg-[#10141a] text-[#dfe2eb] flex flex-col antialiased selection:bg-[#ff6b00] selection:text-white">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        reviewCount={pendingReviewCount}
        analyst={analyst}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      <main className="flex-1 w-full pb-12">
        {isLoading ? (
          <LoadingScreen />
        ) : (
          <Suspense fallback={<LoadingScreen />}>
            {activeTab === 'auth' && (
              <AuthScreen
                currentAnalyst={analyst}
                onLoginSuccess={(a) => setAnalyst(a)}
                onNavigateToConsole={(tab) => setActiveTab(tab || 'review')}
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
          </Suspense>
        )}
      </main>

      <Suspense fallback={null}>
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          episodes={episodes}
          facilities={facilities}
          onSelectEpisode={handleSelectEpisodeToReview}
          onSelectFacility={handleOpenFacilityDossier}
          setActiveTab={setActiveTab}
        />
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          currentAnalyst={analyst}
          onLoginSuccess={(a) => setAnalyst(a)}
        />
      </Suspense>

      <DispatchAlertModal
        isOpen={dispatchModalData.isOpen}
        onClose={() => setDispatchModalData((p) => ({ ...p, isOpen: false }))}
        episode={dispatchModalData.episode}
        classification={dispatchModalData.classification}
        confidence={dispatchModalData.confidence}
      />
    </div>
  );
}
