import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { ChakraProvider, Box, VStack, Heading, Text, Button, Input, Select, useToast } from '@chakra-ui/react';
import { contractABI } from './contractABI';
import './App.css';
import metamaskLogo from './images/metamask.svg';
import blockrollLogo from './images/blockroll_logo.png';
import headsImage from './images/heads.png';
import tailsImage from './images/tails.png';
import poweredLogo from './images/accelogo.png';

const contractAddress = "0x5E085D8c2fEaa91602Ad82eb2A2D2777E70EdF1f";
const betTokenAddress = "0xaE6121b3c86D7307d962bBfeDEC9E04A3b3F293e";

const AutoDismissMessage = ({ children, duration, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return children;
};

const BetSuccessMessage = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <AutoDismissMessage duration={6000} onClose={onClose}>
      <div className="bet-success-message popup-message">
        <span className="bet-success-icon">✅</span>
        <span className="bet-success-title">Bet Placed Successfully</span>
        <br />
        <span className="bet-success-description">{message}</span>
      </div>
    </AutoDismissMessage>
  );
};

const VRFResultMessage = ({ result, onClose }) => {
  if (!result) return null;
  return (
    <AutoDismissMessage duration={6000} onClose={onClose}>
      <div className="vrf-result">
        <span className="vrf-result-icon">🎲</span>
        <span className="vrf-result-title">VRF Result</span>
        <span className="vrf-result-description">{result}</span>
      </div>
    </AutoDismissMessage>
  );
};

const BetResultMessage = ({ result, onClose }) => {
  if (!result) return null;
  return (
    <AutoDismissMessage duration={6000} onClose={onClose}>
      <div className="bet-result popup-message">
        <span className="bet-result-icon">💰</span>
        <span className="bet-result-title">Bet Result</span>
        <br /> {/* Added line break */}
        <span className="bet-result-description">{result}</span>
      </div>
    </AutoDismissMessage>
  );
};

const ErrorMessage = ({ error, onClose }) => {
  if (!error) return null;
  return (
    <div className="error-message popup-message">
      <span className="error-message-icon">⚠️</span>
      <span className="error-message-title">Error</span>
      <span className="error-message-description">{error.message}</span>
      <button className="error-close-button" onClick={onClose}>×</button>
    </div>
  );
};

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [address, setAddress] = useState('');
  const [playerBalance, setPlayerBalance] = useState('0');
  const [contractBalance, setContractBalance] = useState('0');
  const [betAmount, setBetAmount] = useState('');
  const [betChoice, setBetChoice] = useState('0');
  const [isBetting, setIsBetting] = useState(false);
  const [error, setError] = useState(null);
  const [vrfResult, setVrfResult] = useState(null);
  const [betSuccessMessage, setBetSuccessMessage] = useState(null);
  const [betResult, setBetResult] = useState(null);
  const [showHowTo, setShowHowTo] = useState(false); // default closed
  const toast = useToast();

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      console.log("Ethereum provider detected and set");
    } else {
      console.log("No Ethereum provider detected");
    }
  }, []);

  useEffect(() => {
    if (contract) {
      listenForBetResult();
    }
  }, [contract]);

  const connectWallet = async () => {
    if (provider) {
      try {
        console.log("Requesting account access...");
        await provider.send("eth_requestAccounts", []);
        console.log("Account access granted");

        console.log("Getting signer...");
        const signer = provider.getSigner();
        console.log("Signer obtained");

        console.log("Getting address...");
        const address = await signer.getAddress();
        console.log("Address obtained:", address);

        console.log("Creating contract instance...");
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        console.log("Contract instance created");

        // Update state all at once
        await Promise.all([
          setSigner(signer),
          setAddress(address),
          setContract(contract)
        ]);

        console.log("State updated, now updating balances...");
        await updateBalances();
        console.log("Balances updated");

      } catch (error) {
        console.error("Failed to connect wallet:", error);
        toast({
          title: "Connection Failed",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      console.error("Provider not available");
      toast({
        title: "Connection Failed",
        description: "Ethereum provider not detected. Please install MetaMask or another Web3 wallet.",
        status: "error",
        duration: null,
        isClosable: true,
      });
    }
  };

  const updateBalances = useCallback(async () => {
    console.log("Updating balances...");
    console.log("Contract:", !!contract, "Signer:", !!signer, "Address:", address);

    if (contract && signer && address) {
      try {
        // Get player's token balance directly from the token contract
        const tokenContract = new ethers.Contract(betTokenAddress, [
          "function balanceOf(address) view returns (uint256)"
        ], signer);
        const playerBalanceRaw = await tokenContract.balanceOf(address);
        console.log("Raw player token balance:", playerBalanceRaw.toString());
        
        // Get contract's token balance
        const contractBalanceRaw = await contract.getContractBalance();
        console.log("Raw contract token balance:", contractBalanceRaw.toString());

        // Format and set the balances, rounding down to the nearest whole number
        const formattedPlayerBalance = Math.floor(parseFloat(ethers.utils.formatEther(playerBalanceRaw)));
        const formattedContractBalance = Math.floor(parseFloat(ethers.utils.formatEther(contractBalanceRaw)));

        console.log("Formatted player balance:", formattedPlayerBalance);
        console.log("Formatted contract balance:", formattedContractBalance);

        // Update state
        setPlayerBalance(formattedPlayerBalance);
        setContractBalance(formattedContractBalance);

      } catch (error) {
        console.error("Failed to update balances:", error);
      }
    } else {
      console.error("Cannot update balances: contract, signer, or address is missing");
    }
  }, [contract, signer, address]);

  const bet = async () => {
    setIsBetting(true);
    setError(null);
    try {
      console.log("Placing bet...");
      
      const tokenContract = new ethers.Contract(betTokenAddress, [
        "function balanceOf(address account) view returns (uint256)",
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)"
      ], signer);
      const betAmountWei = ethers.utils.parseEther(betAmount);
      
      // Check balance
      const balance = await tokenContract.balanceOf(address);
      console.log("Current balance:", ethers.utils.formatEther(balance));
      
      if (balance.lt(betAmountWei)) {
        throw new Error("Insufficient balance to place bet");
      }
      
      // Check allowance
      const allowance = await tokenContract.allowance(address, contractAddress);
      console.log("Current allowance:", ethers.utils.formatEther(allowance));
      
      if (allowance.lt(betAmountWei)) {
        console.log("Insufficient allowance, requesting approval...");
        const approveTx = await tokenContract.approve(contractAddress, betAmountWei);
        await approveTx.wait();
        console.log("Approval transaction completed");
      }
      
      // Check contract balance
      const contractBalance = await contract.getContractBalance();
      if (betAmountWei.gt(contractBalance.div(2))) {
        throw new Error("Bet amount is too high for the current contract balance");
      }
      
      // Check bet limits
      const minBet = await contract.getMinBet();
      const maxBet = await contract.getMaxBet();
      if (betAmountWei.lt(minBet) || betAmountWei.gt(maxBet)) {
        throw new Error(`Bet amount must be between ${ethers.utils.formatEther(minBet)} and ${ethers.utils.formatEther(maxBet)} tokens`);
      }
      
      // Check if there's an ongoing bet
      const playerInfo = await contract.playersByAddress(address);
      if (playerInfo.betOngoing) {
        throw new Error("You already have an ongoing bet");
      }
      
      // Place the bet
      console.log("Calling bet with:", betChoice, betAmountWei.toString());
      const tx = await contract.bet(betChoice, betAmountWei);
      console.log("Transaction sent:", tx.hash);
      
      // Wait for the transaction to be confirmed
      await tx.wait();
      console.log("Transaction confirmed");

      // Update the player's balance immediately after placing the bet
      setPlayerBalance(prevBalance => prevBalance - parseFloat(ethers.utils.formatEther(betAmountWei)));

      // Update the state after the transaction is confirmed
      setBetSuccessMessage("Waiting for the result...");

      // Keep isBetting true until the result is received
      // You might want to add a listener for the result here
      // For example, you can set isBetting to false in the listener for BetResult

    } catch (err) {
      console.error(err);
      if (err.code === 'ACTION_REJECTED') {
        setError({ message: "User denied transaction" });
      } else {
        setError(err);
      }
    } finally {
      setIsBetting(false);
    }
  };

  const listenForBetResult = useCallback(() => {
    if (!contract) return;

    contract.on("GeneratedRandomNumber", (requestId, randomNumber) => {
      console.log("VRF Result:", randomNumber.toString());
      const result = randomNumber.mod(2).toNumber();
      setVrfResult(`The coin flip result was: ${result === 0 ? "Heads (0)" : "Tails (1)"}`);
    });

    contract.on("BetResult", async (player, victory, amount) => {
      if (player.toLowerCase() === address.toLowerCase()) {
        const result = victory ? "won" : "lost";
        const amountEth = ethers.utils.formatEther(amount);
        
        // Update the player's balance based on the result
        if (victory) {
          // If the player won, add the winnings (2x the bet amount)
          setPlayerBalance(prevBalance => prevBalance + 2 * parseFloat(betAmount));
        } else {
          // If the player lost, the balance is already deducted
        }

        setBetResult(`You ${result} ${betAmount} tokens!`);
        await updateBalances(); // Ensure contract balance is updated
        setIsBetting(false);
      }
    });

    return () => {
      contract.removeAllListeners("GeneratedRandomNumber");
      contract.removeAllListeners("BetResult");
    };
  }, [contract, address, updateBalances]);

  useEffect(() => {
    if (contract && address) {
      const unsubscribe = listenForBetResult();
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [contract, address, listenForBetResult]);

  useEffect(() => {
    if (address) {
      updateBalances();
    }
  }, [address, updateBalances]);

  const openVRFInfoLink = () => {
    window.open('https://stackoverflow.com/questions/68107865/chain-link-vrf-takes-a-long-time-to-get-random-numbers', '_blank');
  };

  return (
    <ChakraProvider>
      <div className="main-bg">
        {/* TOP BAR */}
        <div className="top-bar">
          <div className="top-left">
            <a href="https://accelchain.xyz" target="_blank" rel="noopener noreferrer" className="powered-by">
              <img src={poweredLogo} alt="Powered By" className="powered-logo" />
              <span>Powered By</span>
            </a>
          </div>
          <div className="top-right">
            {!address ? (
              <button className="connect-button" onClick={connectWallet}>Connect Wallet</button>
            ) : (
              <span className="wallet-address">{address.slice(0, 6)}...{address.slice(-4)}</span>
            )}
          </div>
        </div>
        {/* FLOATING INFO BUTTON */}
        <button className="info-button circular bottom-left" onClick={() => setShowHowTo(true)} title="How to Play">?</button>
        {/* CENTRE CONTENT */}
        <div className="center-content">
          {!address ? (
            <div className="project-desc glassy-panel">
              <img src={blockrollLogo} alt="BlockRoll Logo" className="acc-logo" />
              <h1 className="heading doto-defi">BlockRoll CoinFlip</h1>
              <p className="desc-text">
                Welcome to BlockRoll CoinFlip!<br />
                A decentralized, on-chain coin flip game powered by secure randomness(using Chainlink VRF 2.5 seed).<br /><br />
                <b>How it works:</b><br />
                1. Connect your MetaMask wallet (Sepolia Testnet).<br />
                2. Enter your bet and pick Heads or Tails.<br />
                3. If your choice matches the VRF result, you win 2x your tokens.<br />
                <br />
                All bets are settled on-chain using secure randomness.
              </p>
            </div>
          ) : (
            <div className="bet-panel glassy-panel">
              <div className="header-container">
                <img src={blockrollLogo} alt="BlockRoll Logo" className="acc-logo" />
                <h1 className="heading doto-defi">BlockRoll CoinFlip</h1>
              </div>
              <div className="balances">
                <p className="info-text">Player Balance: {playerBalance} AccelCoin</p>
                <p className="info-text">Contract Balance: {contractBalance} AccelCoin</p>
              </div>
              <div className="bet-form">
                <input
                  className="input-field"
                  placeholder="Bet Amount"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                />
                <div className="coin-choice">
                  <label className="coin-option">
                    <input
                      type="radio"
                      name="betChoice"
                      value="0"
                      checked={betChoice === "0"}
                      onChange={(e) => setBetChoice(e.target.value)}
                    />
                    <img src={headsImage} alt="Heads" className="coin-image" />
                    <span>Heads</span>
                  </label>
                  <label className="coin-option">
                    <input
                      type="radio"
                      name="betChoice"
                      value="1"
                      checked={betChoice === "1"}
                      onChange={(e) => setBetChoice(e.target.value)}
                    />
                    <img src={tailsImage} alt="Tails" className="coin-image" />
                    <span>Tails</span>
                  </label>
                </div>
                <div className="button-container">
                  <button className="bet-button" onClick={bet} disabled={isBetting}>
                    {isBetting ? "Placing Bet..." : "Place Bet"}
                  </button>
                </div>
              </div>
              <div className="message-container">
                <BetSuccessMessage message={betSuccessMessage} onClose={() => setBetSuccessMessage(null)} />
                <VRFResultMessage result={vrfResult} onClose={() => setVrfResult(null)} />
                <BetResultMessage result={betResult} onClose={() => setBetResult(null)} />
                <ErrorMessage error={error} onClose={() => setError(null)} />
              </div>
            </div>
          )}
        </div>
        {/* HOW TO PLAY MODAL */}
        {showHowTo && (
          <div className="howto-modal" onClick={() => setShowHowTo(false)}>
            <div className="howto-card" onClick={e => e.stopPropagation()}>
              <button className="sidebar-close" onClick={() => setShowHowTo(false)}>×</button>
              <strong>How to Play:</strong>
              <ol>
                <li>Connect your MetaMask wallet using the Connect button (on Sepolia Testnet).</li>
                <li>Enter your bet amount and choose either <b>Heads</b> or <b>Tails</b>.</li>
                <li>If your choice matches the VRF (random) result, you win <b>2x</b> your tokens. Otherwise, you win none.</li>
              </ol>
              <div className="how-to-footer">All bets are settled on-chain using secure randomness.</div>
            </div>
          </div>
        )}
      </div>
    </ChakraProvider>
  );
}

export default App;
