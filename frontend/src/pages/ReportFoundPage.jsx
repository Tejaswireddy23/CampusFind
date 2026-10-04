import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  Upload,
  Calendar,
  Clock,
  MapPin,
  Tag,
  X,
  GraduationCap,
} from 'lucide-react';
import DuplicateWarningModal from '../components/DuplicateWarningModal';

const DEFAULT_CATEGORIES = [
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

const DEFAULT_LOCATIONS = [
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

const ReportFoundPage = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');
  const [dateFound, setDateFound] = useState(new Date().toISOString().split('T')[0]);
  const [approximateTime, setApproximateTime] = useState('');
  const [campusLocation, setCampusLocation] = useState(DEFAULT_LOCATIONS[0]);
  const [additionalDetails, setAdditionalDetails] = useState('');

  // Duplicate warning state
  const [duplicateWarningOpen, setDuplicateWarningOpen] = useState(false);
  const [duplicateData, setDuplicateData] = useState(null);

  // Image upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const [locRes, catRes] = await Promise.allSettled([
          API.get('/campus-locations'),
          API.get('/categories'),
        ]);
        if (locRes.status === 'fulfilled' && locRes.value.data?.length > 0) {
          const names = locRes.value.data.map((l) => l.name);
          setLocations(names);
          setCampusLocation(names[0]);
        }
        if (catRes.status === 'fulfilled' && catRes.value.data?.length > 0) {
          const names = catRes.value.data.map((c) => c.name);
          setCategories(names);
          setCategory(names[0]);
        }
      } catch (err) {
        console.error('Failed to load campus config:', err);
      }
    };
    loadConfig();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toastError('Image file size must be under 10MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await API.post('/items/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(res.data.imageUrl);
      success('Image uploaded successfully.');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e, force = false) => {
    if (e) e.preventDefault();
    if (!title.trim() || !description.trim() || !campusLocation.trim()) {
      toastError('Please fill in all required fields.');
      return;
    }

    const payload = {
      type: 'FOUND',
      title: title.trim(),
      category,
      brand: brand.trim() || null,
      model: model.trim() || null,
      color: color.trim() || null,
      description: description.trim(),
      dateLostOrFound: dateFound,
      approximateTime: approximateTime.trim() || null,
      location: campusLocation,
      campusLocation: campusLocation,
      additionalDetails: additionalDetails.trim() || null,
      reward: 0,
      imageUrl: imageUrl || null,
    };

    if (!force) {
      try {
        const dupRes = await API.post('/items/check-duplicate', payload);
        if (dupRes.data?.hasSimilarReports) {
          setDuplicateData(dupRes.data);
          setDuplicateWarningOpen(true);
          return;
        }
      } catch (err) {
        console.error('Duplicate check skipped:', err);
      }
    }

    setSubmitting(true);
    try {
      const res = await API.post('/items/found', payload);
      success('Found item reported successfully! Fellow students can now discover it.');
      navigate(`/items/${res.data.id}`);
    } catch (err) {
      toastError(err.response?.data?.message || 'Unable to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-neutral-50/50 min-h-[90vh] py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-green-700" />
            Campus Found Report
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Report a Found Item
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Found an item on campus? Help return it to its student owner by submitting accurate details.
          </p>
        </div>

        <form
          onSubmit={(e) => handleSubmit(e, false)}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 card-shadow space-y-6"
        >
          {/* Item Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Item Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Casio Scientific Calculator FX-991EX"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
            />
          </div>

          {/* Category & Campus Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Campus Location *
              </label>
              <select
                value={campusLocation}
                onChange={(e) => setCampusLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium bg-white"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Brand, Model, Color */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Brand
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Casio / Apple"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Model / Variant
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. FX-991EX"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Color
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Black / Silver"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Date Found *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  required
                  value={dateFound}
                  onChange={(e) => setDateFound(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Approximate Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={approximateTime}
                  onChange={(e) => setApproximateTime(e.target.value)}
                  placeholder="e.g. 02:45 PM"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State where you discovered it, who you handed it over to (or if it is with you), and general condition..."
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            ></textarea>
          </div>

          {/* Additional Details */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Additional Details (Optional)
            </label>
            <input
              type="text"
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="e.g. Handed over to security desk at Computer Block"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Item Photo (Optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-neutral-200 hover:border-primary/50 rounded-2xl transition-colors bg-neutral-50/50">
              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 rounded-xl object-contain shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setImageFile(null);
                      setImageUrl('');
                    }}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center rounded-xl">
                      <span className="text-xs font-bold text-primary">Uploading...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-center">
                  <Upload className="mx-auto h-8 w-8 text-neutral-400" />
                  <div className="flex text-xs text-neutral-600">
                    <label className="relative cursor-pointer font-bold text-primary hover:underline">
                      <span>Upload image</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1 text-neutral-400">or drag and drop</p>
                  </div>
                  <p className="text-[10px] text-neutral-400">PNG, JPG, WEBP up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-all shadow-md shadow-green-600/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Publish Found Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {duplicateWarningOpen && duplicateData && (
        <DuplicateWarningModal
          data={duplicateData}
          onProceed={() => {
            setDuplicateWarningOpen(false);
            handleSubmit(null, true);
          }}
          onCancel={() => setDuplicateWarningOpen(false)}
        />
      )}
    </div>
  );
};

export default ReportFoundPage;
