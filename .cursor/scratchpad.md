# Project Scratchpad

## Background and Motivation
This project is a multi-chain wallet analytics tool that allows users to check their transaction metrics across different chains (Base, Ethereum, and Optimism). The application has evolved from a Base-only analytics tool to a comprehensive multi-chain solution that provides detailed insights into user's onchain activity.

Current Features:
- Multi-chain support (Base, Ethereum, Optimism)
- Transaction count and gas usage tracking
- USD conversion for all metrics
- Chain-specific name resolution (.eth, .op, .base.eth)
- Chain-specific rank system with custom thresholds
- Profile/avatar integration
- Modern, responsive UI with chain-specific theming

## Key Challenges and Analysis
1. Data Consistency Across Chains:
   - Different APIs (Basescan, Etherscan, Optimistic Etherscan)
   - Varying data formats and response structures
   - Chain-specific token contracts and addresses
   - Rate limiting and API reliability

2. Name Resolution:
   - Chain-specific naming services (ENS, Optimism Name Service, Base Name Service)
   - Different resolver contracts and methods
   - Handling resolution failures gracefully
   - Caching resolved names for performance

3. UI/UX Considerations:
   - Chain-specific theming and branding
   - Responsive design across all device sizes
   - Clear error messaging for chain-specific issues
   - Intuitive chain switching experience

## High-level Task Breakdown
1. Data Fetching and Processing
   - [ ] Review and optimize chain-specific API calls
     - Success Criteria:
       - Each chain's API calls are properly rate-limited
       - Error handling is consistent across all chains
       - Response formats are normalized
       - API keys are properly managed
   - [ ] Implement proper error handling for each chain's API
     - Success Criteria:
       - Clear error messages for each type of failure
       - Graceful fallbacks when APIs are unavailable
       - User-friendly error display in UI
   - [ ] Add caching layer for frequently accessed data
     - Success Criteria:
       - In-memory cache for ETH prices (1-minute TTL)
       - Redis cache for transaction history (5-minute TTL)
       - Cache invalidation on errors
   - [ ] Validate data consistency across chains
     - Success Criteria:
       - Transaction counts match between different APIs
       - Gas calculations are accurate for each chain
       - Token balances are consistent

2. Name Resolution Enhancement
   - [ ] Implement proper error handling for each naming service
     - Success Criteria:
       - Clear error messages for resolution failures
       - Proper handling of expired names
       - Support for reverse resolution
   - [ ] Add caching for resolved names
     - Success Criteria:
       - 1-hour TTL for resolved names
       - Cache invalidation on resolution failures
       - Proper handling of cache misses
   - [ ] Improve error messages for resolution failures
     - Success Criteria:
       - Chain-specific error messages
       - Clear instructions for users
       - Proper handling of invalid names
   - [ ] Add support for reverse resolution
     - Success Criteria:
       - Support for all chain naming services
       - Proper error handling
       - Cache support

3. UI/UX Improvements
   - [ ] Enhance chain switching experience
     - Success Criteria:
       - Smooth transitions between chains
       - Clear loading states
       - Proper error handling
   - [ ] Add loading states for chain-specific operations
     - Success Criteria:
       - Loading indicators for all async operations
       - Proper error states
       - Clear feedback to users
   - [ ] Improve error message presentation
     - Success Criteria:
       - Chain-specific error messages
       - Clear instructions for users
       - Proper error recovery
   - [ ] Add tooltips for chain-specific features
     - Success Criteria:
       - Clear explanations of features
       - Chain-specific information
       - Proper mobile support

4. Testing and Validation
   - [ ] Add unit tests for chain-specific logic
     - Success Criteria:
       - Test coverage for all chain-specific functions
       - Mock API responses
       - Error case coverage
   - [ ] Implement integration tests for multi-chain features
     - Success Criteria:
       - End-to-end testing of chain switching
       - Data consistency tests
       - Error handling tests
   - [ ] Add end-to-end tests for critical user flows
     - Success Criteria:
       - Test all major user journeys
       - Cross-chain functionality
       - Error recovery flows
   - [ ] Test with various wallet addresses across chains
     - Success Criteria:
       - Test with real addresses on each chain
       - Test with ENS/BaseName addresses
       - Test error cases

## Multi-Chain Support
- Abstracting data-fetching logic to support multiple chains with different APIs and data formats.
- Handling different token/NFT contracts and explorers per chain.
- UI/UX for chain selection and cross-chain summaries.

## Historical Balance & Portfolio Chart
- Efficiently fetching historical balances (block-by-block or via third-party APIs).
- Getting accurate historical price data for tokens (ETH, USDC, etc.).
- Charting and visualizing time-series data in a performant, responsive way.

## Protocol/Category Breakdown
- Identifying protocols/dApps from transaction data (contract address mapping, signature decoding, or third-party APIs).
- Categorizing protocols (DEX, lending, NFT, bridge, etc.).
- Aggregating and visualizing the data (pie/bar charts, top lists).

## High-level Task Breakdown
- [Current state] The application allows users to enter a Base wallet address and view both their total transaction count and the amount of ETH spent on gas fees, with clear distinction between total and outgoing transactions.
- [Completed] Redesign the UI to match the "Based Baby" aesthetic with pixel art style, confetti elements, and engaging copy
- [Completed] Add USD conversion for gas spent using real-time ETH price from CoinGecko
- [Completed] Replace simulated NFTs with actual transaction volume data
- [Completed] Enhance the UI to be sleeker and more responsive across all device sizes
- [Completed] Add animated line background for a more professional and engaging look

## Multi-Chain Support
- [ ] Research and select supported chains (Ethereum, Optimism, Arbitrum, etc.).
- [ ] Abstract backend data-fetching logic to accept a `chain` parameter.
- [ ] Integrate with APIs/providers for each chain (Etherscan, Optimism Explorer, Arbiscan, etc.).
- [ ] Update frontend to add a chain selector (dropdown or tabs).
- [ ] Display analytics for the selected chain.
- [ ] (Optional) Show a summary view across all chains.

## Historical Balance & Portfolio Chart
- [ ] Research APIs for historical balances (Covalent, Alchemy, Etherscan, etc.).
- [ ] Implement backend logic to fetch historical balances for ETH/USDC.
- [ ] Fetch historical price data for tokens (CoinGecko, CryptoCompare, etc.).
- [ ] Aggregate and format data for charting.
- [ ] Integrate a charting library (Chart.js, Recharts, ApexCharts, etc.) in the frontend.
- [ ] Add UI for selecting timeframes (7d, 30d, 90d, custom).

## Protocol/Category Breakdown
- [ ] Research methods/APIs for protocol identification (contract lists, 4byte, DeBank, Zerion, Dune, etc.).
- [ ] Implement backend logic to parse and categorize transactions by protocol/dApp.
- [ ] Aggregate data by protocol/category (volume, count).
- [ ] Integrate a pie/bar chart in the frontend for visualization.
- [ ] Display a list of top dApps/protocols with volume and transaction count.

## Project Status Board
- [x] Initial project setup with Next.js and Tailwind CSS
- [x] Implement main wallet lookup interface
- [x] Integrate with Basescan API for transaction data
- [x] Display transaction count and gas usage metrics
- [x] Add mobile responsiveness
- [x] Implement comprehensive logging for debugging
- [x] Optimize blockchain API calls
- [x] Implement pixel art UI with "Based Baby" branding
- [x] Add confetti/particle background effects
- [x] Create the blue wave design with year markers
- [x] Update copy to be more engaging and playful
- [x] Ensure responsive design for the new UI
- [x] Add USD value calculation for gas spent using CoinGecko API
- [x] Calculate and display total transaction volume in ETH and USD
- [x] Enhance UI with sleek animations and glass-morphism design
- [x] Optimize responsive design for all device sizes
- [x] Replace particle background with animated line background
- [ ] Multi-Chain Support: Not started
- [ ] Historical Balance & Portfolio Chart: Backend function for daily ETH/USDC balances in progress
- [ ] Protocol/Category Breakdown: Not started

## Current Status / Progress Tracking
The application now has a sleek, modern UI with a pixel art aesthetic for the "Based Baby" brand. It features responsive glass-morphism cards, smooth animations, and an animated line background that creates a sophisticated, dynamic feel. The app displays transaction data (count and volume) and gas usage in both ETH and USD, with the UI optimized for all device sizes from mobile to desktop.

Currently implementing: Backend function to fetch ETH and USDC balances for a given address at daily intervals over a date range using Alchemy.

## Executor's Feedback or Assistance Requests
- Starting backend implementation for historical balance charting. Will need Alchemy API key and USDC contract address for each chain supported.

## Lessons
- Include info useful for debugging in the program output
- Read the file before trying to edit it
- Handle API rate limits and errors gracefully
- Use proxy/eth_getTransactionCount endpoint for more efficient data retrieval
- When implementing new UI designs, reuse existing components where possible to maintain consistency
- Always include error handling and fallback values when fetching external API data like cryptocurrency prices
- When displaying financial data, show both cryptocurrency and fiat values when possible
- Use CSS custom properties for better theming and consistency across components
- Implement progressive enhancement for animations to ensure they don't affect performance on lower-end devices
- Consider the visual weight of animated elements to avoid overwhelming the user interface
- None yet.

## Onchain Commit Tracker ("Onchain GitHub Commits" Feature)

### Background and Motivation
Inspired by a tweet from BD at Alchemy, the goal is to build a feature similar to GitHub's commit tracker, but for onchain activity. Users will be able to see how many days per week they are "onchain" (i.e., have at least one transaction on a given day), visualize their streaks, and share their score or streak with friends. This gamifies onchain participation and encourages regular blockchain engagement.

### Key Challenges and Analysis
- **Efficiently grouping transactions by day:** Need to process transaction history and group by calendar day (UTC or user local time).
- **Defining "onchain day":** What counts as an onchain day? (At least one transaction on any supported chain.)
- **Multi-chain support:** Should streaks be chain-specific or aggregate across all chains?
- **Performance:** Large wallets may have thousands of transactions; need efficient processing and possibly caching.
- **Shareable output:** Generating a visually appealing, shareable image or link for users to show their streak/score.
- **Privacy:** Only public data, but consider if users want to hide certain activity.

### High-level Task Breakdown
1. **Backend: Transaction Grouping Logic**
   - [ ] Implement a function to group a wallet's transactions by day (UTC) for a given date range and chain.
     - Success Criteria: Given a wallet and date range, returns a map of dates to transaction counts.
   - [ ] Add API endpoint to fetch onchain activity streak data for a wallet (optionally per chain or aggregate).
     - Success Criteria: API returns daily activity, current streak, longest streak, and total active days.
   - [ ] Optimize for large wallets (pagination, caching, or batch processing).
     - Success Criteria: Handles wallets with >10,000 transactions without timeout or memory issues.

2. **Frontend: Commit Tracker Visualization**
   - [ ] Design a UI component similar to GitHub's contribution graph (calendar heatmap) to display onchain days.
     - Success Criteria: Users can visually see their active days, streaks, and gaps for a selected period (e.g., last 90 days).
   - [ ] Display current streak, longest streak, and total active days as summary stats.
     - Success Criteria: Stats update correctly as user changes wallet or chain.
   - [ ] Add a "Share your streak" button to export the graph and stats as an image (using html2canvas or similar).
     - Success Criteria: Downloaded image matches the on-screen visualization and includes wallet/chain info.

3. **Testing and Validation**
   - [ ] Unit tests for backend grouping and streak calculation logic.
     - Success Criteria: All edge cases (e.g., no activity, multiple chains, daylight savings) are covered.
   - [ ] Integration tests for API and frontend visualization.
     - Success Criteria: End-to-end test from wallet input to streak display and image export.

4. **(Optional) Social/Leaderboard Features**
   - [ ] Allow users to compare streaks with friends (by wallet address or ENS).
     - Success Criteria: Users can enter multiple addresses and see a leaderboard of streaks.
   - [ ] Add social sharing (Twitter/X, Telegram, etc.) for streak images or links.
     - Success Criteria: Share button generates a pre-filled tweet or message with the streak image/link.

### Project Status Board (Onchain Commit Tracker)
- [ ] Backend: Group transactions by day for a wallet
- [ ] Backend: API endpoint for streak data
- [ ] Backend: Optimize for large wallets
- [ ] Frontend: Calendar heatmap visualization
- [ ] Frontend: Display streak stats
- [ ] Frontend: Share as image button
- [ ] Testing: Backend logic
- [ ] Testing: Frontend and integration
- [ ] (Optional) Leaderboard and social sharing 