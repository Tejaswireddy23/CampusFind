import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import {
  MapPin,
  Building,
  Layers,
  ArrowRight,
  Search,
  Compass,
  Sparkles,
  RefreshCw,
  FileText,
} from 'lucide-react';

const CampusMapPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState(null);

  const fetchDistribution = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/campus-locations/distribution');
      setLocations(res.data || []);
      if (res.data?.length > 0 && !selectedLocation) {
        setSelectedLocation(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching campus location distribution:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDistribution();
  }, [fetchDistribution]);

  // Extract unique zones
  const zones = ['ALL', ...new Set(locations.map((l) => l.zone || 'General Zone'))];

  const filteredLocations = locations.filter((loc) => {
    if (selectedZone === 'ALL') return true;
    return (loc.zone || 'General Zone') === selectedZone;
  });

  const totalReportsAcrossCampus = locations.reduce((sum, l) => sum + (l.reportCount || 0), 0);

  return (
    <div className="bg-neutral-50/50 min-h-[90vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-primary flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                Campus Location Map & Zones
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500">
              Interactive report distribution across campus zones, facilities, and academic blocks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 px-4 rounded-2xl bg-primary-light border border-orange-200 text-right">
              <span className="text-[10px] uppercase font-bold text-primary-dark block">
                Total Campus Reports
              </span>
              <span className="text-xl font-black text-primary">
                {totalReportsAcrossCampus}
              </span>
            </div>
            <button
              onClick={fetchDistribution}
              disabled={loading}
              className="p-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
              title="Refresh distribution"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Zone Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {zones.map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedZone === zone
                  ? 'bg-primary text-white shadow-sm shadow-orange-500/20'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {zone === 'ALL' ? 'All Campus Zones' : zone}
            </button>
          ))}
        </div>

        {/* Grid Map Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visual Campus Zones Grid (2 cols) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredLocations.map((loc) => {
              const count = loc.reportCount || 0;
              const isSelected = selectedLocation?.id === loc.id;

              return (
                <div
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc)}
                  className={`p-5 rounded-3xl border card-shadow cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-orange-50/90 border-primary ring-2 ring-primary/20 shadow-orange-500/10'
                      : 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-primary text-white'
                              : count > 5
                              ? 'bg-orange-100 text-primary'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          <Building className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-neutral-900 text-sm leading-tight">
                            {loc.name}
                          </h3>
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                            {loc.zone || 'Campus Zone'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-black shrink-0 ${
                          count > 0
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        📍 {count} {count === 1 ? 'report' : 'reports'}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                      {loc.description || 'Predefined campus reporting location.'}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                    <span className="text-neutral-400 font-mono">Code: {loc.code}</span>
                    <span className="text-primary font-bold inline-flex items-center gap-1 group-hover:underline">
                      View details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Location Focus Inspector Card (1 col) */}
          <div className="lg:col-span-1">
            {selectedLocation ? (
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-neutral-200 card-shadow sticky top-24 space-y-6">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                    {selectedLocation.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700">
                      {selectedLocation.zone || 'Campus Zone'}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">
                      #{selectedLocation.code}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                    Zone Description
                  </span>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {selectedLocation.description || 'No detailed description provided for this campus facility.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/70 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-orange-900 block">
                      Active Reports Recorded
                    </span>
                    <span className="text-xs text-orange-700/80">
                      Lost and found items logged here
                    </span>
                  </div>
                  <span className="text-2xl font-black text-primary">
                    {selectedLocation.reportCount || 0}
                  </span>
                </div>

                <Link
                  to={`/browse?location=${encodeURIComponent(selectedLocation.name)}`}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary-dark transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Browse Reports at {selectedLocation.name}</span>
                </Link>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 text-center text-xs text-neutral-400">
                Select a campus location to inspect reports
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusMapPage;
