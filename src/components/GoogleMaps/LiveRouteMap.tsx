import React, { useState, useCallback } from 'react';
import { APIProvider, Map, Marker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { Plus, Minus, X, User, Phone, FileText, Gauge, Activity } from 'lucide-react';
import { TransportRoute } from '../../types';

interface LiveRouteMapProps {
  routes: TransportRoute[];
  onNavigate: (page: string) => void;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Default center (adjust to your location)
const DEFAULT_CENTER = { lat: -1.286389, lng: 36.817223 }; // Nairobi, Kenya

const MapControls = ({ onZoomIn, onZoomOut }: { onZoomIn: () => void; onZoomOut: () => void }) => {
  return (
    <div className="absolute top-8 right-8 flex flex-col gap-3 z-10">
      <button 
        onClick={onZoomIn}
        className="w-12 h-12 bg-white rounded-2xl shadow-float text-gray-600 hover:text-brand-black hover:scale-105 transition-all flex items-center justify-center"
      >
        <Plus size={20}/>
      </button>
      <button 
        onClick={onZoomOut}
        className="w-12 h-12 bg-white rounded-2xl shadow-float text-gray-600 hover:text-brand-black hover:scale-105 transition-all flex items-center justify-center"
      >
        <Minus size={20}/>
      </button>
    </div>
  );
};

const MapLegend = () => {
  return (
    <div className="absolute bottom-8 left-8 bg-white/80 backdrop-blur-xl px-2 py-2 rounded-full shadow-float border border-white flex gap-4 items-center z-10">
      <div className="flex items-center gap-2 px-3">
        <div className="w-2 h-2 rounded-full bg-[#1fd701] shadow-[0_0_10px_#1fd701]"></div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Normal</span>
      </div>
      <div className="flex items-center gap-2 px-3">
        <div className="w-2 h-2 rounded-full bg-[#ff9d00]"></div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Delay</span>
      </div>
      <div className="flex items-center gap-2 px-3">
        <div className="w-2 h-2 rounded-full bg-[#FF6106]"></div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Alert</span>
      </div>
    </div>
  );
};

const RouteDetailsPanel = ({ 
  route, 
  onClose 
}: { 
  route: TransportRoute | null; 
  onClose: () => void;
}) => {
  if (!route) return null;

  return (
    <div className={`
      absolute top-4 bottom-4 right-4 w-96 bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white z-20
      transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col overflow-hidden
      translate-x-0
    `}>
      <div className="p-8 pb-4 flex justify-between items-start bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
        <div>
          <h3 className="font-bold text-2xl text-brand-black">{route.name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
              route.health === 'NORMAL' 
                ? 'bg-green-50 text-green-600 border-green-100' 
                : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
              {route.health}
            </span>
            <span className="text-xs text-gray-400 font-mono">{route.vehiclePlate}</span>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-100 transition-colors"
        >
          <X size={16}/>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Driver Card */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-brand-black shadow-sm">
            <User size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Driver</p>
            <p className="font-bold text-brand-black">James Wilson</p>
            <div className="flex gap-2 mt-1">
              <button className="p-1.5 rounded-full bg-white text-gray-500 hover:text-brand-black shadow-sm transition-all">
                <Phone size={10} />
              </button>
              <button className="p-1.5 rounded-full bg-white text-gray-500 hover:text-brand-black shadow-sm transition-all">
                <FileText size={10} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#bda8ff]/5 border border-[#bda8ff]/20">
            <Gauge size={20} className="text-brand-lilac mb-2" />
            <p className="text-2xl font-bold text-brand-black">45 <span className="text-xs text-gray-400 font-medium">km/h</span></p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg Speed</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#1fd701]/5 border border-[#1fd701]/20">
            <Activity size={20} className="text-[#1fd701] mb-2" />
            <p className="text-2xl font-bold text-brand-black">98%</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Efficiency</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const LiveRouteMapInner = ({ routes }: { routes: TransportRoute[] }) => {
  const map = useMap();
  const [selectedRoute, setSelectedRoute] = useState<TransportRoute | null>(null);

  const handleZoomIn = useCallback(() => {
    if (map) {
      const currentZoom = map.getZoom() || 12;
      map.setZoom(currentZoom + 1);
    }
  }, [map]);

  const handleZoomOut = useCallback(() => {
    if (map) {
      const currentZoom = map.getZoom() || 12;
      map.setZoom(currentZoom - 1);
    }
  }, [map]);

  // Mock positions for routes (in production, these would come from GPS data)
  const getRoutePosition = (index: number) => {
    const basePositions = [
      { lat: -1.286389, lng: 36.817223 },  // Position 1
      { lat: -1.291444, lng: 36.825111 },  // Position 2
      { lat: -1.278333, lng: 36.812222 },  // Position 3
    ];
    return basePositions[index % basePositions.length] || basePositions[0];
  };

  const getMarkerColor = (health: string) => {
    switch (health) {
      case 'NORMAL': return '#1fd701';
      case 'DELAYED': return '#ff9d00';
      case 'ALERT': return '#FF6106';
      default: return '#1fd701';
    }
  };

  return (
    <>
      <MapControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
      <MapLegend />
      <RouteDetailsPanel route={selectedRoute} onClose={() => setSelectedRoute(null)} />

      {/* Markers for active routes */}
      {routes.slice(0, 3).map((route, index) => {
        const position = getRoutePosition(index);
        const color = getMarkerColor(route.health);
        
        return (
          <Marker
            key={route.id}
            position={position}
            onClick={() => setSelectedRoute(route)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: color,
              fillOpacity: 0.9,
              strokeColor: '#ffffff',
              strokeWeight: 3,
              scale: 10,
            }}
          />
        );
      })}

      {/* Info Window for selected route */}
      {selectedRoute && (
        <InfoWindow
          position={getRoutePosition(routes.indexOf(selectedRoute))}
          onCloseClick={() => setSelectedRoute(null)}
        >
          <div className="p-2">
            <h4 className="font-bold text-sm">{selectedRoute.name}</h4>
            <p className="text-xs text-gray-600">{selectedRoute.vehiclePlate}</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export const LiveRouteMap: React.FC<LiveRouteMapProps> = ({ routes, onNavigate }) => {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="relative w-full h-full bg-white/60 backdrop-blur-md rounded-[3rem] overflow-hidden border border-white/60 shadow-soft-xl flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-red-600 font-bold mb-2">Google Maps API Key Missing</p>
          <p className="text-gray-500 text-sm">Please add VITE_GOOGLE_MAPS_API_KEY to .env.local</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-white/60 backdrop-blur-md rounded-[3rem] overflow-hidden border border-white/60 shadow-soft-xl">
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={12}
          mapId="busbudd-live-map"
          disableDefaultUI={true}
          gestureHandling="greedy"
          style={{ width: '100%', height: '100%', borderRadius: '3rem' }}
        >
          <LiveRouteMapInner routes={routes} />
        </Map>
      </APIProvider>
    </div>
  );
};
