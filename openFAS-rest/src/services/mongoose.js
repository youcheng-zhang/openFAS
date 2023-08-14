const mongoose = require('mongoose');
const config = require('../config');
const pino = require('pino')();

Object.keys(config.db.options).forEach((key) => {
	mongoose.set(key, config.db.options[key]);
});

mongoose.Promise = global.Promise;
/* istanbul ignore next */
mongoose.Types.ObjectId.prototype.view = function view() {
	return { id: this.toString() };
};

/* istanbul ignore next */
mongoose.connection.on('error', (err) => {
	pino.error(`MongoDB connection error: ${err}`);
	process.exit(-1);
});

mongoose.set('useCreateIndex', true);

module.exports = mongoose;
