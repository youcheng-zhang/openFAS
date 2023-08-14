const controller = require('./auth.controller');
const { Router } = require('express');
const {
	json, basic, google,
} = require('../../services/passport');

const router = new Router();

router.post(
	'/',
	json(),
	controller.login,
);

router.post(
	'/basic',
	basic(),
	controller.login,
);

router.post(
	'/google',
	google,
	controller.login,
);

module.exports = router;
