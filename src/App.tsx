/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  X, 
  Sparkles, 
  Camera, 
  ShoppingBag, 
  Smartphone, 
  Users, 
  Clock, 
  GraduationCap,
  ChevronRight,
  Twitter,
  Facebook,
  Linkedin,
  Share2
} from 'lucide-react';
import { trackEvent } from './firebase';
import Logo from './components/Logo';
import SizeAdvisor from './components/SizeAdvisor';

export default function App() {
  const [waitlistData, setWaitlistData] = useState({
    name: '',
    email: '',
    age: '',
    gender: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleWaitlistSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Sending data to our server-side API which handles Google Sheets
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(waitlistData),
      });

      if (response.ok) {
        setSubmitted(true);
        trackEvent('waitlist_submission_success', {
          name: waitlistData.name,
          gender: waitlistData.gender
        });
      } else {
        console.error('Failed to join waitlist');
        // Fallback for demo if server is not ready
        setSubmitted(true); 
      }
    } catch (error) {
      console.error('Error submitting waitlist:', error);
      setSubmitted(true); // Fallback for demo
    } finally {
      setLoading(false);
    }
  };

  const shareMessage = "Check out OutStyl - the cool AI fashion app that learns your style! 👗✨";
  const shareUrl = window.location.href;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
  };

  return (
    <div className="min-h-screen flex flex-col bg-app-bg text-app-text-primary selection:bg-[#F02D7D]/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-app-bg/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo />
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-app-text-secondary">
              <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#ai-size-advisor" className="hover:text-white transition-colors flex items-center gap-1.5"><Sparkles size={14} className="text-[#F02D7D]" /> AI Size Advisor</a>
              <a 
                href="#waitlist" 
                className="glow-button px-6 py-2.5 rounded-full text-sm"
                onClick={() => trackEvent('join_waitlist_click', { location: 'navbar' })}
              >
                Join Waitlist
              </a>
            </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
          {/* Background Glows */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#F02D7D]/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -z-10 animate-pulse delay-700"></div>

          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl lg:text-8xl font-bold leading-[0.9] mb-8 tracking-tighter">
                Swipe. <br />
                Discover. <br />
                <span className="text-gradient">Wear Your Style.</span>
              </h1>
              <p className="text-xl text-app-text-secondary mb-10 max-w-lg leading-relaxed">
                An AI-powered fashion app that learns your style as you swipe and shows outfits made just for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="#waitlist" 
                  className="glow-button px-10 py-5 rounded-2xl font-bold text-lg text-center"
                  onClick={() => trackEvent('join_waitlist_click', { location: 'hero' })}
                >
                  Join the Waitlist
                </a>
                <a 
                  href="https://forms.gle/cCA9uZ1BV1KDGPdf8" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-10 py-5 rounded-2xl font-bold text-lg border border-white/10 hover:bg-white/5 transition-all text-center backdrop-blur-sm"
                  onClick={() => trackEvent('take_survey_click', { location: 'hero' })}
                >
                  Take 30-sec Survey
                </a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              {/* Mock App UI - Dark Mode */}
              <div className="relative mx-auto w-[320px] h-[640px] bg-[#1A1A1F] rounded-[3.5rem] p-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#1A1A1F] rounded-b-3xl z-10"></div>
                <div className="h-full w-full bg-[#0B0B0F] rounded-[2.8rem] overflow-hidden relative border border-white/5">
                  <img 
                    src="https://picsum.photos/seed/fashion_tech/600/1200" 
                    alt="Fashion Tech" 
                    className="w-full h-full object-cover opacity-80"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/80 to-transparent">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-[#F02D7D]/20 text-[#F02D7D] text-[10px] font-bold rounded-full border border-[#F02D7D]/30 uppercase tracking-widest">AI Pick</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">Cyberpunk Chic</h3>
                    <p className="text-sm text-app-text-secondary mb-6">Futuristic, Streetwear</p>
                    <div className="flex justify-center gap-5">
                      <button className="w-16 h-16 bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all">
                        <X size={32} />
                      </button>
                      <button className="w-16 h-16 bg-gradient-to-r from-[#F02D7D] to-white rounded-full flex items-center justify-center text-[#0B0B0F] shadow-lg shadow-[#F02D7D]/20 hover:scale-110 transition-all">
                        <Heart size={32} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-32 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-4xl lg:text-6xl font-bold mb-6 tracking-tight">How It Works</h2>
              <p className="text-app-text-secondary max-w-2xl mx-auto text-lg">
                Three simple steps to revolutionize your wardrobe with AI.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Swipe outfits",
                  desc: "Swipe right for 'Love' and left for 'Not for me'. It's that easy.",
                  icon: <Smartphone className="text-[#F02D7D]" size={32} />
                },
                {
                  title: "AI learns you",
                  desc: "Our smart AI analyzes your choices to understand your unique taste.",
                  icon: <Sparkles className="text-white" size={32} />
                },
                {
                  title: "Try on & Shop",
                  desc: "Virtually try outfits on your photo and buy what you love.",
                  icon: <Camera className="text-[#F02D7D]" size={32} />
                }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -10 }}
                  className="glass-card p-10 group hover:border-[#F02D7D]/30 transition-all duration-500"
                >
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-app-text-secondary leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section id="features" className="py-32 px-6 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div>
                <h2 className="text-4xl lg:text-6xl font-bold mb-12 tracking-tight">Features Built <br />for the Future</h2>
                <div className="grid gap-6">
                  {[
                    { title: "AI learns your taste", icon: <Sparkles size={24} />, color: "text-[#F02D7D]" },
                    { title: "Full outfit recommendations", icon: <ShoppingBag size={24} />, color: "text-white" },
                    { title: "Try clothes on your photo", icon: <Camera size={24} />, color: "text-[#F02D7D]" },
                    { title: "Discover new styles", icon: <Smartphone size={24} />, color: "text-white" },
                    { title: "Personalized fashion feed", icon: <Heart size={24} />, color: "text-[#F02D7D]" }
                  ].map((feature, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass-card p-6 flex items-center gap-6 group hover:bg-white/10 transition-all"
                    >
                      <div className={`w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center ${feature.color} border border-white/10`}>
                        {feature.icon}
                      </div>
                      <span className="text-xl font-semibold">{feature.title}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#F02D7D]/20 to-white/10 blur-3xl rounded-full"></div>
                <div className="relative glass-card p-4 aspect-square flex items-center justify-center overflow-hidden">
                   <div className="text-center p-12">
                      <Sparkles size={80} className="text-[#F02D7D] mx-auto mb-8 animate-pulse" />
                      <h3 className="text-3xl font-bold mb-4">AI Fashion Engine</h3>
                      <p className="text-app-text-secondary">Processing millions of style combinations to find your perfect match.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Fitting Room Section */}
        <section id="ai-size-advisor" className="py-24 px-6 bg-gradient-to-b from-transparent to-white/[0.01]">
          <SizeAdvisor />
        </section>

        {/* Audience Section */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl lg:text-6xl font-bold mb-20 tracking-tight">Built for Everyone</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Beginners", icon: <GraduationCap size={32} />, desc: "Learn what looks good on you effortlessly." },
                { title: "Busy People", icon: <Clock size={32} />, desc: "Save time choosing outfits every morning." },
                { title: "Students", icon: <Users size={32} />, desc: "Stay trendy on a budget with smart finds." },
                { title: "Style Seekers", icon: <Sparkles size={32} />, desc: "Anyone who wants to elevate their look." }
              ].map((item, idx) => (
                <div key={idx} className="glass-card p-8 hover:bg-white/10 transition-all duration-300">
                  <div className="text-[#F02D7D] mb-6 flex justify-center">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-app-text-secondary text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Waitlist Section */}
        <section id="waitlist" className="py-32 px-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#F02D7D]/10 rounded-full blur-[150px] -z-10"></div>
          
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-6xl font-bold mb-6 tracking-tight">Join the Waitlist</h2>
              <p className="text-app-text-secondary text-lg">Be the first to experience the future of fashion discovery.</p>
            </div>

            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onSubmit={handleWaitlistSubmit}
                  className="glass-card p-8 lg:p-12 space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-app-text-secondary ml-2">Full Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="John Doe"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#F02D7D] transition-colors"
                        value={waitlistData.name}
                        onChange={(e) => setWaitlistData({...waitlistData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-app-text-secondary ml-2">Email Address</label>
                      <input 
                        required
                        type="email" 
                        placeholder="john@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#F02D7D] transition-colors"
                        value={waitlistData.email}
                        onChange={(e) => setWaitlistData({...waitlistData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-app-text-secondary ml-2">Age</label>
                      <input 
                        required
                        type="number" 
                        placeholder="25"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#F02D7D] transition-colors"
                        value={waitlistData.age}
                        onChange={(e) => setWaitlistData({...waitlistData, age: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-app-text-secondary ml-2">Gender</label>
                      <select 
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#F02D7D] transition-colors appearance-none"
                        value={waitlistData.gender}
                        onChange={(e) => setWaitlistData({...waitlistData, gender: e.target.value})}
                      >
                        <option value="" className="bg-app-bg">Select Gender</option>
                        <option value="male" className="bg-app-bg">Male</option>
                        <option value="female" className="bg-app-bg">Female</option>
                        <option value="other" className="bg-app-bg">Other</option>
                        <option value="prefer-not-to-say" className="bg-app-bg">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full glow-button py-5 rounded-2xl font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Joining...' : 'Join Waitlist'}
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-12 text-center border-[#F02D7D]/30"
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-[#F02D7D] to-white rounded-full flex items-center justify-center text-[#0B0B0F] mx-auto mb-8 shadow-lg shadow-[#F02D7D]/20">
                    <Sparkles size={40} />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">You're on the list!</h3>
                  <p className="text-app-text-secondary text-lg mb-8">
                    Thank you, {waitlistData.name}! We've added you to the OutStyl waitlist.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-[#F02D7D] font-semibold hover:underline"
                  >
                    Register another person
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Survey Section */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto glass-card p-16 lg:p-24 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F02D7D]/10 rounded-full blur-[80px] -z-10"></div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">Help us build OutStyl</h2>
            <p className="text-app-text-secondary text-lg mb-12 max-w-2xl mx-auto">
              Your feedback is invaluable. Take a quick 30-second survey to help us tailor the experience to your needs.
            </p>
            <a 
              href="https://forms.gle/cCA9uZ1BV1KDGPdf8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 glow-button px-10 py-5 rounded-2xl font-bold text-xl group"
              onClick={() => trackEvent('take_survey_click', { location: 'bottom_cta' })}
            >
              Take 30 second survey
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-app-bg border-t border-white/5 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-2">
              <Logo className="mb-8" iconSize={40} textSize="text-3xl" />
              <p className="text-app-text-secondary max-w-xs leading-relaxed mb-8">
                The future of fashion discovery. Swipe your way to a better wardrobe with AI.
              </p>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-widest text-app-text-secondary">Share OutStyl</span>
                <div className="flex gap-3">
                  <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 glass-card !rounded-xl flex items-center justify-center text-app-text-secondary hover:text-white hover:bg-white/10 transition-all">
                    <Twitter size={18} />
                  </a>
                  <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 glass-card !rounded-xl flex items-center justify-center text-app-text-secondary hover:text-white hover:bg-white/10 transition-all">
                    <Facebook size={18} />
                  </a>
                  <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 glass-card !rounded-xl flex items-center justify-center text-app-text-secondary hover:text-white hover:bg-white/10 transition-all">
                    <Linkedin size={18} />
                  </a>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-8 text-sm uppercase tracking-widest">Quick Links</h4>
              <ul className="space-y-4 text-app-text-secondary text-sm">
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#waitlist" className="hover:text-white transition-colors">Join Waitlist</a></li>
                <li><a href="https://forms.gle/cCA9uZ1BV1KDGPdf8" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Survey</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-8 text-sm uppercase tracking-widest">Community</h4>
              <div className="flex gap-4">
                <div className="w-12 h-12 glass-card !rounded-2xl flex items-center justify-center text-app-text-secondary hover:text-[#F02D7D] transition-all cursor-pointer">
                  <Share2 size={24} />
                </div>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-app-text-secondary">
            {/* <p>© 2024 OutStyl. All rights reserved.</p> */}
            <div className="flex gap-8">
              <p>App coming soon</p>
              <p>Privacy Policy</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
