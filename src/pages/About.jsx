import React from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Globe,
  Video,
  Camera,
  Mic,
  TrendingUp,
  Users,
  Mail,
  Phone,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Star,
  Play,
  Flame,
  BarChart3,
  Building2,
  Zap,
  ArrowRight,
  Tv,
  Eye,
  Radio,
  User,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import carGuideLogo from '../assets/Car Guide Media Logo Horizontal.png';

const YoutubeIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function About() {
  const stats = [
    { label: 'Total Video Views', value: '650,000,000+', icon: Eye, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'YouTube Subscribers', value: '535,000+', icon: YoutubeIcon, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Instagram Followers', value: '155,000+', icon: InstagramIcon, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { label: 'Facebook Community', value: '245,000+', icon: FacebookIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Vehicles Reviewed', value: '500+', icon: Video, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Years of Experience', value: '6+ Years', icon: Award, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const teamMembers = [
    { name: 'Rishabh Arora', role: 'Founder & Host', badge: 'Founder', bio: 'Host and face of Car Guide Media with over 6 years of automotive journalism expertise.' },
    { name: 'Avinash Singh', role: 'Videographer', badge: 'Production', bio: 'Expert in high-speed track capture, outdoor auto review setups, and dynamic camera work.' },
    { name: 'Vishal Kumar', role: 'Cinematographer', badge: 'Cinematography', bio: 'Specialist in 4K full-frame visual aesthetics, drone cinematography, and studio setups.' },
    { name: 'Indrajeet Singh', role: 'Video Editor', badge: 'Post-Production', bio: 'Crafts crisp, fast-paced review edits and broadcast-quality motor show features.' },
    { name: 'Harshit Jangra', role: 'Video Editor', badge: 'Post-Production', bio: 'Specializes in high-engagement social media reels, short-form vlogs, and motion graphics.' },
  ];

  const services = [
    {
      title: 'Drive Reviews',
      desc: 'Professionally shot, engaging scripted video and written reviews across all social media platforms.',
      icon: Video,
      gradient: 'from-red-500/20 to-amber-500/20',
    },
    {
      title: 'Event Coverage',
      desc: 'Comprehensive coverage of launch events, press conferences, national motor shows, and unveilings.',
      icon: Tv,
      gradient: 'from-blue-500/20 to-indigo-500/20',
    },
    {
      title: 'Custom Content Creation',
      desc: 'On-demand and tailored campaigns to highlight unique vehicle features in reels, videos, articles, posts, and travel vlogs.',
      icon: Sparkles,
      gradient: 'from-purple-500/20 to-pink-500/20',
    },
    {
      title: 'Credibility & Trust',
      desc: 'Leverage our reputation as a trusted voice in the industry, including our official role in the IVA Indian Vehicle Awards.',
      icon: ShieldCheck,
      gradient: 'from-emerald-500/20 to-teal-500/20',
    },
  ];

  const gearSpecs = [
    { title: 'Visuals & Aerials', detail: 'Sony Cinema Line Full-Frame 4K, DJI Drones, DJI Gimbals & latest GoPro Action Cams.', icon: Camera },
    { title: 'Audio Excellence', detail: 'Professional Rode & DJI Wireless Microphone Systems for crystal-clear voice clarity.', icon: Mic },
    { title: 'Studio & Post-Production', detail: 'Broadcast-grade lighting rigs & dedicated post-production editing suite.', icon: Radio },
  ];

  const internationalShows = [
    { name: 'Bangkok International Motor Show', detail: 'Invited by Grand Prix Team annually since 2023', badge: 'Annual Flagship' },
    { name: 'Dubai International Motor Show', detail: 'Firsthand luxury & supercar coverage from UAE', badge: 'Middle East' },
    { name: 'Singapore Motorshow 2025', detail: 'Exclusive Asia-Pacific EV & hybrid launches', badge: 'ASEAN' },
    { name: 'Indonesia International Motor Show (IIMS)', detail: 'Direct reporting on ASEAN automotive debuts', badge: 'International' },
    { name: 'GAIKINDO (GIIAS) Indonesia', detail: 'Firsthand coverage of global concept unveilings', badge: 'Global Auto Show' },
  ];

  const brandLogos = [
    'Maruti Suzuki', 'Hyundai', 'Tata Motors', 'Mahindra', 'Kia', 'BMW', 'Volvo', 'MG Motor',
    'TVS Motor', 'Ather Energy', 'Ola Electric', 'Yamaha', 'Bajaj', 'Honda', 'Kinetic', 'Okinawa',
    'KTM', 'Lectrix', 'Boodmo', 'Spinny', 'Cars24', 'Droom', 'JBL Harman', '70mai',
    'Michelin', 'Bank of Baroda', 'IDFC FIRST Bank', 'ACKO Insurance', 'PolicyBazaar', 'ITC Hotels',
    'Delhi Comic Con', 'Ultraviolette', 'Involve Perfumes', 'ZEVpoint', 'Daewoo', 'Qubo'
  ];

  const ageDemographics = [
    { age: '18 - 24 Yrs', pct: '37.3%', width: 'w-[37.3%]', color: 'bg-red-500' },
    { age: '25 - 34 Yrs', pct: '39.2%', width: 'w-[39.2%]', color: 'bg-amber-500' },
    { age: '35 - 44 Yrs', pct: '16.7%', width: 'w-[16.7%]', color: 'bg-emerald-500' },
    { age: '45 - 54 Yrs', pct: '4.7%', width: 'w-[4.7%]', color: 'bg-blue-500' },
    { age: '55+ Yrs', pct: '2.1%', width: 'w-[2.1%]', color: 'bg-purple-500' },
  ];

  return (
    <>
      <SEOHead
        title="About Us | Car Guide Media - India's Leading Voice in Automotive Media"
        description="Learn about Rishabh Arora and Car Guide Media. Over 6 years of automotive journalism, 650M+ views, 535K+ YouTube subscribers, international motor show coverage, and brand collaborations."
      />

      <div className="bg-slate-950 text-slate-100 min-h-screen">
        {/* HERO BANNER SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-16 md:py-24 border-b border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(220,38,38,0.25),rgba(255,255,255,0))] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-400">
                <Flame className="h-4 w-4 text-red-500" />
                India's No.1 Automobile Channel
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
                CAR GUIDE <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-amber-500">MEDIA</span>
              </h1>

              <p className="text-lg sm:text-xl font-medium text-slate-300">
                India's Leading Voice in Automotive Media
              </p>

              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto pt-2">
                Delivering engaging, authentic, and unbiased automotive reviews, state tax calculators, and international auto show coverage in English and Hindi.
              </p>

              <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700"
                >
                  <YoutubeIcon className="h-5 w-5" />
                  Subscribe on YouTube (535K+)
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                >
                  <Mail className="h-4 w-4 text-amber-400" />
                  Partner With Us
                </a>
              </div>
            </div>

            {/* KEY METRICS GRID */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 text-center backdrop-blur transition hover:border-slate-700 hover:bg-slate-900"
                  >
                    <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white">{stat.value}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-400">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FOUNDER & STORY SECTION */}
        <section className="py-16 md:py-20 border-b border-slate-900 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-5 space-y-6">
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-tr from-slate-900 to-slate-800 p-8 shadow-2xl">
                  <div className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold px-3 py-1 rounded-full">
                    Founder & Host
                  </div>
                  
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-3xl font-black text-white shadow-lg mb-6">
                    RA
                  </div>

                  <h3 className="text-2xl font-black text-white">Rishabh Arora</h3>
                  <p className="text-sm font-semibold text-amber-400">Founder & Lead Host at Car Guide Media</p>
                  
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Experience:</span>
                      <strong className="text-white">6+ Years in Automotive Journalism</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Coverage:</span>
                      <strong className="text-white">Domestic & International</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Languages:</span>
                      <strong className="text-white">English & Hindi</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-red-500">Our Founder's Note</span>
                <h2 className="text-3xl sm:text-4xl font-black text-white">
                  6+ Years of Driving Trust & Automotive Journalism
                </h2>
                
                <blockquote className="border-l-4 border-amber-500 pl-4 py-2 text-slate-300 italic text-base leading-relaxed">
                  "Hi, my name is <strong className="text-white font-semibold">Rishabh Arora</strong> and I am the founder and the host at Car Guide Media. For over <strong className="text-amber-400 font-semibold">six years</strong>, Car Guide has been at the forefront of automotive journalism in India, delivering engaging, authentic, and unbiased content to millions of automobile enthusiasts all around the globe."
                </blockquote>

                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                  With over <strong className="text-white">650,000,000 views</strong> since inception, we have reviewed more than <strong className="text-amber-400">500 cars, bikes, and scooters</strong>. From high-speed track testing at the Buddh International Circuit to exclusive invitations to the Bangkok, Dubai, Singapore, and Indonesia motor shows, we provide Indian consumers with raw, factual, and transparent insights.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 pt-4">
                  <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-6 w-6 text-emerald-400" />
                      <div>
                        <h4 className="text-sm font-bold text-white">Unbiased & Authentic</h4>
                        <p className="text-xs text-slate-400">No sugarcoating. Factual road-tax, pricing, & performance analysis.</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                    <div className="flex items-center gap-3">
                      <Globe className="h-6 w-6 text-blue-400" />
                      <div>
                        <h4 className="text-sm font-bold text-white">Global Track Record</h4>
                        <p className="text-xs text-slate-400">Firsthand international debuts from Bangkok to Dubai & Singapore.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* INTERNATIONAL EXPERIENCE */}
        <section className="py-16 md:py-20 border-b border-slate-900 bg-slate-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">Global Presence</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">Our International Experience</h2>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                Every year since 2023, we've been invited by the <strong className="text-white">Grand Prix Team</strong> to cover the <strong className="text-amber-400">Bangkok International Motor Show</strong>. Our team delivers exclusive international content, providing firsthand coverage from major auto shows across Dubai, Singapore, and Indonesia.
              </p>
            </div>

            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {internationalShows.map((show, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3 relative hover:border-red-500/50 transition">
                  <div className="flex items-center justify-between">
                    <Globe className="h-6 w-6 text-red-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-amber-400 px-2.5 py-1 rounded-md">
                      {show.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{show.name}</h3>
                  <p className="text-xs text-slate-400">{show.detail}</p>
                </div>
              ))}
            </div>

            {/* POPULAR INTERNATIONAL & TRENDING REVIEWS SHOWCASE */}
            <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-950 p-6 lg:p-8">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2 mb-6">
                <Play className="h-5 w-5 text-red-500 fill-red-500" />
                Featured Editorial Video Hits
              </h3>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                  <span className="text-red-400 font-bold">27 KMPL Grand Vitara</span>
                  <h4 className="text-sm font-extrabold text-white">280Nm Torque Real Mileage & Performance</h4>
                  <p className="text-slate-400 text-[11px]">In-depth highway and city fuel economy real-world test.</p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                  <span className="text-amber-400 font-bold">Ford Endeavour 2024</span>
                  <h4 className="text-sm font-extrabold text-white">Endeavour is Back in India</h4>
                  <p className="text-slate-400 text-[11px]">Exclusive breakdown of import rules & Fortuner rivalry.</p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                  <span className="text-emerald-400 font-bold">BYD Seal U Review</span>
                  <h4 className="text-sm font-extrabold text-white">Is BYD Seal U Better Than an EV?</h4>
                  <p className="text-slate-400 text-[11px]">International first-drive experience and tech breakdown.</p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                  <span className="text-purple-400 font-bold">Best 7 Seater Under ₹10L</span>
                  <h4 className="text-sm font-extrabold text-white">7 Seater Buying Guide</h4>
                  <p className="text-slate-400 text-[11px]">Practicality, seating comfort, and budget analysis.</p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                  <span className="text-blue-400 font-bold">Honda 7 Seater</span>
                  <h4 className="text-sm font-extrabold text-white">5 Star Safety Rating Review</h4>
                  <p className="text-slate-400 text-[11px]">Crash test scores, build quality, and family drive comfort.</p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                  <span className="text-pink-400 font-bold">Honda HRV 2023</span>
                  <h4 className="text-sm font-extrabold text-white">₹20 Lakh Mein Best SUV Option?</h4>
                  <p className="text-slate-400 text-[11px]">Detailed review on feature set, drive dynamics, and pricing.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AUDIENCE DEMOGRAPHICS & INSIGHTS */}
        <section className="py-16 md:py-20 border-b border-slate-900 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-red-500">Audience Demographics & Insights</span>
                <h2 className="text-3xl sm:text-4xl font-black text-white">High-Intent Automotive Audience</h2>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                  Our content reaches millions of high-intent car buyers and motorcycle enthusiasts across India. The audience is overwhelmingly composed of active decision-makers in the 18 to 44 age brackets who rely on our unbiased reviews before finalizing their ₹5 Lakh to ₹1 Crore vehicle purchases.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
                    <div className="text-2xl font-black text-red-500">94.4%</div>
                    <div className="text-xs font-semibold text-slate-400 mt-1">Male Audience</div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
                    <div className="text-2xl font-black text-amber-400">76.5%</div>
                    <div className="text-xs font-semibold text-slate-400 mt-1">Core Age (18 - 34 Yrs)</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:p-8 space-y-6">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-400" />
                  Age Group Distribution
                </h3>

                <div className="space-y-4">
                  {ageDemographics.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-300">
                        <span>{item.age}</span>
                        <span className="text-white">{item.pct}</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: item.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* HOW WE AMPLIFY YOUR BRAND'S REACH */}
        <section className="py-16 md:py-20 border-b border-slate-900 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">Brand Collaboration & Services</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">How We Amplify Your Brand's Reach</h2>
              <p className="text-sm sm:text-base text-slate-400">
                We've partnered with a wide range of OEMs, service providers, and suppliers, delivering promising results and maximum return on investments.
              </p>
            </div>

            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((srv, idx) => {
                const Icon = srv.icon;
                return (
                  <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4 hover:border-slate-700 transition">
                    <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-red-500">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{srv.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{srv.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PROFESSIONAL GEAR & PRODUCTION SUITE */}
        <section className="py-16 md:py-20 border-b border-slate-900 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 lg:p-12">
              <div className="max-w-3xl space-y-3 mb-10">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Cinema-Grade Setup</span>
                <h2 className="text-3xl font-black text-white">Professional Gear. Premium Output.</h2>
                <p className="text-sm text-slate-400">
                  In alignment with our commitment to premium standards, we utilize a cinema-grade production suite for world-class storytelling.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {gearSpecs.map((gear, idx) => {
                  const Icon = gear.icon;
                  return (
                    <div key={idx} className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-6 space-y-3">
                      <Icon className="h-7 w-7 text-red-500" />
                      <h3 className="text-base font-bold text-white">{gear.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{gear.detail}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* BRAND COLLABORATIONS LOGOS CLUSTER */}
        <section className="py-16 md:py-20 border-b border-slate-900 bg-slate-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">Trusted Partners</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">Our Brand Collaborations</h2>
              <p className="text-sm text-slate-400 max-w-2xl mx-auto">
                Trusted by top automotive OEMs, tier-1 suppliers, insurance platforms, accessories, and financial institutions across India.
              </p>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-3">
              {brandLogos.map((brand, idx) => (
                <span
                  key={idx}
                  className="rounded-lg border border-slate-800 bg-slate-900/80 px-4 py-2 text-xs font-bold text-slate-300 hover:border-slate-600 hover:text-white hover:bg-slate-800 transition"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* MEET OUR TEAM */}
        <section className="py-16 md:py-20 border-b border-slate-900 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">Behind The Lens</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">Meet Our Team</h2>
              <p className="text-sm text-slate-400">
                The passionate media professionals bringing high-quality automotive stories to millions.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {teamMembers.map((member, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-center space-y-3 hover:border-slate-700 transition">
                  <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-lg font-black text-white shadow-md">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{member.name}</h3>
                    <p className="text-xs text-amber-400 font-medium">{member.role}</p>
                  </div>
                  <span className="inline-block text-[10px] font-extrabold uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    {member.badge}
                  </span>
                  <p className="text-[11px] text-slate-400 leading-tight">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT & CALL TO ACTION SECTION */}
        <section id="contact" className="py-16 md:py-24 bg-gradient-to-b from-slate-950 to-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/30 p-8 lg:p-12 text-center space-y-6 shadow-2xl">
              
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Let's Drive Forward, Together.
              </span>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Our Credibility is Our Currency
              </h2>

              <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                Partner with a brand that has earned the trust of the automotive industry and millions of vehicle buyers across India and internationally.
              </p>

              <div className="pt-4 grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <User className="h-4 w-4" /> Rishabh Arora
                  </div>
                  <p className="text-xs text-slate-300">Founder & Host</p>
                </div>

                <a href="mailto:Rishabh@thecarguide.in" className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-1 hover:border-red-500/50 transition">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                    <Mail className="h-4 w-4" /> Rishabh@thecarguide.in
                  </div>
                  <p className="text-[11px] text-slate-400">thecarguide.rishabh@gmail.com</p>
                </a>

                <a href="tel:+919872851996" className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-1 hover:border-emerald-500/50 transition">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Phone className="h-4 w-4" /> +91-98728-51996
                  </div>
                  <p className="text-xs text-slate-400">Direct Media Line</p>
                </a>
              </div>

              <div className="pt-6 flex flex-wrap justify-center gap-6 text-sm font-bold text-slate-300">
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-red-400">
                  <YoutubeIcon className="h-5 w-5 text-red-500" /> YouTube: CAR GUIDE MEDIA
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-pink-400">
                  <InstagramIcon className="h-5 w-5 text-pink-500" /> Instagram: CAR GUIDE MEDIA
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-400">
                  <FacebookIcon className="h-5 w-5 text-blue-500" /> Facebook: CAR GUIDE MEDIA
                </a>
              </div>

            </div>
          </div>
        </section>

      </div>
    </>
  );
}
