import React from 'react';
import { ExternalLink } from 'lucide-react';
import { VIDEO_ROWS } from '../data/siteData';
import { LEGAL_LINKS, NETWORK_LINKS } from './LegalPages';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full border-t border-[#1E293B] bg-[#070A11] text-slate-400 py-12 px-4 sm:px-8">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Brand & Description */}
        <div className="md:col-span-5 flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-[#E07A5F]/40 bg-[#141B2D] p-0.5">
              <img
                src="/assets/aistudio/Crying_cowgirl_logo_with_transparent_background_1d4c6f13.png"
                alt="sadcowgirl.fun"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
            <span className="font-varsity text-xl font-bold tracking-wider text-white">
              sadcowgirl<span className="text-[#E07A5F]">.fun</span>
            </span>
          </div>

          <p className="font-body text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
            The modern collegiate cowboy video tube. Built for Friday night stadium floodlights, 8-second rodeo rides, 350-piece brass halftimes, and RV tailgate bonfires.
          </p>

          <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <span>COLLEGIATE DIVISION I TRADITION</span>
            <span>·</span>
            <span>EST. 2026</span>
          </div>
        </div>

        {/* 5 Rows Direct Navigation */}
        <div className="md:col-span-3">
          <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-3">
            Saddle Up &amp; Browse
          </h4>
          <ul className="space-y-2 text-xs">
            {VIDEO_ROWS.map((row) => (
              <li key={row.id}>
                <button
                  onClick={() => onNavigate(`row:${row.id}`)}
                  className="hover:text-[#E07A5F] transition-colors flex items-center gap-2 text-left"
                >
                  <span className="font-mono text-[10px] text-slate-500">{row.index}.</span>
                  <span>{row.title}</span>
                </button>
              </li>
            ))}
            <li>
              <button onClick={() => onNavigate('categories')} className="hover:text-[#E07A5F] transition-colors flex items-center gap-2 text-left">
                <span className="font-mono text-[10px] text-slate-500">+</span>
                <span>All Categories</span>
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('models')} className="hover:text-[#E07A5F] transition-colors flex items-center gap-2 text-left">
                <span className="font-mono text-[10px] text-slate-500">+</span>
                <span>The Corral — Models</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Blackchariot Network */}
        <div className="md:col-span-2">
          <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-3">
            Our Network
          </h4>
          <ul className="space-y-2 text-xs">
            {NETWORK_LINKS.map((n) => (
              <li key={n.url}>
                <a
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#E07A5F] transition-colors flex items-center gap-1.5"
                >
                  <span>{n.name}</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div className="md:col-span-2">
          <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-3">
            Legal
          </h4>
          <ul className="space-y-2 text-xs">
            {LEGAL_LINKS.map((l) => (
              <li key={l.slug}>
                <button
                  onClick={() => onNavigate(`legal:${l.slug}`)}
                  className="hover:text-[#E07A5F] transition-colors text-left"
                >
                  {l.label}
                </button>
              </li>
            ))}
            <li className="pt-2 text-[10px] font-mono text-slate-600 leading-relaxed">
              18 U.S.C. 2257 record-keeping requirements compliance statement.
            </li>
          </ul>

          <div className="mt-4 pt-4 border-t border-[#1E293B]/60 text-[11px] font-mono text-slate-600">
            © {new Date().getFullYear()} sadcowgirl.fun · All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
