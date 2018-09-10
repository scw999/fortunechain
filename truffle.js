var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "athlete like visual feed fluid auto live garage junior double ritual coach";

module.exports = {
     // See <http://truffleframework.com/docs/advanced/configuration>
     // to customize your Truffle configuration!
     networks: {
          ganache: {
               host: "localhost",
               port: 8545,
               network_id: "*" // Match any network id
          },
          ropsten: {
              provider: function() {
                  return new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/e610695a3d3b459d8eabfabe16956500')
              },
              network_id: '3',
              gas: 4500000,
              gasPrice: 10000000000,
          },
          Rinkeby: {
            provider: function() {
                return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3/e610695a3d3b459d8eabfabe16956500')
            },
            network_id: '4',
            gas: 7500000,
            gasPrice: 50000000000,
        }
     }
};
