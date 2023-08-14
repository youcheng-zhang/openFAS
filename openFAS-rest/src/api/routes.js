const { Router } = require('express');
const user = require('./user/user.router');
const auth = require('./auth/auth.router');
const config = require('../config');
const session = require('./session/session.router');
const ULsession = require('./ULsession/ULsession.router');
const patient = require('./patient/patient.router');
const ULpatient = require('./ULpatient/ULpatient.router');
const team = require('./team/team.router');
const exercise = require('./exercise/exercise.router');
const ULexercise = require('./ULexercise/ULexercise.router');
const { errorHandler } = require('../services/response');

const router = new Router();
router.use('/users', user);
router.use('/auth', auth);
router.use('/sessions', session);
router.use('/patients', patient);
router.use('/ULpatients', ULpatient);
router.use('/teams', team);
router.use('/exercises', exercise);
router.use('/ULexercises', ULexercise);
router.use('/ULsessions', ULsession);
router.get('/', (req, res) =>
	res.status(200).json({
		env: config.env,
		version: config.version,
	}));
// 404 handler
router.all('*', (req, res) => res.status(404).end());
// Error handler
router.use(errorHandler);

module.exports = router;
