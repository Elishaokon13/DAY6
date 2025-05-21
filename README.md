# Contract Verification-as-a-Service

A modern, multi-network smart contract verification tool built with Next.js, TypeScript, Tailwind CSS, and Aceternity UI.

## Features

- Verify contracts on Ethereum, Base, and Arbitrum
- Multi-network, multi-explorer support
- Animated, modern UI with custom dropdowns and tooltips
- Bytecode, source code, ABI, and compiler version input
- Real-time feedback, warnings, and error handling

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env.local` and fill in your API keys:
     ```
     ETHERSCAN_API_KEY=your_etherscan_key
     BASESCAN_API_KEY=your_basescan_key
     ARBISCAN_API_KEY=your_arbiscan_key
     ```

3. **Run locally:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## Testing

- **API Route Tests:**
  ```bash
  npx jest src/app/api/verify/route.test.ts
  ```
- **UI Tests (Playwright):**
  ```bash
  npx playwright test
  ```

## Deployment

### Vercel (Recommended)
- Push your code to GitHub.
- Import your repo at [vercel.com](https://vercel.com).
- Set environment variables in the Vercel dashboard.
- Deploy!

### Render (for custom backend)
- Push backend code to a separate repo if needed.
- Create a new Web Service at [render.com](https://render.com).
- Set environment variables.
- Deploy.

## Troubleshooting

- Make sure your API keys are correct and have sufficient quota.
- If contract verification fails, check the error/warning messages for details.
- For advanced debugging, check the browser console and server logs.

## License

MIT
