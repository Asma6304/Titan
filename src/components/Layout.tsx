import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'motion/react';
import { CursorAura } from './CursorAura';
import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { SearchModal } from './SearchModal';
import { VaultDrawer } from './VaultDrawer';

export function Layout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname } = useLocation();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 32, restDelta: 0.001 });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  // Global Cmd/Ctrl + K search shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0F0B2E] text-white">
      {/* Top gradient reading/scroll progress indicator */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX }}
        className="fixed inset-x-0 top-0 z-50 h-[2.5px] origin-left bg-gradient-to-r from-[#A855F7] via-[#22D3EE] to-[#EC4899]"
      />

      <CursorAura />
      <Navbar onOpenSearch={() => setSearchOpen(true)} />

      <main className="flex-1">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>

      <Footer />
      <VaultDrawer />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
