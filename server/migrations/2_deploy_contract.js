var LogContract = 
artifacts.require("./LogContract.sol");

module.exports = function(deployer){
	deployer.deploy(LogContract, {gas: 1000000000000});
};
