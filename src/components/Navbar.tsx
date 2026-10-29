import React from 'react';
import { Bookmark, Search, X, Menu, ExternalLink, Scale } from 'lucide-react';
import { soundFX } from '../utils/audio';
import { LEGAL_LINKS, NETWORK_LINKS } from './LegalPages';

interface NavbarProps {
  lassoCount: number;
  onOpenLassoList: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lassoCount,
  onOpenLassoList,
  searchQuery,
  onSearchChange,
  activeView,
  onNavigate,
}) => {
  const [showSearchInput, setShowSearchInput] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'cowgirl', label: 'Cowgirl' },
    { id: 'categories', label: 'Categories' },
    { id: 'models', label: 'Models' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E293B] bg-[#080C14]/90 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-8 px-4 sm:px-8 py-3.5">
        {/* Zone 1: Brand Wordmark with Cowgirl Logo */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 group whitespace-nowrap shrink-0 select-none"
        >
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-[#E07A5F]/40 bg-[#141B2D] p-0.5 shadow-sm transition-transform duration-200 group-hover:scale-105">
            <img
              src="/assets/aistudio/Crying_cowgirl_logo_with_transparent_background_1d4c6f13.png"
              alt="sadcowgirl.fun logo"
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-varsity text-lg sm:text-xl font-bold tracking-wider text-white transition-colors duration-200 group-hover:text-[#E07A5F]">
              sadcowgirl<span className="text-[#E07A5F]">.fun</span>
            </span>
          </div>
        </a>

        {/* Mobile hamburger */}
        <button
          onClick={() => { soundFX.playCheerClick(); setShowMobileMenu((s) => !s); }}
          className="lg:hidden p-2 text-slate-200 hover:text-white hover:bg-[#141B2D] rounded-lg transition-colors border border-[#1E293B]"
          title="Menu"
        >
          {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Zone 2: Clean Single-Line Nav Links (desktop) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = activeView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  soundFX.playCheerClick();
                  onNavigate(link.id);
                }}
                className={`transition-colors whitespace-nowrap shrink-0 relative py-1 text-sm tracking-wide ${
                  isActive
                    ? 'text-[#E07A5F] font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E07A5F]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions - Search, Lasso List, Primary CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search Toggle / Input */}
          <div className="relative flex items-center">
            {showSearchInput ? (
              <div className="flex items-center bg-[#111827] border border-[#1E293B] rounded-lg px-2.5 py-1.5 gap-2 w-44 sm:w-64 transition-all">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search plays, riders, BBQ..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none w-full"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setShowSearchInput(false)}
                  className="text-slate-400 hover:text-white text-xs font-mono ml-1"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearchInput(true)}
                title="Search videos"
                className="p-2 text-slate-300 hover:text-white hover:bg-[#141B2D] rounded-lg transition-colors border border-transparent hover:border-[#1E293B]"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Lasso List (Saved Videos) */}
          <button
            onClick={() => {
              soundFX.playCheerClick();
              onOpenLassoList();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-wider uppercase text-slate-200 bg-[#111827] hover:bg-[#1A2338] border border-[#1E293B] hover:border-[#E07A5F]/50 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="View saved Lasso List"
          >
            <Bookmark className={`w-3.5 h-3.5 ${lassoCount > 0 ? 'text-[#E07A5F] fill-[#E07A5F]' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Lasso</span>
            <span className="tabular-nums font-mono text-[11px] px-1 py-0.2 bg-[#1E293B] rounded text-white">
              {lassoCount}
            </span>
          </button>


        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-[#1E293B] bg-[#0B101C] backdrop-blur-md max-h-[75vh] overflow-y-auto">
          <div className="max-w-[1440px] mx-auto px-4 py-4 space-y-5">
            {/* Browse */}
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Browse</p>
              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => { soundFX.playCheerClick(); setShowMobileMenu(false); onNavigate(link.id); }}
                    className={`px-3 py-2 text-left text-sm font-semibold uppercase tracking-wide rounded-lg transition-colors ${
                      activeView === link.id
                        ? 'bg-[#E07A5F] text-white'
                        : 'bg-[#141B2D] text-slate-200 hover:bg-[#1E293B] hover:text-white'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Network */}
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Blackchariot Network</p>
              <div className="grid grid-cols-1 gap-1.5">
                {NETWORK_LINKS.map((n) => (
                  <a
                    key={n.url}
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2 bg-[#141B2D] hover:bg-[#1E293B] rounded-lg text-sm text-slate-200 hover:text-white transition-colors"
                  >
                    <span>{n.name}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{n.tag}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1">
                <Scale className="w-3 h-3" /> Legal
              </p>
              <div className="grid grid-cols-2 gap-2">
                {LEGAL_LINKS.map((l) => (
                  <button
                    key={l.slug}
                    onClick={() => { soundFX.playCheerClick(); setShowMobileMenu(false); onNavigate(`legal:${l.slug}`); }}
                    className="px-3 py-2 text-left text-xs font-mono bg-[#141B2D] text-slate-300 hover:bg-[#1E293B] hover:text-white rounded-lg transition-colors"
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
