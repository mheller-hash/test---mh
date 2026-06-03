export type BannerSize = {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
};

export const BANNER_SIZES: BannerSize[] = [
  { id: 'leaderboard', name: 'Leaderboard', width: 728, height: 90, aspectRatio: '8:1' },
  { id: 'medium-rectangle', name: 'Medium Rectangle', width: 300, height: 250, aspectRatio: '1:1' },
  { id: 'wide-skyscraper', name: 'Wide Skyscraper', width: 160, height: 600, aspectRatio: '1:4' },
  { id: 'half-page', name: 'Half Page', width: 300, height: 600, aspectRatio: '3:4' },
  { id: 'mobile-banner', name: 'Mobile Banner', width: 320, height: 50, aspectRatio: '4:1' },
  { id: 'large-rectangle', name: 'Large Rectangle', width: 336, height: 280, aspectRatio: '1:1' },
  { id: 'square', name: 'Square', width: 250, height: 250, aspectRatio: '1:1' },
];

export type AdCopy = {
  headline: string;
  subheadline: string;
  cta: string;
};

export type GeneratedBanner = {
  size: BannerSize;
  imageUrl: string;
  copy: AdCopy;
  theme: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  };
};
