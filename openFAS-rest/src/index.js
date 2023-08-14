const http = require('http');
const config = require('./config');
const mongoose = require('./services/mongoose');
const express = require('./services/express');
const api = require('./api/routes');
const pino = require('pino')();

const app = express(api);
const server = http.createServer(app);

mongoose.connect(config.db.url)
	.then(() => {
		server.listen(config.port, config.ip, () => {
			pino.info(`😎 RESTful API ${config.version} started at http://${config.ip}:${config.port} (${config.env} mode)`);
			if (config.debug) pino.info('CAUTION: RUNNING WITH DEBUG FLAG. API EXPOSED.');
		});
	});

module.exports = app;
