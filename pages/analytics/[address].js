import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { getWalletData } from '../../lib/blockchain';
import { BackgroundLines } from '../../components/BackgroundLines';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, AreaChart, Area } from 'recharts';
import ChainIcon from '../../components/ChainIcon';
import html2canvas from 'html2canvas';
import { ethers } from 'ethers';
import { Avatar } from '@coinbase/onchainkit/identity';
import OnchainHeatmap from '../../components/OnchainHeatmap';

const CHAIN_OPTIONS = [
  { value: 'base', label: 'Base', color: 'bg-base-blue', accent: 'text-base-blue' },
  { value: 'optimism', label: 'Optimism', color: 'bg-red-600', accent: 'text-red-400' },
  { value: 'ethereum', label: 'Ethereum', color: 'bg-purple-700', accent: 'text-purple-400' },
  // { value: 'assetchain', label: 'AssetChain', color: 'bg-green-700', accent: 'text-green-400' },
];

const RANKS = {
  base: [
    { min: 0, max: 9, name: 'Base Newborn', emoji: '🍼', description: 'Just getting started on Base!' },
    { min: 10, max: 49, name: 'Base Explorer', emoji: '🧭', description: 'Exploring the Base ecosystem.' },
    { min: 50, max: 99, name: 'Base DeFi Kid', emoji: '🦄', description: 'Diving into DeFi on Base.' },
    { min: 100, max: 499, name: 'Base OG', emoji: '🧙‍♂️', description: 'A true Base veteran.' },
    { min: 500, max: Infinity, name: 'Base Legend', emoji: '👑', description: 'Legendary status achieved!' },
  ],
  optimism: [
    { min: 0, max: 9, name: 'OP Newbie', emoji: '🌱', description: 'Welcome to Optimism!' },
    { min: 10, max: 49, name: 'OP Explorer', emoji: '🚀', description: 'Exploring the OP chain.' },
    { min: 50, max: 99, name: 'OP DeFi Kid', emoji: '💎', description: 'DeFi adventures on Optimism.' },
    { min: 100, max: 499, name: 'OP OG', emoji: '🦸‍♂️', description: 'Optimistic OG.' },
    { min: 500, max: Infinity, name: 'OP Legend', emoji: '🏆', description: 'Legend of Optimism.' },
  ],
  ethereum: [
    { min: 0, max: 19, name: 'ETH Newborn', emoji: '🌱', description: 'Just getting started on Ethereum.' },
    { min: 20, max: 99, name: 'ETH Explorer', emoji: '🧭', description: 'Exploring the Ethereum world.' },
    { min: 100, max: 499, name: 'ETH DeFi Kid', emoji: '🦄', description: 'DeFi enthusiast on Ethereum.' },
    { min: 500, max: 1999, name: 'ETH OG', emoji: '🦍', description: 'Ethereum OG.' },
    { min: 2000, max: Infinity, name: 'ETH Legend', emoji: '👑', description: 'Legendary Ethereum user.' },
  ],
  // assetchain: [ ... ],
};

// Helper to get provider for each chain
function getProviderForChain(chain) {
  if (chain === 'assetchain') {
    return new ethers.providers.JsonRpcProvider('https://mainnet-rpc.assetchain.org', 42420);
  }
  if (chain === 'base') {
    return new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org');
  }
  if (chain === 'optimism') {
    return new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_OPTIMISM_MAINNET_RPC_URL || 'https://mainnet.optimism.io');
  }
  if (chain === 'ethereum') {
    return new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_ETH_MAINNET_RPC_URL || 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
  }
  return null;
}

// Helper to get native token symbol for each chain
function getNativeSymbol(chain) {
  if (chain === 'assetchain') return 'RWA';
  if (chain === 'ethereum') return 'ETH';
  if (chain === 'optimism') return 'ETH';
  if (chain === 'base') return 'ETH';
  return 'ETH';
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { address, chain } = router.query;
  // Initialize selectedChain from query param if available
  const initialChain = (chain && CHAIN_OPTIONS.some(opt => opt.value === chain)) ? chain : 'base';
  const [selectedChain, setSelectedChain] = useState(initialChain);
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('default', { month: 'short' }).toUpperCase();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const resultsRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [streakData, setStreakData] = useState(null);
  const [streakLoading, setStreakLoading] = useState(true);
  const [streakError, setStreakError] = useState(null);

  // Keep selectedChain in sync with query param
  useEffect(() => {
    if (chain && CHAIN_OPTIONS.some(opt => opt.value === chain) && chain !== selectedChain) {
      setSelectedChain(chain);
    }
  }, [chain]);

  // Fetch data only when both address and selectedChain are set and valid
  useEffect(() => {
    if (!address || !selectedChain) return;
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const decodedAddress = decodeURIComponent(address);
        const data = await getWalletData(decodedAddress, selectedChain);
        if (!data.success) {
          setError(data.error || 'Failed to fetch wallet data');
        } else {
          setWalletData(data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [address, selectedChain]);

  // Fetch streak data when address or selectedChain changes
  useEffect(() => {
    if (!address || !selectedChain) return;
    async function fetchStreak() {
      setStreakLoading(true);
      setStreakError(null);
      try {
        const decodedAddress = decodeURIComponent(address);
        const res = await fetch(`/api/streak?address=${decodedAddress}&chain=${selectedChain}`);
        const data = await res.json();
        if (!data.success) {
          setStreakError(data.error || 'Failed to fetch streak data');
        } else {
          setStreakData(data);
        }
      } catch (err) {
        setStreakError(err.message || 'Failed to load streak data');
      } finally {
        setStreakLoading(false);
      }
    }
    fetchStreak();
  }, [address, selectedChain]);

  // Theme colors based on chain
  const chainTheme = CHAIN_OPTIONS.find(c => c.value === selectedChain) || CHAIN_OPTIONS[0];

  // Chain-specific rank system
  function getRank(chain, txCount) {
    const ranks = RANKS[chain] || RANKS.base;
    return ranks.find(r => txCount >= r.min && txCount <= r.max)?.name || '';
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-2xl font-pixel text-white mb-4 text-gradient">Loading Wallet Data</h1>
          {/* <p className="text-gray-400 mb-6">Fetching data from Base blockchain...</p> */}
          <div className="w-12 h-12 border-t-2 border-b-2 border-base-blue border-solid rounded-full animate-spin mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full glass-card p-8"
        >
          <h1 className="text-2xl font-pixel text-white mb-4 text-gradient">Error</h1>
          <p className="text-red-400 mb-6">{error}</p>
          <div className="text-gray-400 mb-6 text-sm">
            <p>Possible issues:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>The Basescan API may be rate limited</li>
              <li>The wallet address or BaseName may not exist on Base</li>
              <li>There may be network issues</li>
              <li>Invalid BaseName format (should be name.base or name.base.eth)</li>
            </ul>
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 px-6 bg-base-blue font-pixel text-white text-sm rounded-lg transition-all duration-300"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  // No data available
  if (!walletData) {
    return null;
  }

  // Calculate rank after we know walletData exists
  const rank = getRank(selectedChain, walletData.transactionCount);

  // Format the wallet address for display
  const displayAddress = walletData.baseName || `${walletData.address.slice(0, 6)}...${walletData.address.slice(-4)}`;
  // Always compute pageTitle from the latest walletData
  let pageTitle = 'Based (Baby)';
  if (walletData.baseName && walletData.baseName.endsWith('.base.eth')) {
    const namePart = walletData.baseName.replace(/\.base\.eth$/, '');
    pageTitle = `Based (${namePart})`;
  } else if (walletData.baseName) {
    pageTitle = `Based (${walletData.baseName})`;
  } else if (walletData.address) {
    pageTitle = `Based (${walletData.address.slice(0, 6)})`;
  }

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  // Share/export as image handler
  const handleShare = async () => {
    if (!resultsRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: '#000',
        useCORS: true,
        scale: 2,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${walletData.baseName || walletData.address}_analytics.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export image.');
    } finally {
      setDownloading(false);
    }
  };

  // In the component, get the rank object:
  const rankObj = (RANKS[selectedChain] || RANKS.base).find(r => walletData.transactionCount >= r.min && walletData.transactionCount <= r.max) || RANKS.base[0];

  return (
    <BackgroundLines
      className="min-h-screen text-white relative"
      svgOptions={{ duration: 15 }}
    >
      <Head>
        <title>{pageTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <div className="container mx-auto max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl px-1 xs:px-2 sm:px-4 py-4 md:py-8 relative z-10 content-container">
        {/* Chain Selector Dropdown */}
        <div className="flex justify-center mb-4 sm:mb-8">
          <div className="relative inline-block w-full max-w-[220px] xs:max-w-xs sm:max-w-sm md:max-w-md">
            <button
              type="button"
              className={`w-full flex items-center justify-between font-pixel text-xs xs:text-base sm:text-lg rounded-lg px-2 xs:px-3 sm:px-4 py-2 border-2 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 ${chainTheme.color} text-white shadow transition`}
              onClick={() => setDropdownOpen(v => !v)}
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen ? 'true' : 'false'}
            >
              <span className="flex items-center gap-2">
                <ChainIcon chain={selectedChain} size={18} />
                {CHAIN_OPTIONS.find(opt => opt.value === selectedChain)?.label}
              </span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {dropdownOpen && (
              <ul className="absolute z-10 mt-2 w-full bg-black border border-gray-700 rounded-lg shadow-lg">
                {CHAIN_OPTIONS.map(opt => (
                  <li
                    key={opt.value}
                    className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-800 font-pixel text-xs xs:text-base sm:text-lg ${opt.value === selectedChain ? 'bg-gray-900' : ''}`}
                    onClick={() => { setSelectedChain(opt.value); setDropdownOpen(false); }}
                    role="option"
                    aria-selected={opt.value === selectedChain}
                  >
                    <ChainIcon chain={opt.value} size={16} />
                    {opt.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div ref={resultsRef}>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-6 sm:mb-8 md:mb-12"
          >
            <div className="flex flex-col items-center justify-center mb-2">
              <span className="text-3xl xs:text-4xl md:text-5xl mb-1">{rankObj.emoji}</span>
              <span className={`font-pixel text-lg xs:text-xl md:text-3xl mb-1 ${chainTheme.accent}`}>{rankObj.name}</span>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
              <h2 className="text-base xs:text-xl sm:text-2xl font-pixel text-gray-300">
                {walletData.profileName || displayAddress}
              </h2>
            </div>
            <div className="relative group">
              {!walletData.baseName && (
                <div className="absolute inset-x-0 -bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-black/80 text-xs p-2 rounded-lg">
                    {walletData.address}
                  </div>
                </div>
              )}
              {/* Show BaseName if found and user entered an address */}
              {walletData.baseName && walletData.baseName.endsWith('.base.eth') && walletData.baseName !== displayAddress && (
                <div className="mt-2 text-base-blue font-pixel text-xs sm:text-sm">
                  BaseName: <span className="text-white">{walletData.baseName}</span>
                </div>
              )}
            </div>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-4 sm:gap-8 mb-8 sm:mb-12 md:mb-16 max-w-xs sm:max-w-2xl mx-auto"
          >
            {/* Transactions Card */}
            <motion.div variants={itemVariants} className="glass-card p-4 xs:p-6 md:p-8">
              <div className="text-center">
                <h2 className="value-display">
                  {walletData.transactionCount}
                </h2>
                <p className="font-pixel text-lg xs:text-xl md:text-2xl mb-2 sm:mb-4 text-gradient">
                  Txns
                </p>
                <p className="text-xs sm:text-sm font-pixel text-gray-400">
                  {walletData.outgoingTransactions} outgoing transactions<br />on Base blockchain
                </p>
              </div>
            </motion.div>

            {/* Volume Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
              {/* Incoming ETH Card */}
              <motion.div variants={itemVariants} className="glass-card p-4 sm:p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <h3 className="font-pixel text-base sm:text-lg text-yellow-400">Incoming ETH</h3>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg sm:text-2xl font-bold font-pixel text-yellow-400">
                        {parseFloat(walletData.ethVolumeIn).toFixed(4)}
                      </span>
                      <span className="text-xs sm:text-sm font-pixel text-yellow-400/70">{getNativeSymbol(selectedChain)}</span>
                    </div>
                    <div className="text-xs sm:text-sm font-pixel text-gray-400">
                      ${walletData.ethVolumeInUsd}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Outgoing ETH Card */}
              <motion.div variants={itemVariants} className="glass-card p-4 sm:p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <h3 className="font-pixel text-base sm:text-lg text-red-400">Outgoing ETH</h3>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg sm:text-2xl font-bold font-pixel text-red-400">
                        {parseFloat(walletData.ethVolumeOut).toFixed(4)}
                      </span>
                      <span className="text-xs sm:text-sm font-pixel text-red-400/70">{getNativeSymbol(selectedChain)}</span>
                    </div>
                    <div className="text-xs sm:text-sm font-pixel text-gray-400">
                      ${walletData.ethVolumeOutUsd}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Incoming USDC Card */}
              <motion.div variants={itemVariants} className="glass-card p-4 sm:p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <h3 className="font-pixel text-base sm:text-lg text-blue-400">Incoming USDC</h3>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg sm:text-2xl font-bold font-pixel text-blue-400">
                        {parseFloat(walletData.usdcVolumeIn).toFixed(2)}
                      </span>
                      <span className="text-xs sm:text-sm font-pixel text-blue-400/70">USDC</span>
                    </div>
                    <div className="text-xs sm:text-sm font-pixel text-gray-400">
                      ${walletData.usdcVolumeInUsd}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Outgoing USDC Card */}
              <motion.div variants={itemVariants} className="glass-card p-4 sm:p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <h3 className="font-pixel text-base sm:text-lg text-purple-400">Outgoing USDC</h3>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg sm:text-2xl font-bold font-pixel  text-purple-400">
                        {parseFloat(walletData.usdcVolumeOut).toFixed(2)}
                      </span>
                      <span className="text-xs sm:text-sm font-pixel text-purple-400/70">USDC</span>
                    </div>
                    <div className="text-xs sm:text-sm font-pixel text-gray-400">
                      ${walletData.usdcVolumeOutUsd}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Gas Card */}
            <motion.div variants={itemVariants} className="glass-card p-4 xs:p-6 md:p-8">
              <div className="text-center">
                <h2 className="value-display">
                  {parseFloat(walletData.gasSpent.ethAmount).toFixed(4)} <span className="text-yellow-400">{getNativeSymbol(selectedChain)}</span>
                </h2>
                <p className="usd-value mb-1 sm:mb-2">
                  ${walletData.gasSpent.usdAmount}
                </p>
                <p className="font-pixel text-base md:text-2xl mb-2 sm:mb-4 text-gradient">
                  Gas Spent
                </p>
                <p className="text-xs sm:text-sm font-pixel text-gray-400">
                  Current ETH price: ${walletData.ethPrice?.toFixed(2) || "N/A"}
                  {walletData.ethPrice && Number(walletData.ethPrice) === 3000 && (
                    <span className="text-red-400 ml-2">(Not live - using fallback)</span>
                  )}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Bottom Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center flex flex-col md:flex-row gap-4 justify-center items-center mt-8"
        >
          <motion.button
            onClick={handleShare}
            className="px-8 py-4 bg-gradient-to-r from-base-blue to-purple-600 font-pixel text-white rounded-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-900/20 mb-2 md:mb-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={downloading}
          >
            {downloading ? 'Exporting...' : 'Share as Image'}
          </motion.button>
          <motion.button
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-base-blue font-pixel text-white rounded-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-900/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            CHECK ANOTHER WALLET
          </motion.button>
        </motion.div>

        {/* After walletData is loaded and before/after main stats, render the heatmap */}
        <div className="my-8">
          {streakLoading ? (
            <div className="text-center text-gray-400 font-pixel">Loading onchain streak...</div>
          ) : streakError ? (
            <div className="text-center text-red-400 font-pixel">{streakError}</div>
          ) : streakData ? (
            <OnchainHeatmap
              dailyActivity={streakData.dailyActivity}
              currentStreak={streakData.currentStreak}
              longestStreak={streakData.longestStreak}
              totalActiveDays={streakData.totalActiveDays}
            />
          ) : null}
        </div>
      </div>
    </BackgroundLines>
  );
} 