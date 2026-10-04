import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Tag,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Inbox,
  ShieldCheck,
  Clock,
} from 'lucide-react';

const FALLBACK_CATEGORIES = [
  'ID Card',
  'Mobile Phone',
  'Laptop',
  'Wallet',
  'Bag',
  'Keys',
  'Books',
  'Calculator',
  'Documents',
  'Electronics',
  'Jewelry',
  'Clothing',
  'Accessories',
  'Other',
];

const FALLBACK_LOCATIONS = [
  'Main Gate',
  'Library',
  'Canteen',
  'Academic Block',
  'Computer Block',
  'Laboratory',
  'Seminar Hall',
  'Auditorium',
  'Playground',
  'Parking Area',
  'Hostel',
  'Bus Area',
  'Administrative Block',
  'Other Campus Area',
];

const BrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search filter states initialized from URL params
  const [type, setType] = useState(searchParams.get('type') || 'ALL');
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || 'ALL');
  const [status, setStatus] = useState(searchParams.get('status') || 'ALL');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [color, setColor] = useState(searchParams.get('color') || '');
  const [dateFilter, setDateFilter] = useState('');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(0);

  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [campusLocations, setCampusLocations] = useState(FALLBACK_LOCATIONS);
  const [categoriesList, setCategoriesList] = useState(FALLBACK_CATEGORIES);

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load campus locations and categories from backend
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [locRes, catRes] = await Promise.all([
          API.get('/campus-locations').catch(() => ({ data: [] })),
          API.get('/categories').catch(() => ({ data: [] })),
        ]);
        if (locRes.data && locRes.data.length > 0) {
          setCampusLocations(locRes.data.map((l) => l.name));
        }
        if (catRes.data && catRes.data.length > 0) {
          setCategoriesList(catRes.data.map((c) => c.name));
        }
      } catch (err) {
        console.warn('Using fallback campus locations and categories');
      }
    };
    fetchMetadata();
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (type !== 'ALL') params.append('type', type);
      if (category !== 'ALL') params.append('category', category);
      if (debouncedQuery.trim()) params.append('query', debouncedQuery.trim());
      if (location !== 'ALL' && location.trim()) params.append('location', location.trim());
      if (status !== 'ALL' && status.trim()) params.append('status', status.trim());
      if (brand.trim()) params.append('brand', brand.trim());
      if (color.trim()) params.append('color', color.trim());
      params.append('sort', sort);
      params.append('page', page);
      params.append('size', '12');

      const res = await API.get(`/items?${params.toString()}`);
      let fetchedItems = res.data.content || [];

      // Client-side date filter if specified
      if (dateFilter) {
        fetchedItems = fetchedItems.filter(
          (i) => i.dateLostOrFound && i.dateLostOrFound >= dateFilter
        );
      }

      setItems(fetchedItems);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  }, [type, category, debouncedQuery, location, status, brand, color, dateFilter, sort, page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleReset = () => {
    setType('ALL');
    setCategory('ALL');
    setSearchQuery('');
    setLocation('ALL');
    setStatus('ALL');
    setBrand('');
    setColor('');
    setDateFilter('');
    setSort('newest');
    setPage(0);
  };

  return (
    <div className="bg-neutral-50/50 min-h-[90vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-100 text-primary">
                <Search className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                Browse Campus Reports
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Search authenticated lost property and found belongings reported across campus facilities.
            </p>
          </div>

          {/* Type Toggle Tabs (All, Lost, Found) */}
          <div className="flex bg-neutral-200/70 p-1 rounded-xl self-start md:self-auto">
            {['ALL', 'LOST', 'FOUND'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setPage(0);
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  type === t
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {t === 'ALL' ? 'All Campus Items' : t === 'LOST' ? 'Lost Items' : 'Found Items'}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar & Primary Filters */}
        <div className="bg-white p-4 rounded-3xl border border-neutral-200 card-shadow mb-8 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                placeholder="Search by item name, description, brand, or model..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Category dropdown */}
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(0);
                }}
                className="px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 bg-white focus:outline-none focus:border-primary"
              >
                <option value="ALL">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Campus Location dropdown */}
              <select
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(0);
                }}
                className="px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 bg-white focus:outline-none focus:border-primary"
              >
                <option value="ALL">All Campus Locations</option>
                {campusLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(0);
                }}
                className="px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 bg-white focus:outline-none focus:border-primary"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  showFilters
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Expandable Advanced Filters */}
          {showFilters && (
            <div className="pt-3 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(0);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:border-primary bg-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="CLAIM_PENDING">Claim Pending</option>
                  <option value="MATCHED">Matched</option>
                  <option value="RECOVERED">Recovered</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">
                  Report Date (From)
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setPage(0);
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:border-primary bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">
                  Brand or Model
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => {
                    setBrand(e.target.value);
                    setPage(0);
                  }}
                  placeholder="e.g. Apple, Casio, Dell..."
                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-2 px-3 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Metadata */}
        <div className="flex justify-between items-center text-xs text-neutral-500 mb-4 px-1">
          <span>
            Showing <strong className="text-neutral-800">{items.length}</strong> of{' '}
            <strong className="text-neutral-800">{totalElements}</strong> campus reports
          </span>
          <div className="flex gap-2">
            {category !== 'ALL' && (
              <span className="bg-orange-100 text-primary-dark px-2.5 py-0.5 rounded-full font-medium">
                {category}
              </span>
            )}
            {location !== 'ALL' && (
              <span className="bg-neutral-100 text-neutral-700 px-2.5 py-0.5 rounded-full font-medium">
                📍 {location}
              </span>
            )}
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-72 bg-white rounded-3xl animate-pulse border border-neutral-200"
              ></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200 card-shadow">
            <Inbox className="w-14 h-14 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-neutral-800">No matching campus reports</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search keywords, location filters, or item category.
            </p>
            <button
              onClick={handleReset}
              className="mt-5 px-5 py-2 rounded-xl bg-orange-100 text-primary font-bold text-xs hover:bg-orange-200 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/items/${item.id}`}
                className="bg-white rounded-3xl border border-neutral-200 overflow-hidden card-shadow hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-44 bg-neutral-100 overflow-hidden">
                  <img
                    src={
                      item.imageUrl ||
                      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500'
                    }
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        item.type === 'LOST'
                          ? 'bg-red-500 text-white shadow-sm'
                          : 'bg-green-600 text-white shadow-sm'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-sm text-neutral-800 shadow-sm">
                      {item.category}
                    </span>
                  </div>

                  {item.reward > 0 && (
                    <div className="absolute bottom-2.5 right-2.5 bg-yellow-400 text-neutral-900 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                      ${item.reward} Reward
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 group-hover:text-primary transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    {item.brand && (
                      <span className="text-[10px] text-neutral-400 block mt-1">
                        Brand: <strong className="text-neutral-600">{item.brand}</strong>
                        {item.model ? ` (${item.model})` : ''}
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-neutral-100 space-y-1.5 text-[11px] text-neutral-500">
                    <div className="flex items-center gap-1 truncate font-medium text-neutral-700">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    <div className="flex items-center justify-between text-neutral-400 text-[10px]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-neutral-400" />
                        {item.dateLostOrFound}
                      </span>
                      <span
                        className={`font-bold uppercase text-[9px] px-2 py-0.5 rounded-md ${
                          item.status === 'RECOVERED' || item.status === 'RETURNED'
                            ? 'bg-green-100 text-green-700'
                            : item.status === 'ACTIVE'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Backend Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-4 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-semibold text-neutral-700">
              Page {page + 1} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
