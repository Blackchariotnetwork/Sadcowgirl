// Ad stack config for sadcowgirl.fun.
//
// Adsterra zones are DOMAIN-BOUND — never reuse another site's zone codes.
// Zone inventory (from the publisher API, domain 6161716):
//   31997464  300x250      in-feed banner   — needs dashboard invoke key
//   31997468  728x90       desktop banner   — needs dashboard invoke key
//   31997472  160x600      side rail        — needs dashboard invoke key
//   31997476  160x300      side rail (alt)  — needs dashboard invoke key
//   31997480  468x60       banner (alt)     — needs dashboard invoke key
//   31997484  Popunder     LIVE (injected server-side in functions/[[path]].js)
//   31997488  Social Bar                    — needs dashboard script
//   31997492  320x50       mobile sticky    — needs dashboard invoke key
//   31997495  NativeBanner                  — needs dashboard invoke key
//   31997499  Smartlink    direct URL below (API-exposed)
//
// NOTE: the publisher API only exposes popunder/smartlink/directlink codes —
// banner + social + native invoke keys must be copied from the dashboard's
// "Get code" buttons, then flipped to true here AND wired in
// functions/[[path]].js (which owns the human page HTML).

export const ADS = {
  popunder: {
    enabled: true,
    src: 'https://unprofessionalginger.com/35/e5/d5/35e5d53b87a5de76ce8f59cc8f6de86f.js', // zone 31997484
  },
  socialBar: {
    enabled: false,
    src: '', // zone 31997488
  },
  banner300: {
    enabled: false,
    invoke: '', // zone 31997464 — 300x250 in-feed
    everyN: 8,
  },
  banner728: {
    enabled: false,
    invoke: '', // zone 31997468 — 728x90 desktop
  },
  mobileSticky320: {
    enabled: false,
    invoke: '', // zone 31997492 — 320x50 mobile sticky
  },
  skyscraper160: {
    enabled: false,
    invoke: '', // zone 31997472 — 160x600 side rail
  },
  native: {
    enabled: false,
    invoke: '', // zone 31997495 — native banner
  },
  // Smartlink (zone 31997499) — API-exposed direct URL, account-level.
  smartlink: 'https://unprofessionalginger.com/nuc41fspk?key=31319bc43f3086632b17cde914e99bde',
};

// Affiliate funnels — these are account-level campaign links (NOT domain-bound)
// and are safe to run on every site in the network.
export const FUNNELS = {
  chaturbate: 'https://chaturbate.com/in/?tour=gLDS&campaign=lIlkA&track=sadcowgirl',
};
