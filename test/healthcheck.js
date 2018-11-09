const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const request = require('request-promise-native');

const web3 = require('../src/web3');
const healthcheck = require('../src/healthcheck');

chai.use(sinonChai);
const { expect } = chai;

const sandbox = sinon.createSandbox();

const currentBlockNumber = 0xfffff;

let etherscanResult;
let stubEth;

describe('Healthcheck status', () => {
  beforeEach('Stub web3', () => {
    stubEth = {
      isSyncing: () => Promise.resolve(false),
      getBlockNumber: () => Promise.resolve(currentBlockNumber),
      net: {
        getPeerCount: () => Promise.resolve(100)
      }
    };
    sandbox.stub(web3, 'eth').value(stubEth);
  });

  beforeEach('Stub request-promise', () => {
    etherscanResult = {};
    sandbox.stub(request, 'get').callsFake(() => Promise.resolve(JSON.stringify(etherscanResult)));
  });

  afterEach('Restore stubs', () => sandbox.restore());

  context('when using etherscan', () => {
    it('should respond with 206 partial content when etherscan returns nothing', async () => {
      etherscanResult = undefined;
      const result = await healthcheck(true);

      expect(result.status).to.equal(206);
    });

    it('should respond with 206 partial content when etherscan returns an error', async () => {
      request.get.restore();
      sandbox.stub(request, 'get').callsFake(() => Promise.reject(new Error()));
      const result = await healthcheck(true);

      expect(result.status).to.equal(206);
    });

    it('should respond with 503 service unavailable when etherscan is ahead of our node', async () => {
      etherscanResult.result = (currentBlockNumber + 20).toString(16);
      const result = await healthcheck(true);

      expect(result.status).to.equal(503);
    });

    it('should respond with 200 success when etherscan is behind us', async () => {
      etherscanResult.result = (currentBlockNumber - 20).toString(16);
      const result = await healthcheck(true);

      expect(result.status).to.equal(200);
    });
  });

  context('when not using etherscan', () => {
    it('should respond with 200 success when the node is not syncing', async () => {
      const result = await healthcheck(false);

      expect(result.status).to.equal(200);
    });

    it('should respond with 503 service unavailable when the node is syncing', async () => {
      stubEth.isSyncing = () =>
        Promise.resolve({
          highestBlock: currentBlockNumber + 20,
          currentBlock: currentBlockNumber
        });

      const result = await healthcheck(false);

      expect(result.status).to.equal(503);
    });
  });
});
