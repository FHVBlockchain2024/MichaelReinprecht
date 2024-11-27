import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import GuessTheNumber from './GuessTheNumber.json'; // ABI file

const contractAddress = '0xCddd593a1Cfe31Ef3Ddf23d036A712130652193F'; // Replace with your contract address

function App() {
    const [account, setAccount] = useState('');
    const [guess, setGuess] = useState(1);
    const [message, setMessage] = useState('');
    const [rewardPool, setRewardPool] = useState(0);
    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);
    const [feedback, setFeedback] = useState(""); // For displaying feedback

    useEffect(() => {
        const init = async () => {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                
                const contractABI = GuessTheNumber.abi; // Access the 'abi' property directly
                
                const contract = new ethers.Contract(contractAddress, contractABI, signer);
                setProvider(provider);
                setContract(contract);
            } else {
                alert("Please install MetaMask!");
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (contract) {
            // Listen for CorrectGuess event
            const correctGuessListener = (player, amountWon) => {
                setFeedback(`Congratulations! Player: ${player}, Amount Won: ${ethers.formatEther(amountWon)} ETH`);
            };

            // Listen for IncorrectGuess event
            const incorrectGuessListener = (player, guess) => {
                setFeedback(`Sorry, Player: ${player}, Guess: ${guess} was incorrect.`);
            };

            // Set up event listeners
            contract.on("CorrectGuess", correctGuessListener);
            contract.on("IncorrectGuess", incorrectGuessListener);

            // Clean up listeners on component unmount
            return () => {
                contract.off("CorrectGuess", correctGuessListener);
                contract.off("IncorrectGuess", incorrectGuessListener);
            };
        }
    }, [contract]);

    const connectWallet = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
    };

    const handleGuess = async () => {
        try {
            const tx = await contract.guess(guess, { value: ethers.parseEther('0.01') });
            await tx.wait();
            const rewardPool = await contract.getRewardPool();
            setRewardPool(ethers.formatEther(rewardPool));
            setMessage(`Guess submitted: ${guess}`);
        } catch (error) {
            console.error(error);
            setMessage('Transaction failed!');
        }
    };

    // Keep the rewardPool up to date (update every 5 seconds ...)
    useEffect(() => {
      const fetchRewardPool = async () => {
          if (contract) {
              const rewardPool = await contract.getRewardPool();
              setRewardPool(ethers.formatEther(rewardPool));
          }
      };
  
      // Fetch the reward pool when the component mounts
      fetchRewardPool();
  
      // Set up polling to update the reward pool every 5 seconds (5000 ms)
      const intervalId = setInterval(fetchRewardPool, 5000);
  
      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
  }, [contract]);

    return (
        <div className="App">
            <div className="container">
                <h1>Guess the Number Game</h1>
                <button className="connect-button" onClick={connectWallet}>Connect Wallet</button>
                <h3>Your Account: {account}</h3>
                <h4 className="reward-pool">Current Reward Pool: {rewardPool} ETH</h4>
                <div className="guess-input">
                    <input
                        type="number"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        min="1"
                        max="10"
                        placeholder="Enter your guess (1-10)"
                    />
                    <button className="guess-button" onClick={handleGuess}>Submit Guess</button>
                </div>
                <p className="message">{message}</p>
                <p className="feedback">{feedback}</p>
            </div>
        </div>
    );
}

export default App;
