/* eslint-disable no-unused-vars */
const path = require("path");
const _ = require("lodash");
const dotenv = require("dotenv-safe");
const pino = require("pino")();

/* istanbul ignore next */
const requireProcessEnv = name => {
	if (!process.env[name]) {
		pino.error(`${name} environment variable unset!`);
	}
	return process.env[name] || undefined;
};

/* istanbul ignore next */
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
	dotenv.load({
		path: path.join(__dirname, "../.env"),
		sample: path.join(__dirname, "../.env.example")
	});
}

const baseConfig = {
	appUrl: process.env.APP_URL,
	version: "1.2.0",
	debug: !!Number(process.env.DEBUG),
	env: process.env.NODE_ENV,
	root: path.join(__dirname, ".."),
	port: process.env.PORT || 3000,
	ip: process.env.IP || "0.0.0.0",
	jwtSecret: requireProcessEnv("JWT_SECRET"),
	db: {
		url: process.env.MONGO_URL,
		options: {
			db: {
				safe: true
			}
		}
	}
};

const developmentConfig = {
	port: process.env.PORT || 3000,
	db: {
		url: process.env.MONGO_URL,
		options: {
			debug: true,
			ssl: true,
			sslValidate: true,
			poolSize: 1,
			reconnectTries: 1,
			useNewUrlParser: true,
			dbName: "openfas"
		}
	}
};

const productionConfig = {
	ip: process.env.IP || "0.0.0.0",
	port: process.env.PORT || 8080,
	db: {
		url: process.env.MONGO_URL,
		options: {
			debug: false,
			ssl: true,
			sslValidate: true,
			poolSize: 1,
			reconnectTries: 1,
			useNewUrlParser: true,
			dbName: "openfas"
		}
	}
};

let config;
switch (process.env.NODE_ENV) {
	case "development":
		config = Object.assign({}, baseConfig, developmentConfig);
		break;
	default:
		config = Object.assign({}, baseConfig, productionConfig);
		break;
}

module.exports = config;
