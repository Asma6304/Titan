import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Heart, Menu, Search, ShieldCheck, User, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useVault } from '../context/VaultContext';
import { useWishlist } from '../context/WishlistContext';
import { TitanLogo } from './TitanLogo';

interface NavbarProps {
  onOpenSearch: () => void;
}

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Marketplace', to: '/marketplace' },
  { label: 'Categories', to: '/categories' },
  { label: 'Collections', to: '/collections' },
  { label: 'About', to: '/about' },
];

export function Navbar({ onOpenSearch }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, openDrawer } = useVault();
  const { count: wishlistCount } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-200 ${
        scrolled || mobileOpen
          ? 'border-b border-violet-400/20 bg-[#0F0B2E]/92 backdrop-blur-xl shadow-[0_12px_36px_-16px_rgba(79,70,229,0.45)]'
          : 'border-b border-transparent bg-gradient-to-b from-[#0F0B2E]/88 to-transparent'
      }`}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Left: Brand */}
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.16 }}>
          <Link to="/" aria-label="TITAN Home" className="focus-visible:outline-2 focus-visible:outline-[#22D3EE] rounded-lg block">
            <TitanLogo />
          </Link>
        </motion.div>

        {/* Centre: Navigation Links */}
        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'text-white after:absolute after:inset-x-0 after:-bottom-1 after:h-[2.5px] after:rounded-full after:bg-gradient-to-r after:from-[#C084FC] after:via-[#6366F1] after:to-[#22D3EE]'
                    : 'text-[#C7CEEA] hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Utilities & Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onOpenSearch}
            aria-label="Search marketplace"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#C7CEEA] transition-colors hover:bg-violet-500/20 hover:text-white cursor-pointer focus-visible:outline-2 focus-visible:outline-[#22D3EE]"
          >
            <Search className="h-[18px] w-[18px]" />
          </motion.button>

          <Link
            to="/wishlist"
            aria-label={`Wishlist (${wishlistCount} saved)`}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[#C7CEEA] transition-colors hover:bg-violet-500/20 hover:text-white focus-visible:outline-2 focus-visible:outline-[#22D3EE]"
          >
            <Heart className="h-[18px] w-[18px]" />
            {wishlistCount > 0 && (
              <motion.span
                key={wishlistCount}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 520, damping: 20 }}
                className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] px-1 font-mono text-[10px] font-semibold tabular-nums text-white shadow-sm"
              >
                {wishlistCount}
              </motion.span>
            )}
          </Link>

          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={openDrawer}
            aria-label={`Open Shopping Vault (${totalItems} items)`}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[#C7CEEA] transition-colors hover:bg-violet-500/20 hover:text-white cursor-pointer focus-visible:outline-2 focus-visible:outline-[#22D3EE]"
          >
            <ShieldCheck className="h-[18px] w-[18px]" />
            {totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 520, damping: 20 }}
                className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-[#06B6D4] to-[#4F46E5] px-1 font-mono text-[10px] font-semibold tabular-nums text-white shadow-sm"
              >
                {totalItems}
              </motion.span>
            )}
          </motion.button>

          <div className="hidden md:flex items-center gap-2.5 pl-2 ml-1 border-l border-violet-300/20">
            {isAuthenticated && user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-violet-300/25 bg-violet-500/15 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:border-[#22D3EE]/60 hover:bg-violet-500/25 whitespace-nowrap shrink-0"
              >
                <User className="h-4 w-4 text-[#22D3EE]" />
                <span className="max-w-[110px] truncate">{user.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[#C7CEEA] transition-colors hover:text-white whitespace-nowrap shrink-0"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-white titan-glow-button whitespace-nowrap shrink-0"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#C7CEEA] transition-colors hover:bg-violet-500/20 hover:text-white lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
            className="border-t border-violet-400/20 bg-[#130E3A]/98 px-4 pb-6 pt-4 backdrop-blur-xl lg:hidden"
          >
            <nav aria-label="Mobile navigation" className="flex flex-col space-y-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-[#7C3AED]/30 to-[#06B6D4]/20 text-white'
                        : 'text-[#C7CEEA] hover:bg-violet-500/15 hover:text-white'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <NavLink
                to="/vault"
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-[#7C3AED]/30 to-[#06B6D4]/20 text-white'
                      : 'text-[#C7CEEA] hover:bg-violet-500/15 hover:text-white'
                  }`
                }
              >
                Shopping Vault ({totalItems})
              </NavLink>
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-[#7C3AED]/30 to-[#06B6D4]/20 text-white'
                      : 'text-[#C7CEEA] hover:bg-violet-500/15 hover:text-white'
                  }`
                }
              >
                Order History
              </NavLink>
            </nav>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-violet-400/20 pt-5">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="col-span-2 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white titan-glow-button"
                >
                  <User className="h-4 w-4" />
                  Account Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center justify-center rounded-xl border border-violet-300/25 bg-violet-500/15 px-4 py-3 text-sm font-medium text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white titan-glow-button"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
