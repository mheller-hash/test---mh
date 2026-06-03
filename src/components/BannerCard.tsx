import React from 'react';
import { motion } from 'motion/react';
import { GeneratedBanner } from '../types';

interface BannerCardProps {
  banner: GeneratedBanner;
  scale?: number;
}

export const BannerCard: React.FC<BannerCardProps> = ({ banner, scale = 1 }) => {
  const { size, imageUrl, copy, theme } = banner;
  const { width, height } = size;

  // Calculate the layout based on aspect ratio
  const isHorizontal = width > height;
  const isVeryHorizontal = width / height > 3; // e.g. Leaderboard or Mobile Banner
  const isVertical = height > width;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden shadow-lg rounded-lg border border-black/10"
      style={{
        width: width * scale,
        height: height * scale,
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
      }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={imageUrl}
          alt="Product"
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div 
          className="absolute inset-0" 
          style={{ 
            background: `linear-gradient(to ${isHorizontal ? 'right' : 'bottom'}, ${theme.backgroundColor} 0%, transparent 100%)` 
          }} 
        />
      </div>

      {/* Content Overlay */}
      <div className={`relative z-10 flex flex-col h-full p-4 ${isVeryHorizontal ? 'flex-row items-center justify-between' : 'justify-center'}`}>
        <div className={`${isVeryHorizontal ? 'flex-1 mr-4' : 'mb-4 text-center'}`}>
          <h3 
            className="font-bold leading-tight"
            style={{ fontSize: Math.max(12, height * scale * 0.15) }}
          >
            {copy.headline}
          </h3>
          {height * scale > 100 && (
            <p 
              className="mt-1 opacity-90"
              style={{ fontSize: Math.max(10, height * scale * 0.08) }}
            >
              {copy.subheadline}
            </p>
          )}
        </div>

        <div className={`${isVeryHorizontal ? 'flex-shrink-0' : 'mt-auto flex justify-center'}`}>
          <button
            className="px-4 py-2 rounded-full font-semibold transition-transform hover:scale-105 active:scale-95 whitespace-nowrap"
            style={{
              backgroundColor: theme.accentColor,
              color: theme.backgroundColor,
              fontSize: Math.max(11, height * scale * 0.07),
            }}
          >
            {copy.cta}
          </button>
        </div>
      </div>

      {/* Size Label */}
      <div className="absolute top-1 left-1 bg-black/50 text-white text-[8px] px-1 rounded backdrop-blur-sm z-20">
        {size.name} ({width}x{height})
      </div>
    </motion.div>
  );
};
