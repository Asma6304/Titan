import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Globe, ShieldCheck, Sparkles } from 'lucide-react';
import { SafeImage } from '../components/SafeImage';

const ABOUT_HERO = '/src/assets/images/collection_ai_studio_bundle_1795284996204.jpg';

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: 'Curated Engineering Bar',
    description:
      'Every UI design system, codebase, and curriculum listed on TITAN undergoes manual technical inspection for clean architecture, accessibility, and zero lock-in.',
  },
  {
    icon: Sparkles,
    title: 'Transparent Commercial Licensing',
    description:
      'Clear Standard, Team, and Enterprise tiers remove legal guesswork so founders, agencies, and engineering organizations can ship immediately.',
  },
  {
    icon: Globe,
    title: 'Built for Global Creators',
    description:
      'We partner with independent design foundries and software engineers worldwide, connecting high-craft digital products with teams who value speed.',
  },
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0F0B2E] pt-28 pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#22D3EE] uppercase">
            About TITAN
          </p>
          <h1
            className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl"
            style={{ textWrap: 'balance' }}
          >
            The Infrastructure for Premium Digital Craft
          </h1>
          <p className="mt-5 text-base leading-relaxed text-[#C7CEEA] sm:text-lg">
            TITAN was founded to solve a recurring problem in modern software teams: finding production-grade design systems, AI tooling, and full-stack templates without sifting through unmaintained repositories or generic templates.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-violet-300/22">
          <SafeImage
            src={ABOUT_HERO}
            alt="TITAN Digital Marketplace Architecture"
            className="aspect-[16/8] w-full object-cover"
          />
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PRINCIPLES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl titan-glass p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-300/22 bg-[#181247] text-[#A855F7]">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 font-display text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#C7CEEA]">{item.description}</p>
              </div>
            );
          })}
        </div>

        <section className="mt-16 rounded-3xl titan-glass p-8 sm:p-10">
          <h2 className="font-display text-2xl font-bold text-white">What Sets Every TITAN Release Apart</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              'Modern React, TypeScript, Figma Variables, and Tailwind CSS standards',
              'Instant digital Vault delivery with unique verifiable license keys',
              'Responsive desktop, tablet, and mobile engineering out of the box',
              'Direct support channels for team and enterprise license upgrades',
            ].map((point) => (
              <div key={point} className="flex items-start gap-3 text-sm text-[#C7CEEA]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#22D3EE]" />
                <span>{point}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white titan-glow-button"
            >
              Explore Marketplace
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-violet-300/25 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
            >
              Contact Our Team
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
