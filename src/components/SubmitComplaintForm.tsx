import React, { useState, useEffect } from 'react';
import { ComplaintCategory, PriorityLevel, MLPredictionResult, UserRole } from '../types/index.js';
import { createComplaintApi, predictComplaintMLApi } from '../services/api.js';
import { PriorityBadge } from './StatusBadge.js';
import {
  Sparkles,
  Send,
  MapPin,
  Clock,
  Repeat,
  User,
  Mail,
  Phone,
  CheckCircle,
  HelpCircle,
  Zap,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  UserPlus,
  LogIn
} from 'lucide-react';

interface SubmitComplaintFormProps {
  onSuccess: (complaintId: string) => void;
  currentUser?: { name: string; email: string; role: string; token: string; phone?: string } | null;
  onOpenAuth?: (isRegister: boolean, role: UserRole, reason?: string) => void;
  onAutoRegisterDemoCitizen?: () => void;
}

const TEMPLATES = [
  {
    label: '⚡ Live Sparking Wire',
    title: 'Exposed high voltage wire sparking on children playground',
    desc: 'High voltage transformer sparking and exposed live electrical wire hanging near children playground in Sector 4. Urgent danger of electrocution.',
    area: 'Sector 4, West Wing',
    days: 1,
    prev: 5
  },
  {
    label: '💡 Dark Streetlight',
    title: 'Streetlight cluster broken for 10 days on main road',
    desc: 'Streetlight near Sector 4 has been broken for 10 days and the road becomes completely dark at night creating severe security risk.',
    area: 'Sector 4, Main Avenue',
    days: 10,
    prev: 4
  },
  {
    label: '🕳️ Hazardous Pothole',
    title: 'Deep crater pothole on expressway flyover',
    desc: 'Massive deep crater pothole on expressway flyover causing sudden braking and bike skids during rush hour.',
    area: 'Central Expressway Flyover',
    days: 6,
    prev: 6
  },
  {
    label: '💧 Pipe Burst Flooding',
    title: 'Drinking water pipeline burst flooding residential road',
    desc: 'Main drinking water pipeline burst flooding entire road with high pressure clean water loss and basement waterlogging.',
    area: 'Oakwood North, Sector 8',
    days: 2,
    prev: 7
  },
  {
    label: '🗑️ Garbage Overflow',
    title: 'Overflowing garbage dump with severe stench',
    desc: 'Commercial hotel dumping rotten food waste and plastic on sidewalk daily attracting stray animals and severe health hazard.',
    area: 'Market Road Block C',
    days: 4,
    prev: 2
  }
];

export const SubmitComplaintForm: React.FC<SubmitComplaintFormProps> = ({
  onSuccess,
  currentUser,
  onOpenAuth,
  onAutoRegisterDemoCitizen
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Metropolis');
  const [area, setArea] = useState('Sector 4');
  const [landmark, setLandmark] = useState('');
  const [daysPending, setDaysPending] = useState(1);
  const [previousComplaints, setPreviousComplaints] = useState(0);
  const [citizenName, setCitizenName] = useState(currentUser?.name || '');
  const [citizenEmail, setCitizenEmail] = useState(currentUser?.email || '');
  const [citizenPhone, setCitizenPhone] = useState(currentUser?.phone || '+1 (555) 234-5678');
  const [customCategory, setCustomCategory] = useState<string>('AUTO');

  // Update name/email when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setCitizenName(currentUser.name);
      setCitizenEmail(currentUser.email);
      if (currentUser.phone) {
        setCitizenPhone(currentUser.phone);
      }
    }
  }, [currentUser]);

  // Live ML Prediction Preview state
  const [mlPreview, setMlPreview] = useState<MLPredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Debounced ML inference on description/days/prev change
  useEffect(() => {
    if (!description.trim() || description.trim().length < 8) {
      setMlPreview(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsPredicting(true);
        const res = await predictComplaintMLApi(description, daysPending, previousComplaints);
        setMlPreview(res.data);
      } catch (e) {
        // quiet fallback
      } finally {
        setIsPredicting(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [description, daysPending, previousComplaints]);

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setTitle(tpl.title);
    setDescription(tpl.desc);
    setArea(tpl.area);
    setDaysPending(tpl.days);
    setPreviousComplaints(tpl.prev);
    setCustomCategory('AUTO');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentUser) {
      setErrorMsg('Mandatory Citizen Registration is required before submitting complaints.');
      if (onOpenAuth) {
        onOpenAuth(true, 'citizen', 'Citizen registration is mandatory to submit complaints.');
      }
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Please enter a descriptive complaint title.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please enter a description for AI classification.');
      return;
    }
    if (!area.trim()) {
      setErrorMsg('Please enter the area/location.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createComplaintApi({
        title: title.trim(),
        description: description.trim(),
        location: {
          city: city.trim() || 'Metropolis',
          area: area.trim(),
          landmark: landmark.trim() || undefined
        },
        daysPending: Number(daysPending) || 0,
        previousComplaints: Number(previousComplaints) || 0,
        citizenName: (citizenName || currentUser.name).trim(),
        citizenEmail: (citizenEmail || currentUser.email).trim(),
        citizenPhone: citizenPhone.trim() || undefined,
        customCategory: customCategory !== 'AUTO' ? (customCategory as ComplaintCategory) : undefined
      });

      setSubmittedResult(res.complaint);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit complaint. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setArea('Sector 4');
    setLandmark('');
    setDaysPending(1);
    setPreviousComplaints(0);
    setCustomCategory('AUTO');
    setMlPreview(null);
    setSubmittedResult(null);
    setErrorMsg('');
  };

  const categories: ComplaintCategory[] = [
    'Streetlight', 'Garbage', 'Road/Pothole', 'Water Supply',
    'Drainage', 'Electricity', 'Public Transport', 'Traffic',
    'Sewage', 'Other'
  ];

  // MANDATORY REGISTRATION GATE: If citizen is not registered/logged in, show mandatory requirement view
  if (!currentUser) {
    return (
      <div id="mandatory-citizen-registration-gate" className="max-w-2xl mx-auto space-y-6 py-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-blue-200 dark:border-blue-900/60 shadow-xl p-6 sm:p-8 space-y-6 text-center transition-colors">
          {/* Header Icon */}
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <UserPlus className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              Municipal Governance Protocol
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Citizen Registration Mandatory to Lodge Complaint
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              To prevent anonymous false reports, maintain location accountability, and deliver direct SMS/email resolution updates from municipal field crews, all citizens must register before lodging a complaint.
            </p>
          </div>

          {/* Benefits Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200">Live SMS & Email</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Receive instant notifications when municipal officers review & resolve your issue.</div>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200">Verified Citizen ID</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Your reports are verified and routed to specialized ward engineers with high priority.</div>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200">Complaint History</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Access all your submitted grievances in one personalized Citizen Dashboard.</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                id="register-mandatory-citizen-btn"
                type="button"
                onClick={() => onOpenAuth && onOpenAuth(true, 'citizen', 'Register your citizen profile to lodge civic complaints.')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Citizen Profile</span>
              </button>

              <button
                id="signin-citizen-btn"
                type="button"
                onClick={() => onOpenAuth && onOpenAuth(false, 'citizen', 'Sign in to your citizen account to lodge a complaint.')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Existing Account</span>
              </button>
            </div>

            {/* Quick 1-Click Demo Registration for tester convenience */}
            {onAutoRegisterDemoCitizen && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onAutoRegisterDemoCitizen}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Quick Test: Register Instantly as Aarav Sharma (Citizen Demo)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (submittedResult) {
    return (
      <div id="submission-success-card" className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-xl p-6 sm:p-8 text-center space-y-6 transition-colors">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-900/30 animate-bounce">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            Registered with Municipal Ingestion Engine
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Complaint Submitted Successfully!
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Your issue has been automatically categorized and queued for municipal action based on its ML predicted priority.
          </p>
        </div>

        {/* Highlight Summary Box */}
        <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-5 border border-slate-200 dark:border-slate-700 text-left space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
            <div>
              <div className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">Complaint ID</div>
              <div className="text-lg font-mono font-bold text-blue-700 dark:text-blue-400">{submittedResult.id}</div>
            </div>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={submittedResult.priority} confidence={submittedResult.confidence} size="md" />
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                {submittedResult.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-medium">Assigned Category:</span>
              <div className="font-bold text-slate-900 dark:text-white">{submittedResult.category}</div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-medium">Location Area:</span>
              <div className="font-bold text-slate-900 dark:text-white">{submittedResult.location.area}, {submittedResult.location.city}</div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-medium">ML Confidence Score:</span>
              <div className="font-bold text-indigo-700 dark:text-indigo-400 font-mono">{Math.round(submittedResult.confidence * 100)}%</div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-medium">Assigned Department:</span>
              <div className="font-bold text-slate-900 dark:text-white">{submittedResult.assignedDepartment}</div>
            </div>
          </div>

          {submittedResult.explainability?.primaryDrivers && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Key Urgency Drivers</div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 list-disc list-inside space-y-0.5">
                {submittedResult.explainability.primaryDrivers.map((d: string, idx: number) => (
                  <li key={idx}>{d}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            id="track-new-complaint-btn"
            onClick={() => onSuccess(submittedResult.id)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <span>Track This Complaint</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            id="submit-another-btn"
            onClick={handleReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Submit Another Complaint</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="submit-complaint-section" className="max-w-4xl mx-auto space-y-6">
      {/* Header & Authenticated Citizen Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Submit Civic Complaint
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Describe any municipal infrastructure or public service issue. Our explainable NLP engine will automatically categorize it and evaluate priority urgency.
          </p>
        </div>

        {/* Authenticated Citizen Badge */}
        {currentUser && (
          <div className="shrink-0 flex items-center gap-2.5 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 py-1.5 px-3 rounded-2xl">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xs font-bold shadow-xs">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left text-xs leading-tight">
              <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1">
                <span>{currentUser.name}</span>
                <span className="text-[10px] font-extrabold uppercase bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-1.5 py-0.2 rounded">
                  {currentUser.role}
                </span>
              </div>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono truncate max-w-[160px]">
                {currentUser.email}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Templates Banner */}
      <div className="bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2 transition-colors">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Quick Preset Examples (Click to Auto-fill):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((tpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="text-xs bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-700 dark:text-slate-200 font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              {tpl.label}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Form */}
        <div className="lg:col-span-2 space-y-5 bg-white dark:bg-slate-900/90 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Complaint Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="complaint-title-input"
              required
              placeholder="e.g. Broken streetlight on Sector 4 main avenue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {description.length} characters
              </span>
            </div>
            <textarea
              id="complaint-description-input"
              required
              rows={4}
              placeholder="Describe the issue, location hazards, time elapsed, and exact symptoms..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              💡 Tip: Provide specific details (e.g., exposed wires, days broken, accidents caused) to assist ML priority recommendation.
            </p>
          </div>

          {/* Category Override / Auto Detect */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                id="complaint-category-select"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="AUTO">✨ Auto-Detect with NLP (Recommended)</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>Manual: {cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                City
              </label>
              <input
                type="text"
                id="complaint-city-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Location Area & Landmark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Area / Ward / Sector <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  id="complaint-area-input"
                  required
                  placeholder="e.g. Sector 4, West Wing"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full pl-10 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Landmark / Specific Spot (Optional)
              </label>
              <input
                type="text"
                id="complaint-landmark-input"
                placeholder="e.g. Near Greenwood Primary School"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Metadata Features (Days Pending & Previous Complaints) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Issue History & Recurrence (ML Feature Inputs)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Days issue has existed: <strong className="text-slate-900 dark:text-white">{daysPending} day(s)</strong>
                </label>
                <input
                  type="range"
                  id="days-pending-slider"
                  min={0}
                  max={30}
                  value={daysPending}
                  onChange={(e) => setDaysPending(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  <span>0 (Today)</span>
                  <span>7 (1 week)</span>
                  <span>30+ days</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Previous complaints reported: <strong className="text-slate-900 dark:text-white">{previousComplaints}</strong>
                </label>
                <input
                  type="range"
                  id="previous-complaints-slider"
                  min={0}
                  max={10}
                  value={previousComplaints}
                  onChange={(e) => setPreviousComplaints(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  <span>0 (First report)</span>
                  <span>5</span>
                  <span>10+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Citizen Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Registered Citizen</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  readOnly
                  value={citizenName}
                  className="w-full pl-9 bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 font-medium cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Verified Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  readOnly
                  value={citizenEmail}
                  className="w-full pl-9 bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 font-mono cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">SMS Alerts Phone</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              id="submit-complaint-btn"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Processing ML Ingestion...' : 'Submit Complaint to Municipality'}</span>
            </button>
          </div>
        </div>

        {/* Right 1 Col: Live AI Prediction Preview */}
        <div className="space-y-4">
          <div className="bg-slate-900 dark:bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <h3 className="text-sm font-bold">Real-time ML Preview</h3>
              </div>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                TF-IDF + Softmax
              </span>
            </div>

            {isPredicting ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Vectorizing text & computing inference...</p>
              </div>
            ) : mlPreview ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block mb-1">Predicted Category:</span>
                  <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                    <span className="font-bold text-sm text-white">{mlPreview.category}</span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      {Math.round(mlPreview.categoryConfidence * 100)}% match
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block mb-1">Predicted Priority:</span>
                  <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                    <PriorityBadge priority={mlPreview.priority} confidence={mlPreview.confidence} size="md" />
                  </div>
                </div>

                {/* Probability Distribution */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-slate-400 text-[11px]">Class Probability:</span>
                  <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[10px]">
                    <div className="bg-red-950/60 border border-red-800 p-1.5 rounded text-red-300">
                      <div>HIGH</div>
                      <div className="font-bold">{Math.round((mlPreview.probabilities.HIGH || 0) * 100)}%</div>
                    </div>
                    <div className="bg-amber-950/60 border border-amber-800 p-1.5 rounded text-amber-300">
                      <div>MED</div>
                      <div className="font-bold">{Math.round((mlPreview.probabilities.MEDIUM || 0) * 100)}%</div>
                    </div>
                    <div className="bg-emerald-950/60 border border-emerald-800 p-1.5 rounded text-emerald-300">
                      <div>LOW</div>
                      <div className="font-bold">{Math.round((mlPreview.probabilities.LOW || 0) * 100)}%</div>
                    </div>
                  </div>
                </div>

                {/* Detected Keywords */}
                {mlPreview.topKeywords && mlPreview.topKeywords.length > 0 && (
                  <div>
                    <span className="text-slate-400 text-[11px] block mb-1">Active TF-IDF Features:</span>
                    <div className="flex flex-wrap gap-1">
                      {mlPreview.topKeywords.map((kw, i) => (
                        <span key={i} className="bg-slate-800 text-blue-300 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-700">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Supporting Factors */}
                <div className="border-t border-slate-800 pt-2 space-y-1">
                  <span className="text-slate-400 text-[11px] block">Why this prediction?</span>
                  <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                    {mlPreview.supportingFactors.slice(0, 2).map((sf, idx) => (
                      <li key={idx} className="leading-tight">{sf}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <Sparkles className="w-6 h-6 text-slate-600 mx-auto" />
                <p>Start typing complaint description above to preview real-time AI category and priority classification.</p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 rounded-xl p-4 text-xs text-blue-800 dark:text-blue-300 space-y-1.5 transition-colors">
            <div className="font-bold flex items-center gap-1.5">
              <span>🏛️ Municipal Priority Guarantee</span>
            </div>
            <p className="text-blue-700 dark:text-blue-400 leading-relaxed">
              High priority civic hazards (e.g. exposed live wires, pipe bursts, deep potholes) trigger automated alerts to municipal quick-response field units.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
