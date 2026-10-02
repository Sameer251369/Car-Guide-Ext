import React from 'react';
import { Mail, Phone, ArrowUpRight, Globe, Camera, Mic, Radio } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@1,800;1,900&family=Barlow:wght@400;500;600&display=swap');
.cg-display{font-family:'Barlow Condensed',Impact,sans-serif;font-style:italic;font-weight:900;text-transform:uppercase;letter-spacing:-0.01em;line-height:.88}
.cg-body{font-family:'Barlow',system-ui,sans-serif}
.cg-glass{background:rgba(255,255,255,.05);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.12)}
`;

const stats = [
  ['650M+', 'total video views'],
  ['535K+', 'YouTube subscribers'],
  ['245K+', 'Facebook followers'],
  ['155K+', 'Instagram followers'],
  ['500+', 'vehicles reviewed'],
  ['6+', 'years on air'],
];

const shows = [
  ['Bangkok International Motor Show', 'Invited by the Grand Prix Team every year since 2023', 'Thailand'],
  ['Dubai International Motor Show', 'Luxury and supercar coverage from the UAE', 'UAE'],
  ['Singapore Motorshow 2025', 'Asia-Pacific EV and hybrid launches', 'Singapore'],
  ['Indonesia International Motor Show', 'Direct reporting on ASEAN debuts', 'Indonesia'],
  ['GAIKINDO (GIIAS)', 'Global concept unveilings', 'Indonesia'],
];

const hits = [
  ['27 KMPL Grand Vitara', 'Real mileage and performance with 280Nm of torque'],
  ['Ford Endeavour 2024', 'Back in India: import rules and the Fortuner rivalry'],
  ['BYD Seal U', 'Is it better than an EV? First-drive impressions'],
  ['Best 7 seater under ₹10L', 'Space, comfort and budget compared'],
  ['Honda 7 seater', 'Crash-test scores and 5-star safety'],
  ['Honda HR-V 2023', '₹20 lakh: is it the best SUV option?'],
];

const ages = [
  ['18–24', 37.3], ['25–34', 39.2], ['35–44', 16.7], ['45–54', 4.7], ['55+', 2.1],
];
const ageShade = ['bg-red-600', 'bg-red-500', 'bg-red-400/80', 'bg-white/40', 'bg-white/25'];

const services = [
  ['Drive reviews', 'Scripted, professionally shot video and written reviews, published across every platform.'],
  ['Event coverage', 'Launches, press conferences, national motor shows and unveilings.'],
  ['Custom content', 'Reels, videos, articles, posts and travel vlogs built around your vehicle’s features.'],
  ['A trusted voice', 'Our official role in the IVA Indian Vehicle Awards backs every collaboration.'],
];

const gear = [
  [Camera, 'Visuals and aerials', 'Sony Cinema Line full-frame 4K, DJI drones, DJI gimbals and the latest GoPro action cams.'],
  [Mic, 'Audio', 'Rode and DJI wireless microphone systems for clean voice capture on location.'],
  [Radio, 'Studio and post', 'Broadcast-grade lighting rigs and a dedicated editing suite.'],
];

const brands = [
  'Maruti Suzuki', 'Hyundai', 'Tata Motors', 'Mahindra', 'Kia', 'BMW', 'Volvo', 'MG Motor',
  'TVS Motor', 'Ather Energy', 'Ola Electric', 'Yamaha', 'Bajaj', 'Honda', 'Kinetic', 'Okinawa',
  'KTM', 'Lectrix', 'Boodmo', 'Spinny', 'Cars24', 'Droom', 'JBL Harman', '70mai',
  'Michelin', 'Bank of Baroda', 'IDFC FIRST Bank', 'ACKO Insurance', 'PolicyBazaar', 'ITC Hotels',
  'Delhi Comic Con', 'Ultraviolette', 'Involve Perfumes', 'ZEVpoint', 'Daewoo', 'Qubo',
];

const team = [
  ['Rishabh Arora', 'Founder and host', 'Face of Car Guide Media with over 6 years in automotive journalism.'],
  ['Avinash Singh', 'Videographer', 'High-speed track capture, outdoor review setups and dynamic camera work.'],
  ['Vishal Kumar', 'Cinematographer', '4K full-frame visuals, drone cinematography and studio setups.'],
  ['Indrajeet Singh', 'Video editor', 'Crisp, fast-paced review edits and broadcast-quality motor show features.'],
  ['Harshit Jangra', 'Video editor', 'Social reels, short-form vlogs and motion graphics.'],
];

export default function About() {
  return (
    <>
      <SEOHead
        title="About Us | Car Guide Media - India's Leading Voice in Automotive Media"
        description="Learn about Rishabh Arora and Car Guide Media. Over 6 years of automotive journalism, 650M+ views, 535K+ YouTube subscribers, international motor show coverage, and brand collaborations."
      />
      <style>{FONT_CSS}</style>

      <div className="cg-body bg-black text-white min-h-screen selection:bg-red-600">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="pointer-events-none absolute -top-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-red-600/40 blur-[140px]" />
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 pt-20 pb-14 md:pt-32">
            <p className="text-sm text-white/60 mb-6">India’s leading voice in automotive media</p>
            <h1 className="cg-display text-[22vw] sm:text-[17vw] lg:text-[13rem]">
              Car Guide
              <span className="block text-red-600">Media</span>
            </h1>
            <div className="mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <p className="max-w-xl text-lg text-white/70 leading-relaxed">
                Honest car, bike and scooter reviews, state-wise tax calculators and international motor show coverage, in English and Hindi.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.youtube.com/@CarGuideMedia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-red-600 px-6 py-3.5 font-semibold hover:bg-red-500 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Subscribe on YouTube <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 border border-white/30 px-6 py-3.5 font-semibold hover:bg-white hover:text-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Partner with us
                </a>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 pb-16">
            <dl className="cg-glass grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 rounded-2xl divide-white/10 [&>div]:p-6 divide-x divide-y lg:divide-y-0">
              {stats.map(([v, l]) => (
                <div key={l}>
                  <dt className="cg-display text-4xl sm:text-5xl">{v}</dt>
                  <dd className="mt-2 text-sm text-white/60">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* FOUNDER */}
        <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20 md:py-28 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <div className="cg-glass rounded-2xl p-8">
              <div className="cg-display flex h-28 w-28 items-center justify-center rounded-full bg-red-600 text-5xl">RA</div>
              <h2 className="cg-display mt-6 text-5xl">Rishabh Arora</h2>
              <p className="mt-2 text-white/60">Founder and lead host</p>
              <dl className="mt-6 divide-y divide-white/10 border-t border-white/10 text-sm">
                {[['Experience', '6+ years in automotive journalism'], ['Coverage', 'Domestic and international'], ['Languages', 'English and Hindi']].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-3">
                    <dt className="text-white/50">{k}</dt>
                    <dd className="text-right font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="lg:col-span-7 lg:pt-4">
            <h2 className="cg-display text-5xl sm:text-7xl">Six years of straight talk on cars</h2>
            <blockquote className="mt-8 border-l-4 border-red-600 pl-6 text-xl leading-relaxed text-white/85 max-w-2xl">
              “Hi, my name is Rishabh Arora and I am the founder and the host at Car Guide Media. For over six years, Car Guide has been at the forefront of automotive journalism in India, delivering engaging, authentic, and unbiased content to millions of automobile enthusiasts all around the globe.”
            </blockquote>
            <p className="mt-8 max-w-2xl text-white/60 leading-relaxed">
              Over 650,000,000 views and more than 500 cars, bikes and scooters reviewed. From track testing at the Buddh International Circuit to invitations at the Bangkok, Dubai, Singapore and Indonesia motor shows, we give Indian buyers raw, factual and transparent insight, with no sugarcoating on road tax, pricing or performance.
            </p>
          </div>
        </section>

        {/* INTERNATIONAL */}
        <section className="bg-white text-black">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 md:py-28">
            <div className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-5">
                <h2 className="cg-display text-6xl sm:text-8xl">On the ground, worldwide</h2>
                <p className="mt-6 max-w-md text-black/65 leading-relaxed">
                  Every year since 2023 the Grand Prix Team has invited us to cover the Bangkok International Motor Show, and we report firsthand from major shows across Dubai, Singapore and Indonesia.
                </p>
              </div>
              <ul className="lg:col-span-7 divide-y divide-black/15 border-y border-black/15">
                {shows.map(([n, d, c]) => (
                  <li key={n} className="flex items-start justify-between gap-6 py-6">
                    <div>
                      <h3 className="text-xl font-semibold">{n}</h3>
                      <p className="mt-1 text-sm text-black/60">{d}</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-red-600">
                      <Globe className="h-4 w-4" /> {c}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <h3 className="cg-display mt-24 text-4xl sm:text-5xl">Videos people keep watching</h3>
            <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-black/15 border border-black/15">
              {hits.map(([t, d]) => (
                <li key={t} className="bg-white p-6">
                  <h4 className="text-lg font-bold">{t}</h4>
                  <p className="mt-2 text-sm text-black/60">{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* AUDIENCE */}
        <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20 md:py-28 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <h2 className="cg-display text-5xl sm:text-7xl">Buyers about to decide</h2>
            <p className="mt-6 max-w-lg text-white/65 leading-relaxed">
              Our viewers are active decision-makers aged 18 to 44 who check our unbiased reviews before buying a vehicle between ₹5 lakh and ₹1 crore.
            </p>
            <div className="mt-8 flex gap-10">
              <div><div className="cg-display text-6xl text-red-600">94.4%</div><div className="mt-1 text-sm text-white/60">male audience</div></div>
              <div><div className="cg-display text-6xl">76.5%</div><div className="mt-1 text-sm text-white/60">aged 18 to 34</div></div>
            </div>
          </div>

          <div className="cg-glass rounded-2xl p-8">
            <h3 className="font-semibold">Audience by age</h3>
            <div className="mt-5 flex h-14 overflow-hidden rounded-lg" role="img" aria-label="Age distribution bar">
              {ages.map(([a, p], i) => (
                <div key={a} className={ageShade[i]} style={{ width: `${p}%` }} />
              ))}
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              {ages.map(([a, p], i) => (
                <li key={a} className="flex items-center justify-between">
                  <span className="flex items-center gap-3"><span className={`h-3 w-3 rounded-sm ${ageShade[i]}`} />{a} years</span>
                  <span className="font-semibold">{p}%</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* SERVICES + GEAR */}
        <section className="border-y border-white/10 bg-red-600">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 md:py-28">
            <h2 className="cg-display text-5xl sm:text-7xl max-w-3xl">What we make for your brand</h2>
            <p className="mt-5 max-w-xl text-white/90">
              We’ve worked with OEMs, service providers and suppliers, and we build every campaign around return on investment.
            </p>
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-black/30 border border-black/30">
              {services.map(([t, d]) => (
                <div key={t} className="bg-red-600 p-6 hover:bg-black transition">
                  <h3 className="cg-display text-3xl">{t}</h3>
                  <p className="mt-3 text-sm text-white/85 leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20 md:py-28">
          <h2 className="cg-display text-5xl sm:text-7xl">Cinema-grade kit</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {gear.map(([Icon, t, d]) => (
              <div key={t} className="cg-glass rounded-2xl p-6">
                <Icon className="h-7 w-7 text-red-500" />
                <h3 className="mt-5 text-lg font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-white/60 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BRANDS */}
        <section className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 md:py-28">
            <h2 className="cg-display text-5xl sm:text-7xl">Brands we’ve worked with</h2>
            <p className="mt-5 max-w-xl text-white/60">
              Automotive OEMs, suppliers, insurers, accessory makers and financial institutions across India.
            </p>
            <p className="cg-display mt-10 text-3xl sm:text-5xl leading-[1.15] text-white/35">
              {brands.map((b) => (
                <span key={b} className="hover:text-white transition-colors">
                  {b}<span className="text-red-600"> / </span>
                </span>
              ))}
            </p>
          </div>
        </section>

        {/* TEAM */}
        <section className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 md:py-28">
            <h2 className="cg-display text-5xl sm:text-7xl">The crew behind the lens</h2>
            <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
              {team.map(([n, r, b]) => (
                <li key={n} className="grid md:grid-cols-12 gap-2 md:gap-6 py-6 items-baseline">
                  <h3 className="cg-display text-3xl md:col-span-4">{n}</h3>
                  <p className="md:col-span-3 font-semibold text-red-500">{r}</p>
                  <p className="md:col-span-5 text-sm text-white/60">{b}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="bg-white text-black">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 md:py-28">
            <h2 className="cg-display text-6xl sm:text-9xl">Let’s drive forward, together</h2>
            <p className="mt-6 max-w-xl text-black/65">
              Partner with a channel the automotive industry and millions of buyers trust, in India and abroad.
            </p>

            <div className="mt-12 grid md:grid-cols-3 gap-4">
              <div className="border border-black/20 p-6">
                <p className="text-sm text-black/50">Contact</p>
                <p className="mt-1 text-lg font-bold">Rishabh Arora</p>
                <p className="text-sm text-black/60">Founder and host</p>
              </div>
              <a href="mailto:Rishabh@thecarguide.in" className="border border-black/20 p-6 hover:bg-black hover:text-white transition">
                <Mail className="h-5 w-5 text-red-600" />
                <p className="mt-3 text-lg font-bold break-all">Rishabh@thecarguide.in</p>
                <p className="text-sm opacity-60 break-all">thecarguide.rishabh@gmail.com</p>
              </a>
              <a href="tel:+919872851996" className="border border-black/20 p-6 hover:bg-black hover:text-white transition">
                <Phone className="h-5 w-5 text-red-600" />
                <p className="mt-3 text-lg font-bold">+91-98728-51996</p>
                <p className="text-sm opacity-60">Direct media line</p>
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-semibold">
              {[['YouTube', 'https://youtube.com'], ['Instagram', 'https://instagram.com'], ['Facebook', 'https://facebook.com']].map(([n, u]) => (
                <a key={n} href={u} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-red-600">
                  {n}: Car Guide Media <ArrowUpRight className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}