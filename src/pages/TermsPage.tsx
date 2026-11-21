import React from 'react';

export function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0F0B2E] pt-28 pb-24">
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="border-b border-violet-300/18 pb-8">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#22D3EE] uppercase">
            Legal Documentation
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-xs text-[#C7CEEA]">Last updated: November 2026</p>
        </div>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-[#C7CEEA]">
          <section>
            <h2 className="font-display text-xl font-semibold text-white">1. Digital Product Licensing</h2>
            <p className="mt-3">
              Every purchase on TITAN grants a non-exclusive, perpetual license corresponding to the tier selected in your Shopping Vault:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-white">Standard License:</strong> Covers 1 individual creator or engineer for 1 commercial end product.
              </li>
              <li>
                <strong className="text-white">Team License:</strong> Covers up to 10 team members across unlimited client or internal commercial projects.
              </li>
              <li>
                <strong className="text-white">Enterprise License:</strong> Covers organization-wide seat usage, SaaS distribution rights, and priority technical onboarding.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-white">2. Restrictions on Redistribution</h2>
            <p className="mt-3">
              You may not resell, redistribute, sublicense, or publish raw TITAN UI kits, source codebases, or 3D asset packs as standalone competing templates or marketplace listings.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-white">3. Instant Delivery &amp; Updates</h2>
            <p className="mt-3">
              Digital assets and unique TITAN license keys are delivered immediately upon checkout completion. Standard, Team, and Enterprise licenses include access to minor compatibility updates released for the purchased major version.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-white">4. Refund Policy</h2>
            <p className="mt-3">
              Because digital archives and source code are delivered instantaneously, refunds are evaluated on a case-by-case basis within 14 days when an archive fails to match its documented deliverables or technical specifications.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
