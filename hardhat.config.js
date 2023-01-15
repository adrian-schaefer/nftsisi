require("@nomiclabs/hardhat-waffle");
const fs = require('fs');
const clavePrivada = fs.readFileSync(".secret").toString().trim() || "01234567890123456789";
const idInfura = fs.readFileSync(".infuraid").toString().trim() || "";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      // Infura
      url: `https://polygon-mumbai.infura.io/v3/${idInfura}`,
      accounts: [clavePrivada]
    },
    matic: {
      // Infura
      url: `https://polygon-mainnet.infura.io/v3/${idInfura}`,
      accounts: [clavePrivada]
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};