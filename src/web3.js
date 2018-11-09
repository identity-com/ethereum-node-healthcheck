const Web3 = require('web3');

const web3 = new Web3(process.env.BLOCKCHAIN_NODE_URL);

module.exports = web3;
