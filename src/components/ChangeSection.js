import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction } from '@solana/web3.js';

const ChangeSection = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!publicKey) {
      setStatus('Please connect your wallet first');
      return;
    }

    try {
      setStatus('Creating transaction...');
      
      const transaction = new Transaction();
      
      setStatus('Requesting approval...');
      const signature = await sendTransaction(transaction, connection);
      
      setStatus('Transaction sent! Confirming...');
      await connection.confirmTransaction(signature);
      
      setStatus('Transaction confirmed!');
      setMessage('');
      setAmount('');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg border-2 border-gray-700">
      <h2 className="text-green-500 text-2xl mb-4 font-bold">Change MTard</h2>
      
      <div className="mb-4">
        <WalletMultiButton className="bg-green-500 hover:bg-green-600" />
      </div>

      {publicKey && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Message</label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-gray-800 text-white p-2 rounded"
              placeholder="Enter your message"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-800 text-white p-2 rounded"
              placeholder="Enter amount"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Change MTard
          </button>
        </form>
      )}

      {status && (
        <div className="mt-4 text-gray-300">
          Status: {status}
        </div>
      )}
    </div>
  );
};

export default ChangeSection;
