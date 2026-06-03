import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Globe, Settings, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, Key, Layout, Download, Copy } from 'lucide-react';
import { BANNER_SIZES, GeneratedBanner, AdCopy } from '../types';
import { generateAdCopy, generateBannerImage, generateTheme, checkApiKey, openApiKeyDialog } from '../lib/gemini';
import { BannerCard } from './BannerCard';

export const BannerGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'banners' | 'lab'>('banners');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState<"512px" | "1K" | "2K" | "4K">('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [banners, setBanners] = useState<GeneratedBanner[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  // Image Lab state
  const [labPrompt, setLabPrompt] = useState('');
  const [labRatio, setLabRatio] = useState('1:1');
  const [labImage, setLabImage] = useState<string | null>(null);
  const [isLabGenerating, setIsLabGenerating] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      const result = await checkApiKey();
      setHasApiKey(result);
    };
    checkKey();
  }, []);

  const handleGenerate = async () => {
    if (!description) {
      setError("Please provide a product description.");
      return;
    }

    if (!hasApiKey) {
      await openApiKeyDialog();
      setHasApiKey(true);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setBanners([]);

    try {
      const [copy, theme] = await Promise.all([
        generateAdCopy(description, url),
        generateTheme(description)
      ]);

      const aspectRatios = Array.from(new Set(BANNER_SIZES.map(s => s.aspectRatio)));
      const imageMap = new Map<string, string>();

      const imagePromises = aspectRatios.map(async (ratio) => {
        const imageUrl = await generateBannerImage(description, ratio, quality);
        imageMap.set(ratio, imageUrl);
      });

      await Promise.all(imagePromises);

      const generatedBanners: GeneratedBanner[] = BANNER_SIZES.map(size => ({
        size,
        imageUrl: imageMap.get(size.aspectRatio) || '',
        copy,
        theme,
      }));

      setBanners(generatedBanners);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLabGenerate = async () => {
    if (!labPrompt) return;
    setIsLabGenerating(true);
    setLabImage(null);
    try {
      const img = await generateBannerImage(labPrompt, labRatio, quality);
      setLabImage(img);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLabGenerating(false);
    }
  };

  if (hasApiKey === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-neutral-900/50 border border-neutral-800 p-8 rounded-3xl text-center backdrop-blur-xl"
        >
          <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4">API Key Required</h2>
          <p className="text-neutral-400 mb-8">
            This app uses high-quality image generation models which require a paid Gemini API key. 
            Please select your key to continue.
          </p>
          <button
            onClick={async () => {
              await openApiKeyDialog();
              setHasApiKey(true);
            }}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20"
          >
            Select API Key
          </button>
          <p className="mt-4 text-xs text-neutral-500">
            Don't have a key? Visit <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline">billing documentation</a>.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-orange-500/30">
      {/* Header */}
      <header className="border-b border-neutral-800/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">AdGen Pro</h1>
          </div>
          <nav className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            <button 
              onClick={() => setActiveTab('banners')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'banners' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              Banner Generator
            </button>
            <button 
              onClick={() => setActiveTab('lab')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'lab' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              Image Lab
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {activeTab === 'banners' ? (
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Controls */}
            <div className="lg:col-span-4 space-y-8">
              <section className="bg-neutral-900/50 border border-neutral-800 p-8 rounded-3xl backdrop-blur-sm">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-500" />
                  Campaign Details
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Product Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. A sleek, minimalist mechanical keyboard with RGB lighting and wireless connectivity."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all min-h-[120px] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Product URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/product"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Image Quality
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(["512px", "1K", "2K", "4K"] as const).map((q) => (
                        <button
                          key={q}
                          onClick={() => setQuality(q)}
                          className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                            quality === q 
                              ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' 
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm"
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p>{error}</p>
                    </motion.div>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 group"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating Banners...
                      </>
                    ) : (
                      <>
                        Generate Banners
                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </section>
            </div>

            {/* Preview Area */}
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Banner Previews</h2>
                <div className="text-sm text-neutral-500">
                  {banners.length > 0 ? `${banners.length} sizes generated` : 'Ready to generate'}
                </div>
              </div>

              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-orange-500 animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xl font-medium">Crafting your campaign...</p>
                    <p className="text-neutral-500 text-sm">Generating high-quality images and professional ad copy.</p>
                  </div>
                </div>
              ) : banners.length > 0 ? (
                <div className="flex flex-wrap gap-8 items-start justify-center lg:justify-start">
                  {banners.map((banner, idx) => (
                    <div key={idx} className="space-y-2">
                      <BannerCard banner={banner} scale={0.8} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-neutral-800 rounded-3xl py-32 flex flex-col items-center justify-center text-neutral-600">
                  <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-lg">Your generated banners will appear here</p>
                  <p className="text-sm">Enter product details to get started</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Image Lab */
          <div className="max-w-4xl mx-auto space-y-12">
            <section className="bg-neutral-900/50 border border-neutral-800 p-8 rounded-3xl backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <ImageIcon className="w-7 h-7 text-orange-500" />
                Image Generation Lab
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Prompt</label>
                    <textarea
                      value={labPrompt}
                      onChange={(e) => setLabPrompt(e.target.value)}
                      placeholder="Describe the image you want to generate..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all min-h-[150px] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Aspect Ratio</label>
                    <div className="grid grid-cols-4 gap-2">
                      {["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9", "1:4", "1:8", "4:1", "8:1"].map((r) => (
                        <button
                          key={r}
                          onClick={() => setLabRatio(r)}
                          className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                            labRatio === r 
                              ? 'bg-orange-500 border-orange-500 text-white' 
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Resolution</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(["512px", "1K", "2K", "4K"] as const).map((q) => (
                        <button
                          key={q}
                          onClick={() => setQuality(q)}
                          className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                            quality === q 
                              ? 'bg-orange-500 border-orange-500 text-white' 
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleLabGenerate}
                    disabled={isLabGenerating || !labPrompt}
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3"
                  >
                    {isLabGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    Generate Image
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-800 rounded-2xl min-h-[400px] relative overflow-hidden bg-neutral-950">
                  {isLabGenerating ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                      <p className="text-neutral-500 animate-pulse">Generating...</p>
                    </div>
                  ) : labImage ? (
                    <>
                      <img src={labImage} alt="Generated" className="w-full h-full object-contain" />
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <a href={labImage} download="generated-image.png" className="p-2 bg-black/50 backdrop-blur-md rounded-lg hover:bg-black/70 transition-colors">
                          <Download className="w-5 h-5" />
                        </a>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-8">
                      <ImageIcon className="w-12 h-12 text-neutral-800 mx-auto mb-4" />
                      <p className="text-neutral-600">Generated image will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 mt-24 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-neutral-500 text-sm">
          <p>© 2026 AdGen Pro. Powered by Google Gemini AI.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
