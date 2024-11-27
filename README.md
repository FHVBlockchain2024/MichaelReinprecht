Technically, the Frontend should handle everything (if you have MetaMask installed), so everything you have to do is navigate to "MichaelReinprecht/frontend/gamble-frontend" and run the command "npm run start" to start the react frontend.

For some reason for me sometimes an error message is displayed when first starting up the page, in this case please just reload the page using F5 and it should work.

Next connect your Wallet via the "Connect Wallet" Button.

At this point you should be able to guess a number between 1 and 9, if you guess the correct number you'll win the reward pool, otherwhise the payment for your guess (0.01) will be added to the rewardpool. Feedback if you've won or not will be provided, this however takes some times since you have to wait for the transaction to conclude.

The problem I've mentioned in a mail before, is that via the frontend you'll actually get feedback about how your balance is expected to change -> removing the gambling aspect ... 


If not using the frontend, this setup should work for the hardhat console (this however does not provide proper feedback): 

npx hardhat console --network sepolia

const abi = require('./artifacts/contracts/GuessTheNumber.sol/GuessTheNumber.json').abi; 

const contractAddress = "0xCddd593a1Cfe31Ef3Ddf23d036A712130652193F";

signer = await ethers.provider.getSigner();

const contractWithSigner = new ethers.Contract(contractAddress, abi, signer);


//Make a guess

guessTx = await contractWithSigner.guess(5, { value: ethers.parseEther("0.01") });
