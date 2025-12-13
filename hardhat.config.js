require("dotenv").config({ path: ".env.local" });

require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");

// Verify PRIVATE_KEY is loaded
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || PRIVATE_KEY === "") {
  console.error("\n❌ ERROR: PRIVATE_KEY not found in .env.local");
  console.error("Please add your wallet private key to .env.local\n");
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.30",
    settings: {
      optimizer: {
        enabled: false, // Match your original deployment
        runs: 200,
      },
    },
  },
  networks: {
    // Celo Mainnet
    celo: {
      url: "https://forno.celo.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 42220,
      timeout: 60000,
    },
    // Celo Alfajores Testnet
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 44787,
      timeout: 60000,
    },
    // Local development
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  etherscan: {
    apiKey: {
      celo: process.env.CELOSCAN_API_KEY || "dummy-key",
      alfajores: process.env.CELOSCAN_API_KEY || "dummy-key",
    },
    customChains: [
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io",
        },
      },
      {
        network: "alfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://api-alfajores.celoscan.io/api",
          browserURL: "https://alfajores.celoscan.io",
        },
      },
    ],
  },
  sourcify: {
    enabled: true,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

