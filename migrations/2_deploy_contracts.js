var FortuneChain = artifacts.require("./FortuneChain.sol");

module.exports = function(deployer) {
  deployer.deploy(FortuneChain);
};
