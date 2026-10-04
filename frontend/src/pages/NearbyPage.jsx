import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  MapPin,
  Compass,
  Filter,
  Layers,
  Bell,
  CheckCircle,
  Eye,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Search,
  Sliders,
  X,
} from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Mobile Phones',
  'Laptops',
  'Wallets',
  'Bags',
  'Keys',
  'Documents',
  'Jewelry',
  'Clothing',
  'Books',
  'Accessories',
  'Other',
];

const RADIUS_OPTIONS = [1, 5, 10, 25];

const NearbyPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  const [radiusKm, setRadiusKm] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedType, setSelectedType] = useState('ALL'); // 'ALL', 'LOST', 'FOUND'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected item for preview modal
  const [previewItem, setPreviewItem] = useState(null);

  // Geofence alert config state
  const [geofenceModalOpen, setGeofenceModalOpen] = useState(false);
  const [geofenceRadius, setGeofenceRadius] = useState(10);
  const [geofenceCategory, setGeofenceCategory] = useState('All Categories');
  const [geofenceEnabled, setGeofenceEnabled] = useState(true);
  const [savingGeofence, setSavingGeofence] = useState(false);

  // User coordinate (default to central coordinates)
  const [userCoords, setUserCoords] = useState({ lat: 37.7749, lon: -122.4194 });

  // Load user location and preferences
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        () => {
          // Keep default if permission denied
        }
      );
    }

    if (isAuthenticated) {
      API.get('/location/preferences')
        .then((res) => {
          if (res.data) {
            if (res.data.radiusKm) setGeofenceRadius(res.data.radiusKm);
            if (res.data.preferredCategory) setGeofenceCategory(res.data.preferredCategory);
            setGeofenceEnabled(res.data.alertEnabled ?? true);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Fetch nearby items
  const fetchNearby = async () => {
    setLoading(true);
    try {
      const params = {
        lat: userCoords.lat,
        lon: userCoords.lon,
        radiusKm,
      };
      if (selectedType !== 'ALL') {
        params.type = selectedType;
      }
      if (selectedCategory !== 'All Categories') {
        params.category = selectedCategory;
      }

      const res = await API.get('/items/nearby', { params });
      setItems(res.data || []);
    } catch (err) {
      console.error('Error fetching nearby items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby();
  }, [radiusKm, selectedCategory, selectedType, userCoords]);

  const handleSaveGeofence = async () => {
    setSavingGeofence(true);
    try {
      await API.post('/location/preferences', {
        radiusKm: geofenceRadius,
        preferredCategory: geofenceCategory === 'All Categories' ? null : geofenceCategory,
        latitude: userCoords.lat,
        longitude: userCoords.lon,
        alertEnabled: geofenceEnabled,
      });
      success(`Geofenced alerts active: within ${geofenceRadius} km radius.`);
      setGeofenceModalOpen(false);
    } catch (err) {
      toastError('Could not save location alert preferences.');
    } finally {
      setSavingGeofence(false);
    }
  };

  return (
    <div className="bg-neutral-50/50 min-h-[90vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header & Geofence CTA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-primary-dark text-xs font-semibold mb-2">
              <Compass className="w-3.5 h-3.5 text-primary" />
              Radius & Geographic Radar
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Nearby Lost & Found Items
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Explore reported items in your immediate vicinity with approximate privacy-safe locations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start">
            {isAuthenticated && (
              <button
                onClick={() => setGeofenceModalOpen(true)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-primary hover:bg-primary-dark shadow-sm shadow-orange-500/20 transition-all flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                Configure Geofence Alert
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-neutral-200 card-shadow flex flex-wrap items-center justify-between gap-4">
          {/* Radius Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mr-1">
              Radius:
            </span>
            <div className="flex bg-neutral-100 p-1 rounded-xl">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusKm(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    radiusKm === r
                      ? 'bg-primary text-white shadow-sm shadow-orange-500/20'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mr-1">
              Type:
            </span>
            <div className="flex bg-neutral-100 p-1 rounded-xl">
              <button
                onClick={() => setSelectedType('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedType === 'ALL'
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedType('LOST')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedType === 'LOST'
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Lost (Orange)
              </button>
              <button
                onClick={() => setSelectedType('FOUND')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedType === 'FOUND'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Found (Green)
              </button>
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:border-primary"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Map Canvas / Abstraction Component */}
        <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden card-shadow relative">
          <div className="p-4 bg-neutral-50/80 border-b border-neutral-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-neutral-800">
                Live Geolocation Map View ({items.length} items within {radiusKm} km)
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span>Lost Item</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-600"></span>
                <span>Found Item</span>
              </span>
            </div>
          </div>

          {/* Map abstraction interactive visual representation */}
          <div className="relative w-full h-[400px] sm:h-[460px] bg-slate-900 overflow-hidden select-none flex items-center justify-center">
            {/* Styled Map Background Grid */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #f97316 1px, transparent 1px), radial-gradient(circle, #ffffff 1px, transparent 1px)',
                backgroundSize: '40px 40px, 80px 80px',
                backgroundPosition: '0 0, 20px 20px',
              }}
            ></div>

            {/* Radar concentric distance circles */}
            <div className="absolute w-[180px] h-[180px] rounded-full border border-orange-500/20 animate-ping pointer-events-none"></div>
            <div className="absolute w-[240px] h-[240px] rounded-full border border-white/10 pointer-events-none"></div>
            <div className="absolute w-[360px] h-[360px] rounded-full border border-white/10 pointer-events-none"></div>
            <div className="absolute w-[500px] h-[500px] rounded-full border border-white/5 pointer-events-none"></div>

            {/* User Center Location Marker */}
            <div className="absolute z-10 flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg shadow-blue-500/50 animate-pulse"></div>
              <span className="text-[10px] font-bold text-white bg-blue-600/90 px-2 py-0.5 rounded-full mt-1 backdrop-blur-sm">
                Your Location
              </span>
            </div>

            {/* Map Markers for Items */}
            {items.map((item, index) => {
              // Calculate deterministic relative offsets for visual map representation
              const angle = ((index * 360) / Math.max(items.length, 1) + 45) * (Math.PI / 180);
              const distanceFactor = Math.min(180, 40 + (index % 4) * 45 + (item.distanceKm || 2) * 12);
              const xOffset = Math.cos(angle) * distanceFactor;
              const yOffset = Math.sin(angle) * distanceFactor;

              const isLost = item.type === 'LOST';

              return (
                <button
                  key={item.id}
                  onClick={() => setPreviewItem(item)}
                  style={{
                    transform: `translate(${xOffset}px, ${yOffset}px)`,
                  }}
                  className={`absolute z-20 group transition-transform duration-200 hover:scale-125 focus:outline-none`}
                  title={`${item.title} (${item.distanceKm ? item.distanceKm.toFixed(1) : '1.2'} km)`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md text-xs font-bold transition-all ${
                      isLost
                        ? 'bg-orange-500 shadow-orange-500/50 border-2 border-white'
                        : 'bg-green-600 shadow-green-600/50 border-2 border-white'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  {/* Tooltip on Hover */}
                  <div className="hidden group-hover:block absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-neutral-900/95 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-xl pointer-events-none z-30">
                    <span className={isLost ? 'text-orange-400' : 'text-green-400'}>
                      [{item.type}]
                    </span>{' '}
                    {item.title}
                  </div>
                </button>
              );
            })}

            {/* Privacy notice banner at bottom of map */}
            <div className="absolute bottom-3 left-3 right-3 bg-neutral-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-neutral-300 text-[11px] flex items-center justify-between border border-neutral-700/50">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Approximate privacy-safe locations shown. Exact private addresses are never shared.</span>
              </span>
              <span className="hidden sm:inline text-neutral-400">Click any marker for details</span>
            </div>
          </div>
        </div>

        {/* Nearby Items List Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">
              Nearby Items List ({items.length})
            </h2>
            <span className="text-xs text-neutral-500 font-medium">
              Sorted by closest proximity
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-white rounded-3xl animate-pulse border border-neutral-200"
                ></div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 card-shadow">
              <MapPin className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-neutral-800">
                No items found within {radiusKm} km
              </h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Try extending your search radius to 25 km or clearing category filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-neutral-200 overflow-hidden card-shadow hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-44 w-full bg-neutral-100 overflow-hidden">
                      <img
                        src={
                          item.imageUrl ||
                          'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500'
                        }
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase shadow-sm ${
                            item.type === 'LOST'
                              ? 'bg-orange-500 text-white'
                              : 'bg-green-600 text-white'
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 bg-neutral-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                        <Compass className="w-3 h-3 text-primary" />
                        <span>{item.distanceKm ? item.distanceKm.toFixed(1) : '1.5'} km away</span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {item.dateLostOrFound}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-neutral-900 group-hover:text-primary transition-colors line-clamp-1">
                        {item.title}
                      </h3>

                      <p className="text-xs text-neutral-500 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="text-xs text-neutral-500 flex items-center gap-1 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex gap-2">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Quick Preview
                    </button>
                    <Link
                      to={`/items/${item.id}`}
                      className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark transition-colors flex items-center justify-center gap-1 shadow-sm shadow-orange-500/20"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Item Quick Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-neutral-200 card-shadow overflow-hidden space-y-4">
            <div className="relative h-48 bg-neutral-100">
              <img
                src={
                  previewItem.imageUrl ||
                  'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600'
                }
                alt={previewItem.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setPreviewItem(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white text-neutral-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 flex gap-2">
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-xl text-white uppercase shadow-sm ${
                    previewItem.type === 'LOST' ? 'bg-orange-500' : 'bg-green-600'
                  }`}
                >
                  {previewItem.type}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-neutral-900/80 text-white backdrop-blur-sm">
                  {previewItem.distanceKm ? previewItem.distanceKm.toFixed(1) : '1.5'} km away
                </span>
              </div>
            </div>

            <div className="p-6 pt-0 space-y-3">
              <div>
                <span className="text-xs font-semibold text-neutral-400 uppercase">
                  {previewItem.category}
                </span>
                <h3 className="text-lg font-bold text-neutral-900">{previewItem.title}</h3>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                {previewItem.description}
              </p>

              <div className="text-xs text-neutral-500 space-y-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Approximate area: {previewItem.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-neutral-700">Date Reported:</span>
                  <span>{previewItem.dateLostOrFound}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Link
                  to={`/items/${previewItem.id}`}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs text-center text-white bg-primary hover:bg-primary-dark transition-all shadow-md shadow-orange-500/20"
                >
                  View Full Listing
                </Link>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Geofence Configuration Modal */}
      {geofenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-neutral-200 card-shadow p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-primary">
                  <Bell className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Geofenced Proximity Alerts
                </h3>
              </div>
              <button
                onClick={() => setGeofenceModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Configure real-time alerts so that whenever a matching item is reported within your chosen radius, CampusFind pushes an instant WebSocket & browser notification directly to your device.
            </p>

            <div className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-neutral-700 mb-1.5">
                  Alert Radius (km):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {RADIUS_OPTIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setGeofenceRadius(r)}
                      className={`py-2 rounded-xl border text-center font-bold transition-all ${
                        geofenceRadius === r
                          ? 'bg-primary text-white border-primary shadow-sm shadow-orange-500/20'
                          : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {r} km
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 mb-1.5">
                  Category Filter (Optional):
                </label>
                <select
                  value={geofenceCategory}
                  onChange={(e) => setGeofenceCategory(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:border-primary"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="enableGeofence"
                  checked={geofenceEnabled}
                  onChange={(e) => setGeofenceEnabled(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-neutral-300 focus:ring-primary"
                />
                <label htmlFor="enableGeofence" className="text-neutral-800 cursor-pointer">
                  Enable automatic push alerts when matching items are reported inside this radius
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setGeofenceModalOpen(false)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingGeofence}
                onClick={handleSaveGeofence}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary-dark shadow-sm shadow-orange-500/20 transition-all"
              >
                {savingGeofence ? 'Saving...' : 'Save Geofence Alert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NearbyPage;
