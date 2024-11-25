const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const GuessTheNumberModule = buildModule("GuessTheNumberModule", (m) => {
  const guessTheNumber = m.contract("GuessTheNumber");

  return { guessTheNumber };
});

module.exports = GuessTheNumberModule;
