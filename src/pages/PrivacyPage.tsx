import React from 'react';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0F0B2E] pt-28 pb-24">
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="border-b border-violet-300/18 pb-8">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#22D3EE] uppercase">
            Legal Documentation
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs text-[#C7CEEA]">Last updated: November 2026</p>
        </div>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-[#C7CEEA]">
          <section>
            <h2 className="font-display text-xl font-semibold text-white">1. Information We Collect</h2>
            <p className="mt-3">
              When you register for a TITAN account, subscribe to release briefings, or complete a Vault order, we collect only the details necessary to deliver your digital products and license keys: your name, email address, optional company affiliation, and billing country.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-white">2. Local Browser Storage</h2>
            <p className="mt-3">
              TITAN stores non-sensitive shopping preferences—specifically your Shopping Vault items and Wishlist bookmarks—in your browser&apos;s LocalStorage so your selections persist across refreshes. Authentication credentials and session tokens are never stored in LocalStorage.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-white">3. Security &amp; Password Protection</h2>
            <p className="mt-3">
              Account passwords are salted and hashed on the server using strong cryptographic key derivation (scrypt) and are never stored in plaintext or transmitted back to the browser. Sensitive gateway keys and secrets remain strictly on server infrastructure.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-white">4. Payment Processing Transparency</h2>
            <p className="mt-3">
              When live payment processors (such as Stripe or Razorpay) are configured, payment card details are tokenized directly by the processor and never touch TITAN databases. In Test Mode deployments, no live financial instruments are charged or stored.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-white">5. Your Data Rights</h2>
            <p className="mt-3">
              You may update your profile details at any time from your TITAN Account Dashboard or request export or deletion of your account data by contacting our support team.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
