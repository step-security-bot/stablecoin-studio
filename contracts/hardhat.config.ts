import "@nomicfoundation/hardhat-toolbox";
import "@hashgraph/hardhat-hethers";
import "@hashgraph/sdk";
import { PrivateKey } from "@hashgraph/sdk";
require('hardhat-abi-exporter');

require('hardhat-abi-exporter');

module.exports = {
  solidity: "0.8.10",
  defaultNetwork: "testnet", // The selected default network. It has to match the name of one of the configured networks.
  hedera: {
    gasLimit: 300000, // Default gas limit. It is added to every contract transaction, but can be overwritten if required.
    networks: {
      testnet: {
        // The name of the network, e.g. mainnet, testnet, previewnet, customNetwork
        accounts: [
          // An array of predefined Externally Owned Accounts
          {
            // OG Account
            account: "0.0.30917952",
            privateKey:"302e020100300506032b657004220420634da975de171336cf59672de59f6ad10db7c3c7fe8e426889c15f58275e3f54",
            publicKey:"302a300506032b65700321000d1356ad59d01a1031fc7cb7fad964a8205a2fdd7f766e6d394c1db3d09cb0f6",
            isED25519Type: true
          },
        ],
      },
    },
  },
  mocha: {
    timeout: 400000,
  },
};










