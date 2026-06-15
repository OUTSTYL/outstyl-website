import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Ruler, Scale, Shirt, Sliders, Check, RotateCcw, AlertCircle } from 'lucide-react';
import { trackEvent } from '../firebase';

export interface SizeRecommendation {
  recommendedSize: string;
  reasoning: string;
  breakdown: {
    category: string;
    size: string;
    fitNotes: string;
  }[];
  styleTips: string[];
}

export default function SizeAdvisor() {
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [gender, setGender] = useState<string>('unisex');
  const [height, setHeight] = useState<number>(175); // standard height in cm
  const [weight, setWeight] = useState<number>(70); // standard weight in kg
  const [chest, setChest] = useState<string>('');
  const [waist, setWaist] = useState<string>('');
  const [hips, setHips] = useState<string>('');
  const [fitPreference, setFitPreference] = useState<string>('regular');
  
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<SizeRecommendation | null>(null);

  // Convert unit defaults when unit system changes
  const handleUnitChange = (system: 'metric' | 'imperial') => {
    if (system === unitSystem) return;
    setUnitSystem(system);
    if (system === 'imperial') {
      // Convert 175 cm to inches (~69in), 70kg to lbs (~154lbs)
      setHeight(Math.round(height * 0.393701));
      setWeight(Math.round(weight * 2.20462));
      if (chest) setChest(Math.round(Number(chest) * 0.393701).toString());
      if (waist) setWaist(Math.round(Number(waist) * 0.393701).toString());
      if (hips) setHips(Math.round(Number(hips) * 0.393701).toString());
    } else {
      // Convert inches to cm, lbs to kg
      setHeight(Math.round(height / 0.393701));
      setWeight(Math.round(weight / 2.20462));
      if (chest) setChest(Math.round(Number(chest) / 0.393701).toString());
      if (waist) setWaist(Math.round(Number(waist) / 0.393701).toString());
      if (hips) setHips(Math.round(Number(hips) / 0.393701).toString());
    }
  };

  const handleRecommend = async () => {
    setLoading(true);
    setError(null);
    setRecommendation(null);
    trackEvent('ai_size_calculator_start', { gender, fitPreference });

    const steps = [
      'Scanning body proportions...',
      'Mapping standard size baselines...',
      'Refining recommendations via OutStyl LLM...',
      'Finalizing style recommendations...'
    ];

    let currentStep = 0;
    setLoadingStep(steps[currentStep]);
    const interval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        setLoadingStep(steps[currentStep]);
      }
    }, 1200);

    try {
      const response = await fetch('/api/ai/size-recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gender,
          height,
          weight,
          unitSystem,
          chest: chest ? Number(chest) : undefined,
          waist: waist ? Number(waist) : undefined,
          hips: hips ? Number(hips) : undefined,
          fitPreference: fitPreference + ' fit',
        }),
      });

      clearInterval(interval);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to get recommendation');
      }

      const data = await response.json();
      setRecommendation(data);
      trackEvent('ai_size_calculator_success', { recommendedSize: data.recommendedSize });
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      setError(err.message || 'Connecting to AI Fitting Room failed. Please try again.');
      trackEvent('ai_size_calculator_failed', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRecommendation(null);
    setError(null);
  };

  const fitPreferences = [
    { id: 'slim', label: 'Slim Fit', desc: 'Sits close to the body for a sharp look' },
    { id: 'regular', label: 'Regular Fit', desc: 'Standard comfortable cut with balanced movement' },
    { id: 'oversized', label: 'Oversized', desc: 'Relaxed, retro-draped fit with modern street style' }
  ];

  return (
    <div id="ai-fitting-room" className="glass-card p-8 lg:p-12 w-full max-w-4xl mx-auto border border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#F02D7D]/15 rounded-full blur-[90px] -z-10 pointer-events-none"></div>
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-white/5 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F02D7D]/10 text-[#F02D7D] rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles size={12} />
            AI Fitting Room
          </div>
          <h3 className="text-3xl lg:text-4xl font-bold tracking-tight">OutStyl Size Advisor</h3>
          <p className="text-app-text-secondary text-base">Enter your proportions and let AI reveal your perfect garment sizing.</p>
        </div>
        
        {/* Unit Selector */}
        <div className="flex bg-white/5 rounded-xl p-1 self-start md:self-center border border-white/5">
          <button
            onClick={() => handleUnitChange('metric')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              unitSystem === 'metric' 
                ? 'bg-gradient-to-r from-[#F02D7D] to-white text-[#0B0B0F] shadow-md shadow-[#F02D7D]/20' 
                : 'text-app-text-secondary hover:text-white'
            }`}
          >
            Metric (cm/kg)
          </button>
          <button
            onClick={() => handleUnitChange('imperial')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              unitSystem === 'imperial' 
                ? 'bg-gradient-to-r from-[#F02D7D] to-white text-[#0B0B0F] shadow-md shadow-[#F02D7D]/20' 
                : 'text-app-text-secondary hover:text-white'
            }`}
          >
            Imperial (in/lbs)
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!recommendation && !loading && (
          <motion.div
            key="input-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-8"
          >
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column: Gender, Height, Weight */}
              <div className="space-y-6">
                {/* Gender selection */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-app-text-secondary block mb-3 ml-2">
                    Gender Identity
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['male', 'female', 'unisex'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={`py-3.5 px-4 rounded-2xl border text-sm font-bold capitalize transition-all ${
                          gender === g 
                            ? 'bg-white/10 border-[#F02D7D] text-white shadow-[0_0_15px_rgba(240,45,125,0.15)]' 
                            : 'bg-white/5 border-white/10 text-app-text-secondary hover:text-white hover:border-white/25'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Height Selector */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm px-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-app-text-secondary flex items-center gap-1.5">
                      <Ruler size={14} /> Height
                    </span>
                    <span className="text-white font-bold text-lg">
                      {height} {unitSystem === 'metric' ? 'cm' : 'in'}
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <input
                      type="range"
                      min={unitSystem === 'metric' ? 120 : 45}
                      max={unitSystem === 'metric' ? 220 : 85}
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full accent-[#F02D7D] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-app-text-secondary/50 font-bold mt-2 px-1">
                      <span>{unitSystem === 'metric' ? '120 cm' : '45 in'}</span>
                      <span>{unitSystem === 'metric' ? '220 cm' : '85 in'}</span>
                    </div>
                  </div>
                </div>

                {/* Weight Selector */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm px-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-app-text-secondary flex items-center gap-1.5">
                      <Scale size={14} /> Weight
                    </span>
                    <span className="text-white font-bold text-lg">
                      {weight} {unitSystem === 'metric' ? 'kg' : 'lbs'}
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <input
                      type="range"
                      min={unitSystem === 'metric' ? 30 : 70}
                      max={unitSystem === 'metric' ? 150 : 330}
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full accent-[#F02D7D] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-app-text-secondary/50 font-bold mt-2 px-1">
                      <span>{unitSystem === 'metric' ? '30 kg' : '70 lbs'}</span>
                      <span>{unitSystem === 'metric' ? '150 kg' : '330 lbs'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Fit Preference & Advanced Toggle */}
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-app-text-secondary block mb-3 ml-2">
                    Fit Preference
                  </label>
                  <div className="space-y-3">
                    {fitPreferences.map((pref) => (
                      <button
                        key={pref.id}
                        onClick={() => setFitPreference(pref.id)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                          fitPreference === pref.id
                            ? 'bg-[#F02D7D]/5 border-[#F02D7D] text-white shadow-[0_0_15px_rgba(240,45,125,0.1)]'
                            : 'bg-white/5 border-white/10 text-app-text-secondary hover:text-white hover:border-white/20'
                        }`}
                      >
                        <div className="pr-4">
                          <p className="font-bold text-sm text-white">{pref.label}</p>
                          <p className="text-xs text-app-text-secondary mt-0.5">{pref.desc}</p>
                        </div>
                        {fitPreference === pref.id && (
                          <div className="w-6 h-6 bg-[#F02D7D] rounded-full flex items-center justify-center text-[#0B0B0F]">
                            <Check size={14} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advanced optional fields dropdown */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs font-bold uppercase tracking-widest text-white"
                  >
                    <span className="flex items-center gap-2">
                      <Sliders size={14} className="text-[#F02D7D]" />
                      Advanced Body Metrics (Optional)
                    </span>
                    <span className="text-[#F02D7D]">{showAdvanced ? 'Hide' : 'Expand'}</span>
                  </button>
                  
                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-4 grid grid-cols-3 gap-3"
                      >
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-app-text-secondary uppercase tracking-wider block ml-1">Chest</label>
                          <input
                            type="number"
                            placeholder={unitSystem === 'metric' ? 'cm' : 'in'}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F02D7D] text-sm text-white"
                            value={chest}
                            onChange={(e) => setChest(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-app-text-secondary uppercase tracking-wider block ml-1">Waist</label>
                          <input
                            type="number"
                            placeholder={unitSystem === 'metric' ? 'cm' : 'in'}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F02D7D] text-sm text-white"
                            value={waist}
                            onChange={(e) => setWaist(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-app-text-secondary uppercase tracking-wider block ml-1">Hips</label>
                          <input
                            type="number"
                            placeholder={unitSystem === 'metric' ? 'cm' : 'in'}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F02D7D] text-sm text-white"
                            value={hips}
                            onChange={(e) => setHips(e.target.value)}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Error messaging */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Calculate Button */}
            <button
              onClick={handleRecommend}
              className="w-full glow-button py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3"
            >
              <Sparkles size={22} className="animate-pulse" />
              Tailor My Fit with AI
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full border-2 border-t-[#F02D7D] border-white/5 animate-spin"></div>
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#F02D7D] animate-pulse" size={32} />
            </div>
            <h4 className="text-2xl font-bold mb-2">Analyzing Measurements</h4>
            <p className="text-gradient font-semibold text-lg max-w-sm animate-pulse">{loadingStep}</p>
          </motion.div>
        )}

        {/* Recommendation Results */}
        {recommendation && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Primary Recommendation Banner */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 lg:p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] -z-10"></div>
              
              <div className="flex flex-col items-center shrink-0">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-[#F02D7D]/20 to-white/10 flex flex-col items-center justify-center border border-[#F02D7D]/30 shadow-[0_0_25px_rgba(240,45,125,0.15)] relative">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F02D7D] opacity-80 mb-1">AI Recommendation</span>
                  <span className="text-5xl font-black text-white filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">{recommendation.recommendedSize}</span>
                </div>
              </div>

              <div className="space-y-3 flex-grow text-center md:text-left">
                <h4 className="text-2xl font-bold">Your Ideal Fit is Size {recommendation.recommendedSize}</h4>
                <p className="text-app-text-secondary leading-relaxed text-sm md:text-base">
                  {recommendation.reasoning}
                </p>
              </div>
            </div>

            {/* Category Breakdown Table */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-app-text-secondary mb-4 ml-2">Garment breakdowns</h5>
              <div className="grid md:grid-cols-3 gap-4">
                {recommendation.breakdown.map((item, idx) => (
                  <div key={idx} className="glass-card p-6 border border-white/5 bg-white/[0.01] hover:bg-white/5 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold text-app-text-secondary uppercase tracking-wider block">{item.category}</span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#F02D7D]/10 text-[#F02D7D] text-xs font-extrabold border border-[#F02D7D]/20">{item.size}</span>
                    </div>
                    <p className="text-xs text-app-text-secondary leading-relaxed">{item.fitNotes}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Luxury Style Advice */}
            <div className="bg-gradient-to-r from-white/5 to-[#F02D7D]/5 border border-[#F02D7D]/20 rounded-3xl p-8">
              <h5 className="text-xs font-extrabold uppercase tracking-widest text-[#F02D7D] mb-6 flex items-center gap-2">
                <Sparkles size={14} /> Luxury Proportion & Style Tips
              </h5>
              <ul className="space-y-4">
                {recommendation.styleTips.map((tip, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-app-text-secondary leading-relaxed">
                    <span className="font-extrabold text-[#F02D7D] select-none text-base shrink-0">0{idx + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5 transition-colors text-xs font-bold uppercase tracking-widest text-white py-4 rounded-2xl"
            >
              <RotateCcw size={14} /> Re-Calculate Size
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
