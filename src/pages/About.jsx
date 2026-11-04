import React from 'react';
import { Mail, Phone, ArrowUpRight, Globe, Camera, Mic, Radio, Check } from 'lucide-react';
import SEOHead from '../components/SEOHead';

/*
  About, in the same look as the on-road price calculator
  - Deep navy surfaces (#080b11 page, #0d1119 panels, #090c12 inner cards) with hairline white borders
  - One accent: amber #ffb020, used for the primary action, key numbers and icon chips
  - Soft grey-blue #dfe3e8 panels (like "Selected variant") carry the quote and the contact block
  - Emerald chips for small facts, same as "36 states / UT slabs"
  - Pill buttons, large rounded cards, one wide heavy display face for headings
  Layout rules so it holds on phones and laptops
  - One container (max-w-6xl) and one gutter everywhere
  - Every grid collapses to one column below md/lg; nothing is skewed, clipped or marquee-scrolled
  - Headings use clamp() sizes and break-words, so long words never push the page sideways
*/

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
.cg-display{font-family:'Syne','Plus Jakarta Sans',system-ui,sans-serif;font-weight:800;letter-spacing:-0.03em;line-height:1.05}
.cg-body{font-family:'Plus Jakarta Sans',system-ui,sans-serif}
`;

const wrap = 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8';
const section = 'py-14 sm:py-20';
const h2Cls = 'cg-display break-words text-[clamp(1.75rem,5vw,3rem)]';
const card = 'rounded-3xl border border-white/10 bg-[#0d1119]';
const inner = 'rounded-2xl border border-white/10 bg-[#090c12]';
const focus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb020] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080b11]';
const focusLight =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#dfe3e8]';

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
const ageShade = ['bg-[#ffb020]', 'bg-[#ffb020]/70', 'bg-[#ffb020]/45', 'bg-white/35', 'bg-white/20'];

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

const initials = (name) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);

export default function About() {
  return (
    <>
      <SEOHead
        title="About Us | Car Guide Media - India's Leading Voice in Automotive Media"
        description="Learn about Rishabh Arora and Car Guide Media. Over 6 years of automotive journalism, 650M+ views, 535K+ YouTube subscribers, international motor show coverage, and brand collaborations."
      />
      <style>{FONT_CSS}</style>

      <div className="cg-body min-h-screen overflow-x-clip bg-[#080b11] text-white selection:bg-[#ffb020] selection:text-black">
        {/* ================= HERO ================= */}
        <section className="relative overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-[#ffb020]/15 blur-[130px]" />
            <div className="absolute -left-40 top-1/2 h-[24rem] w-[24rem] rounded-full bg-sky-500/10 blur-[140px]" />
          </div>

          <div className={`${wrap} relative pb-10 pt-24 sm:pb-14 sm:pt-32`}>
            <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#ffb020]" aria-hidden="true" />
              <span className="truncate">India’s leading voice in automotive media</span>
            </p>

            <h1 className="cg-display mt-6 break-words text-[clamp(2.75rem,10vw,6.5rem)] leading-[0.98]">
              Car Guide
              <span className="block text-[#ffb020]">Media</span>
            </h1>

            <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <p className="max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
                Honest car, bike and scooter reviews, state-wise tax calculators and international motor show coverage, in English and Hindi.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="https://www.youtube.com/@CarGuideMedia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#ffb020] px-7 py-3.5 font-bold text-black transition-colors hover:bg-[#ffc24d] ${focus}`}
                >
                  Subscribe on YouTube <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="#contact"
                  className={`inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3.5 font-semibold transition-colors hover:bg-white/10 ${focus}`}
                >
                  Partner with us
                </a>
              </div>
            </div>

            {/* STATS */}
            <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-3 xl:grid-cols-6">
              {stats.map(([v, l], i) => (
                <div key={l} className="bg-[#0d1119] p-5 sm:p-6">
                  <dt className={`cg-display text-3xl sm:text-4xl ${i === 0 ? 'text-[#ffb020]' : ''}`}>{v}</dt>
                  <dd className="mt-2 text-sm text-white/60">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ================= FOUNDER ================= */}
        <section className={`${section} border-t border-white/10`}>
          <div className={`${wrap} grid gap-10 lg:grid-cols-12 lg:gap-12`}>
            <div className="lg:col-span-5">
              <div className={`${card} p-6 sm:p-8`}>
                <div className="flex items-center gap-4">
                  <span className="cg-display flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#ffb020] text-2xl text-black sm:h-20 sm:w-20 sm:text-3xl">
                    RA
                  </span>
                  <div className="min-w-0">
                    <h2 className="cg-display break-words text-2xl sm:text-3xl">Rishabh Arora</h2>
                    <p className="mt-1 text-sm text-white/60">Founder and lead host</p>
                  </div>
                </div>
                <dl className="mt-6 divide-y divide-white/10 border-t border-white/10 text-sm">
                  {[['Experience', '6+ years in automotive journalism'], ['Coverage', 'Domestic and international'], ['Languages', 'English and Hindi']].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 py-3.5">
                      <dt className="shrink-0 text-white/50">{k}</dt>
                      <dd className="text-right font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className="lg:col-span-7">
              <h2 className={h2Cls}>Six years of straight talk on cars</h2>

              <blockquote className="mt-8 rounded-3xl bg-[#dfe3e8] p-6 text-black sm:p-8">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-[#ffb020]" aria-hidden="true">
                  <Check className="h-4 w-4" />
                </span>
                <p className="mt-4 text-base leading-relaxed sm:text-lg">
                  “Hi, my name is Rishabh Arora and I am the founder and the host at Car Guide Media. For over six years, Car Guide has been at the forefront of automotive journalism in India, delivering engaging, authentic, and unbiased content to millions of automobile enthusiasts all around the globe.”
                </p>
              </blockquote>

              <p className="mt-6 max-w-2xl leading-relaxed text-white/60">
                Over 650,000,000 views and more than 500 cars, bikes and scooters reviewed. From track testing at the Buddh International Circuit to invitations at the Bangkok, Dubai, Singapore and Indonesia motor shows, we give Indian buyers raw, factual and transparent insight, with no sugarcoating on road tax, pricing or performance.
              </p>
            </div>
          </div>
        </section>

        {/* ================= INTERNATIONAL ================= */}
        <section className={`${section} border-t border-white/10`}>
          <div className={wrap}>
            <div className="max-w-2xl">
              <h2 className={h2Cls}>On the ground, worldwide</h2>
              <p className="mt-4 leading-relaxed text-white/65">
                Every year since 2023 the Grand Prix Team has invited us to cover the Bangkok International Motor Show, and we report firsthand from major shows across Dubai, Singapore and Indonesia.
              </p>
            </div>

            <ul className={`${card} mt-10 divide-y divide-white/10 overflow-hidden`}>
              {shows.map(([n, d, c]) => (
                <li key={n} className="flex flex-col gap-3 p-5 transition-colors hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold">{n}</h3>
                    <p className="mt-1 text-sm text-white/60">{d}</p>
                  </div>
                  <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-300">
                    <Globe className="h-4 w-4" aria-hidden="true" /> {c}
                  </span>
                </li>
              ))}
            </ul>

            <h3 className="cg-display mt-16 break-words text-[clamp(1.5rem,4vw,2.25rem)]">Videos people keep watching</h3>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hits.map(([t, d]) => (
                <li key={t} className={`${inner} p-6 transition-colors hover:border-[#ffb020]/60`}>
                  <h4 className="text-lg font-bold">{t}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ================= AUDIENCE ================= */}
        <section className={`${section} border-t border-white/10`}>
          <div className={`${wrap} grid items-center gap-10 lg:grid-cols-2 lg:gap-14`}>
            <div>
              <h2 className={h2Cls}>Buyers about to decide</h2>
              <p className="mt-4 max-w-lg leading-relaxed text-white/65">
                Our viewers are active decision-makers aged 18 to 44 who check our unbiased reviews before buying a vehicle between ₹5 lakh and ₹1 crore.
              </p>
              <div className="mt-8 flex flex-wrap gap-x-10 gap-y-6">
                <div>
                  <div className="cg-display text-5xl text-[#ffb020] sm:text-6xl">94.4%</div>
                  <div className="mt-1 text-sm text-white/60">male audience</div>
                </div>
                <div>
                  <div className="cg-display text-5xl sm:text-6xl">76.5%</div>
                  <div className="mt-1 text-sm text-white/60">aged 18 to 34</div>
                </div>
              </div>
            </div>

            <div className={`${card} p-6 sm:p-8`}>
              <h3 className="font-bold">Audience by age</h3>
              <div className="mt-5 flex h-12 overflow-hidden rounded-full bg-white/5" role="img" aria-label="Age distribution bar">
                {ages.map(([a, p], i) => (
                  <div key={a} className={ageShade[i]} style={{ width: `${p}%` }} />
                ))}
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {ages.map(([a, p], i) => (
                  <li key={a} className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
                    <span className="flex items-center gap-3">
                      <span className={`h-3 w-3 rounded-full ${ageShade[i]}`} aria-hidden="true" />
                      {a} years
                    </span>
                    <span className="font-bold">{p}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ================= SERVICES ================= */}
        <section className={`${section} border-t border-white/10`}>
          <div className={wrap}>
            <div className="rounded-[2rem] bg-[#ffb020] p-6 text-black sm:p-10 lg:p-14">
              <h2 className="cg-display max-w-3xl break-words text-[clamp(1.75rem,5vw,3rem)]">What we make for your brand</h2>
              <p className="mt-4 max-w-xl leading-relaxed text-black/75">
                We’ve worked with OEMs, service providers and suppliers, and we build every campaign around return on investment.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {services.map(([t, d]) => (
                  <div key={t} className="rounded-2xl bg-[#080b11] p-6 text-white">
                    <h3 className="cg-display break-words text-xl text-[#ffb020]">{t}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/70">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= GEAR ================= */}
        <section className={`${section} border-t border-white/10`}>
          <div className={wrap}>
            <h2 className={h2Cls}>Cinema-grade kit</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {gear.map(([Icon, t, d]) => (
                <div key={t} className={`${card} p-6 transition-colors hover:border-[#ffb020]/60`}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffb020]/15 text-[#ffb020]" aria-hidden="true">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= BRANDS ================= */}
        <section className={`${section} border-t border-white/10`}>
          <div className={wrap}>
            <h2 className={h2Cls}>Brands we’ve worked with</h2>
            <p className="mt-4 max-w-xl leading-relaxed text-white/60">
              Automotive OEMs, suppliers, insurers, accessory makers and financial institutions across India.
            </p>
            <ul className="mt-8 flex flex-wrap gap-2.5 sm:gap-3">
              {brands.map((b) => (
                <li
                  key={b}
                  className="rounded-full border border-white/15 bg-[#0d1119] px-4 py-2 text-sm font-semibold text-white/85 transition-colors hover:border-[#ffb020] hover:bg-[#ffb020] hover:text-black sm:px-5 sm:py-2.5 sm:text-base"
                >
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ================= TEAM ================= */}
        <section className={`${section} border-t border-white/10`}>
          <div className={wrap}>
            <h2 className={h2Cls}>The crew behind the lens</h2>
            <ul className={`${card} mt-10 divide-y divide-white/10 overflow-hidden`}>
              {team.map(([n, r, b]) => (
                <li key={n} className="grid items-center gap-4 p-5 transition-colors hover:bg-white/[0.03] sm:p-6 md:grid-cols-12 md:gap-6">
                  <div className="flex items-center gap-4 md:col-span-5">
                    <span className="cg-display flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-base text-[#ffb020]" aria-hidden="true">
                      {initials(n)}
                    </span>
                    <div className="min-w-0">
                      <h3 className="cg-display break-words text-xl">{n}</h3>
                      <p className="mt-1 text-sm font-semibold text-[#ffb020]">{r}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-white/60 md:col-span-7">{b}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ================= CONTACT ================= */}
        <section id="contact" className={`${section} scroll-mt-20 border-t border-white/10`}>
          <div className={wrap}>
            <div className="rounded-[2rem] bg-[#dfe3e8] p-6 text-black sm:p-10 lg:p-14">
              <h2 className="cg-display max-w-3xl break-words text-[clamp(2rem,6vw,3.75rem)]">Let’s drive forward, together</h2>
              <p className="mt-4 max-w-xl leading-relaxed text-black/70">
                Partner with a channel the automotive industry and millions of buyers trust, in India and abroad.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-white/70 p-6">
                  <p className="text-sm text-black/50">Contact</p>
                  <p className="cg-display mt-1 break-words text-xl">Rishabh Arora</p>
                  <p className="mt-1 text-sm text-black/60">Founder and host</p>
                </div>
                <a
                  href="mailto:Rishabh@thecarguide.in"
                  className={`group rounded-2xl bg-white/70 p-6 transition-colors hover:bg-black hover:text-white ${focusLight}`}
                >
                  <Mail className="h-5 w-5 text-[#b87400] group-hover:text-[#ffb020]" aria-hidden="true" />
                  <p className="mt-3 break-all text-base font-bold sm:text-lg">Rishabh@thecarguide.in</p>
                  <p className="mt-1 break-all text-sm opacity-60">thecarguide.rishabh@gmail.com</p>
                </a>
                <a
                  href="tel:+919872851996"
                  className={`group rounded-2xl bg-white/70 p-6 transition-colors hover:bg-black hover:text-white ${focusLight}`}
                >
                  <Phone className="h-5 w-5 text-[#b87400] group-hover:text-[#ffb020]" aria-hidden="true" />
                  <p className="mt-3 text-base font-bold sm:text-lg">+91-98728-51996</p>
                  <p className="mt-1 text-sm opacity-60">Direct media line</p>
                </a>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {[['YouTube', 'https://youtube.com'], ['Instagram', 'https://instagram.com'], ['Facebook', 'https://facebook.com']].map(([n, u]) => (
                  <a
                    key={n}
                    href={u}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-1.5 rounded-full border border-black/25 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-black hover:text-white ${focusLight}`}
                  >
                    {n}: Car Guide Media <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}