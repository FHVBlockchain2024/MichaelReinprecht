pragma solidity ^0.8.0;

contract GuessTheNumber {
    address public owner;
    uint private answer;
    uint public rewardPool;
    mapping(address => uint) public guesses;

    // Event to announce a correct guess
    event CorrectGuess(address indexed player, uint amountWon);
    // Event to announce an incorrect guess
    event IncorrectGuess(address indexed player, uint guess);

    constructor() payable {
        owner = msg.sender;
        rewardPool = msg.value; // Initial reward pool
        generateRandomAnswer();
    }

    function getRewardPool() public view returns (uint256) {
        return rewardPool;
    }

    // Function to generate a new random number
    function generateRandomAnswer() private {
        answer =
            (uint(
                keccak256(abi.encodePacked(block.timestamp, block.difficulty))
            ) % 10) +
            1;
    }

    // Function to guess the number
    function guess(uint _guess) public payable returns (string memory) {
        require(_guess >= 1 && _guess <= 10, "Guess must be between 1 and 10.");
        require(
            msg.value == 0.01 ether,
            "You must send exactly 0.01 ether to make a guess."
        );

        guesses[msg.sender] = _guess;

        if (_guess == answer) {
            // Send reward to the player and reset the game
            payable(msg.sender).transfer(rewardPool);
            emit CorrectGuess(msg.sender, rewardPool);
            uint reward = rewardPool;
            rewardPool = 0; // Empty reward pool after payout
            generateRandomAnswer();
            return
                string(
                    abi.encodePacked(
                        "Congratulations! You guessed correctly! You won: ",
                        uint2str(reward),
                        ". Current reward pool: ",
                        uint2str(rewardPool)
                    )
                );
        } else {
            // Increase reward pool with failed attempts
            rewardPool += msg.value;
            emit IncorrectGuess(msg.sender, _guess);
            return
                string(
                    abi.encodePacked(
                        "Sorry, that guess is incorrect. Current reward pool: ",
                        uint2str(rewardPool)
                    )
                );
        }
    }

    // Helper function to convert uint to string, because for some dumb reason solidity doesn't provice this ...?
    function uint2str(uint _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            bstr[--k] = bytes1(uint8(48 + (_i % 10)));
            _i /= 10;
        }
        return string(bstr);
    }

    // Only allow owner to reset the game
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

    // Function for the owner to add funds to the reward pool
    function addFunds() public payable onlyOwner {
        rewardPool += msg.value;
    }

    // Fallback function to receive ether directly
    receive() external payable {
        addFunds();
    }
}
