require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("solidity-coverage");

const dotenv = require("dotenv");
dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 9999,
      },
    },
  },
  networks: {
    sepolia: {
      url: `${process.env.RPC_URL_SEPOLIA}`,
      accounts: [privateKey],
      chainId: 11155111,
    },
  },
  gasReporter: {
    enabled: !!process.env.REPORT_GAS,
  },
  contractSizer: {
    runOnCompile: true,
    strict: true,
  },
};

