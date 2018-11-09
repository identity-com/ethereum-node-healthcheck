const express = require('express');
const cron = require('node-cron');
const healthcheck = require('./src/healthcheck');

const app = express();

app.use(express.json());

// schedule tasks to be run on the server
// we want this to be used as a heartbeat
if (!process.env.HEARTBEAT_DISABLED) {
  // we don't care about the response result as the stats is going to NewRelic
  cron.schedule('* * * * *', () => healthcheck().then(console.log, console.error));
}

app.get('/health/status', async (req, res) => {
  const { status, response } = await healthcheck(req.query.etherscan, req.query.threshold);
  return res.status(status).json(response);
});

const server = app.listen(3001);

module.exports = { app, server };
