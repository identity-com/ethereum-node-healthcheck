const nr = require('newrelic');
const _ = require('lodash');
const web3 = require('./web3');
const etherscanLatestBlock = require('./etherscan');

const DEFAULT_STALE_BLOCK_THRESHOLD = 5; // we allow MAX 5 blocks lag from etherscan.io
const nodeName = process.env.NEW_RELIC_PROCESS_HOST_DISPLAY_NAME;

module.exports = async (
  compareWithEtherscan = true,
  healthyDeltaThreshold = process.env.STALE_BLOCK_THRESHOLD || DEFAULT_STALE_BLOCK_THRESHOLD
) => {
  const promises = [web3.eth.getBlockNumber(), web3.eth.isSyncing(), web3.eth.net.getPeerCount()];
  if (compareWithEtherscan) {
    promises.push(etherscanLatestBlock());
  }
  const [blockNumber, syncing, peerCount, etherscanBlockNumber] = await Promise.all(promises);
  const result = { isSyncing: _.isObject(syncing), peerCount, blockNumber, nodeName };
  let healthy = syncing === false;

  if (typeof etherscanBlockNumber !== 'undefined') {
    const delta = etherscanBlockNumber - blockNumber;
    healthy = delta <= healthyDeltaThreshold;
    _.assign(result, { etherscanBlockNumber, delta, threshold: healthyDeltaThreshold });
  }

  _.assign(result, { healthy });

  if (!!syncing.highestBlock && !!syncing.currentBlock) {
    _.set(syncing, 'blockDiff', syncing.highestBlock - syncing.currentBlock);
  }

  nr.recordCustomEvent('healthcheck', result);
  nr.recordCustomEvent('syncing', { ...syncing, nodeName });

  let status = 200;
  if (!healthy) {
    status = 503;
  } else if (compareWithEtherscan && typeof etherscanBlockNumber === 'undefined') {
    status = 206;
  }

  return {
    status,
    response: {
      ...result,
      syncing
    }
  };
};
