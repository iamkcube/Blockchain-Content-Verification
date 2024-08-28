require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: 'https://eth-sepolia.g.alchemy.com/v2/whymLc7PfHy5qGIgCKSsf2cAeVDGJgOZ',
      accounts: ['affcc5ece628e36a8da67a47a159e994e6faad5032fc78f3a6e4e17a61bdbe3f']
    }
  }
};
