import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, PublicKey, SystemProgram } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { createMemoInstruction } from '@solana/spl-memo';
import '../styles/wallet-button.css';

const FIXED_USD_AMOUNT = 0.25;

const PromptSection = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const faqItems = [
    {
      question: "Why wasn't my message added to the queue?",
      answer: <>
        1. Message moderation failed:<br/>
        Your message did not pass the automated security moderation system. Please ensure that your message adheres to the rules and is specifically related to Minecraft.<br/><br/>
        2. Transaction delay or failure:<br/>
        The transaction took too long to process or was unsuccessful.
      </>
    },
    {
      question: "How can I manage PlayerTard more effectively?",
      answer: <>
        There are two types of tasks: infinite and finite. The key difference is that an infinite task cannot be completed, meaning the AI will remain in a continuous loop trying to perform it.<br/><br/>
        To assign an infinite goal to the bot, use the format:<br/>
        "Set a goal to [your action] forever"<br/>
        For example:<br/>
        "Set a goal to search for diamonds forever"<br/><br/>
        A finite task, on the other hand, can be completed. However, if the bot determines that it cannot fulfill the task or believes it has already been completed, it will simply stop attempting to execute it.<br/><br/>
        It's important to note that regardless of the type of goal you set, if there are other messages in the queue, your task will be canceled after 3 minutes (subject to change), and the next task in the queue will take priority.
      </>
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!publicKey) {
      setStatus('Please connect your wallet first');
      return;
    }

    try {
      const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/42yzLyxGDjD5RFFQFYNVy7Pzubz6QPCK7HFK52f1pump');
      const data = await response.json();
      const pair = data.pairs.find(p => p.pairAddress === 'GSCC3YzV82uFA8LD5R48mLgE78mXpGWhAVCTgHCvukh7');
      
      if (!pair) {
        throw new Error('Price pair not found');
      }

      const currentPrice = parseFloat(pair.priceUsd);
      const tokenAmount = Math.ceil(FIXED_USD_AMOUNT / currentPrice);

      setStatus('Creating transaction...');
      
      const mtardMint = new PublicKey('42yzLyxGDjD5RFFQFYNVy7Pzubz6QPCK7HFK52f1pump');
      const receiverWallet = new PublicKey('4jkKwjfhcdMh93NBDPzHMAnnBQzxy5Ne7e86n7zT2gz2');

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      const transaction = new Transaction({
        feePayer: publicKey,
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight,
      });

      const senderTokenAccount = await getAssociatedTokenAddress(
        mtardMint,
        publicKey
      );
      const receiverTokenAccount = await getAssociatedTokenAddress(
        mtardMint,
        receiverWallet
      );

      const receiverAccount = await connection.getAccountInfo(receiverTokenAccount);
      
      if (!receiverAccount) {
        const createAtaInstruction = createAssociatedTokenAccountInstruction(
          publicKey,
          receiverTokenAccount,
          receiverWallet,
          mtardMint
        );
        transaction.add(createAtaInstruction);
      }

      const transferAmount = tokenAmount * 1_000_000; // Convert to smallest units (6 decimals)
      const transferInstruction = createTransferInstruction(
        senderTokenAccount,
        receiverTokenAccount,
        publicKey,
        transferAmount
      );
      transaction.add(transferInstruction);

      const memoInstruction = createMemoInstruction(message);
      transaction.add(memoInstruction);

      setStatus('Requesting approval...');
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 5
      });
      
      setStatus('Transaction sent! Confirming...');
      await connection.confirmTransaction({
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight,
        signature: signature
      });
      
      setStatus('Transaction confirmed!');
      setMessage('');
    } catch (error) {
      if (error.message?.trim()) {
        setStatus(`Error: ${error.message}`);
      }
      else {
        setStatus(`Not approved`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="minecraft-panel p-6">
        <h2 className="minecraft-text-green font-bold mb-6 text-2xl text-center">Send Message Using $MTARD</h2>
        
        <div className="flex justify-center mb-6">
          <WalletMultiButton className="wallet-adapter-button wallet-adapter-button-trigger" />
        </div>

        {publicKey && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="minecraft-container p-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message to PlayerTard..."
                className="minecraft-input w-full h-32 resize-none bg-black/80 text-lg p-3"
              />
            </div>
            <div className="flex justify-center">
              <button 
                type="submit" 
                className={`minecraft-btn w-64 py-3 ${!message.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!message.trim()}
              >
                Send Message (0.25$)
              </button>
            </div>
            {status && (
              <div className="minecraft-container p-3 mt-4">
                <p className="minecraft-text text-center bg-black/80 p-3 rounded">
                  {status}
                </p>
              </div>
            )}
          </form>
        )}
      </div>

      <div className="minecraft-panel p-6">
        <h2 className="minecraft-text-green font-bold mb-6 text-2xl text-center">FAQ</h2>
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="minecraft-container">
              <button
                className={`w-full p-4 text-left minecraft-text-green hover:brightness-110 transition-all ${
                  openFaqIndex === index ? 'bg-black/80' : 'bg-black/60'
                }`}
                onClick={() => toggleFaq(index)}
              >
                <div className="flex justify-between items-center">
                  <span>{item.question}</span>
                  <span>{openFaqIndex === index ? '▼' : '▶'}</span>
                </div>
              </button>
              {openFaqIndex === index && (
                <div className="p-4 bg-black/40 minecraft-text-white">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromptSection;