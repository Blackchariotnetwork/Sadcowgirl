// Ad stack config for sadcowgirl.fun.
//
// IMPORTANT: Adsterra/Adtng zones are DOMAIN-BOUND — never reuse the
// lewdlevel/allgoodleaks spot IDs (see ccc-ad-deployment.md). When you create
// zones for sadcowgirl.fun in the Adsterra dashboard, paste them below and
// flip the flags to true.

export const ADS = {
  // Popunder (Direct link) — zone: "Websites → sadcowgirl.fun → Popunder"
  popunder: {
    enabled: false,
    src: '', // e.g. https://plXXXXXXX.profitableratecpmnetwork.com/xx/xx/xx/xxxx.js
  },
  // Social Bar — zone: "Websites → sadcowgirl.fun → Social Bar"
  socialBar: {
    enabled: false,
    src: '',
  },
  // Top banner 300×100 — zone: "Websites → sadcowgirl.fun → Banner 300x100"
  topBanner: {
    enabled: false,
    spotId: '', // e.g. 10008611
  },
  // In-feed 300×250 — zone: "Websites → sadcowgirl.fun → Banner 300x250"
  inFeed: {
    enabled: false,
    spotId: '',
    everyN: 8,
  },
};

// Affiliate funnels — these are account-level campaign links (NOT domain-bound)
// and are safe to run on every site in the network.
export const FUNNELS = {
  chaturbate: 'https://chaturbate.com/in/?tour=gLDS&campaign=lIlkA&track=sadcowgirl',
};