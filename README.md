# Healtchek and heartbeat for your ethereum node
This service connects to your ethereum node and periodically checks its state. 
Node's blockNumber is compared to etherscan.io every minute. 
Tested on geth, but should also work with parity as web3 1.0 is used. 

## Installation 
Run `npm install` to instal dependencies and `npm start` to start the service.

## Configuration

Available configuration options via environment variables:
* ETHERSCAN_API_URL (https://api.etherscan.io/api by default). Could be also configured against testnet (kovan, rinkeby, ropsten).
* ETHERSCAN_API_KEY String to use as Etherscan.io API key. More info at [etherscan.io](https://etherscan.io/apis)
* HEARTBEAT_DISABLED Flag to enable or disable every-minute heartbeat cron. HTTP requests are still supported at `/health/status` even when cronjob is disabled.
* STALE_BLOCK_THRESHOLD Maximum number of blocks to differ from etherscan.io. Delta more than this threshold will be considered as unhealthy. Could be also set with `?threshold=XXX` query param.
* BLOCKCHAIN_NODE_URL Url to be passed to web3 to connect to your ethereum node.

## Contributions

Pull requests and submitted issues are welcome!