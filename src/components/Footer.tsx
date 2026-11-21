import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Globe, Mail, Twitter } from 'lucide-react';
import { TitanLogo } from './TitanLogo';

export function Footer() {
  return (
    <footer className="border-t border-violet-400/20 bg-gradient-to-b from-[#0C0826] to-[#08051B]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link to="/" aria-label="TITAN Home">
              <TitanLogo />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#C7CEEA]">
              TITAN is the premier digital marketplace for production UI design systems, AI engineering tools, templates, and studio-grade creative resources.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="TITAN on GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-300/20 bg-violet-500/10 text-[#C7CEEA] transition-colors hover:border-[#22D3EE]/60 hover:bg-violet-500/25 hover:text-white"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="TITAN on X"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-300/20 bg-violet-500/10 text-[#C7CEEA] transition-colors hover:border-[#22D3EE]/60 hover:bg-violet-500/25 hover:text-white"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <Link
                to="/about"
                aria-label="TITAN Global Network"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-300/20 bg-violet-500/10 text-[#C7CEEA] transition-colors hover:border-[#22D3EE]/60 hover:bg-violet-500/25 hover:text-white"
              >
                <Globe className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                aria-label="Contact TITAN Support"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-300/20 bg-violet-500/10 text-[#C7CEEA] transition-colors hover:border-[#22D3EE]/60 hover:bg-violet-500/25 hover:text-white"
              >
                <Mail className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="font-display text-sm font-semibold text-white">Marketplace</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#C7CEEA]">
              <li><Link to="/marketplace" className="transition-colors hover:text-[#22D3EE]">All Products</Link></li>
              <li><Link to="/collections" className="transition-colors hover:text-[#22D3EE]">Curated Collections</Link></li>
              <li><Link to="/categories" className="transition-colors hover:text-[#22D3EE]">Categories</Link></li>
              <li><Link to="/vault" className="transition-colors hover:text-[#22D3EE]">Shopping Vault</Link></li>
              <li><Link to="/wishlist" className="transition-colors hover:text-[#22D3EE]">Saved Wishlist</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-3">
            <h3 className="font-display text-sm font-semibold text-white">Categories</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#C7CEEA]">
              <li><Link to="/categories/ui-ux-design-resources" className="transition-colors hover:text-[#22D3EE]">UI/UX Design Resources</Link></li>
              <li><Link to="/categories/development-tools" className="transition-colors hover:text-[#22D3EE]">Development Tools</Link></li>
              <li><Link to="/categories/ai-tools" className="transition-colors hover:text-[#22D3EE]">AI Tools</Link></li>
              <li><Link to="/categories/templates-themes" className="transition-colors hover:text-[#22D3EE]">Templates &amp; Themes</Link></li>
              <li><Link to="/categories/digital-courses" className="transition-colors hover:text-[#22D3EE]">Digital Courses</Link></li>
              <li><Link to="/categories/graphics-creative-assets" className="transition-colors hover:text-[#22D3EE]">Graphics &amp; Creative Assets</Link></li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div className="lg:col-span-3">
            <h3 className="font-display text-sm font-semibold text-white">Company &amp; Support</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#C7CEEA]">
              <li><Link to="/about" className="transition-colors hover:text-[#22D3EE]">About TITAN</Link></li>
              <li><Link to="/contact" className="transition-colors hover:text-[#22D3EE]">Contact Support</Link></li>
              <li><Link to="/dashboard" className="transition-colors hover:text-[#22D3EE]">Account Dashboard</Link></li>
              <li><Link to="/orders" className="transition-colors hover:text-[#22D3EE]">Order History</Link></li>
              <li><Link to="/privacy" className="transition-colors hover:text-[#22D3EE]">Privacy Policy</Link></li>
              <li><Link to="/terms" className="transition-colors hover:text-[#22D3EE]">Terms &amp; Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-violet-400/15 pt-8 text-xs text-[#C7CEEA] sm:flex-row">
          <p>&copy; {new Date().getFullYear()} TITAN Digital Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="transition-colors hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="transition-colors hover:text-white">Terms &amp; Conditions</Link>
            <Link to="/contact" className="transition-colors hover:text-white">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
