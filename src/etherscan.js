const request = require('request-promise-native');

const apiKey = process.env.ETHERSCAN_API_KEY;
const apiUrl = process.env.ETHERSCAN_API_URL || 'https://api.etherscan.io/api';

module.exports = () => {
  const options = {
    uri: apiUrl,
    qs: {
      module: 'proxy',
      action: 'eth_blockNumber',
      apiKey,
    }
  };
  return request.get(options).then(JSON.parse).then(response => parseInt(response.result, 16))
    .catch(() => (undefined)); // ignore connection errors for now
};