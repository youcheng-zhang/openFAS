const controller = require('./ULsession.controller');
const { Router } = require('express');
const { middleware: query } = require('querymen');
const { token } = require('../../services/passport');

const router = new Router();

/**
 * CUSTOM ROUTES
 */

router.get(
	'/ULpatient/:id',
	token({ required: false }),
	controller.indexPatientSessions,
);


/**
 * GENERIC ROUTES (do not modify these)
 */

router.post(
	'/',
	token({ required: true }),
	controller.create,
);

router.get(
	'/',
	token({ required: true }),
	query(),
	controller.index,
);


router.get(
	'/:id',
	token({ required: true }),
	controller.show,
);

router.put(
	'/:id',
	token({ required: true }),
	controller.update,
);

router.delete(
	'/:id',
	token({ required: true }),
	controller.destroy,
);

module.exports = router;
