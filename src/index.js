import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import 'buffer';
import { Buffer } from 'buffer';

window.Buffer = Buffer;

require('@solana/wallet-adapter-react-ui/styles.css');

const endpoint = 'https://mainnet.helius-rpc.com';
const wallets = [new PhantomWalletAdapter()];

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
  <React.StrictMode>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
    </React.StrictMode>
);
} catch (error) {
  console.error('Error rendering application:', error);
}
