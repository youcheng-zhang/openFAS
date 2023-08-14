const _ = require('lodash');
const pino = require('pino')();
const { success, notFound } = require('../../services/response');
const {
	APIError, asyncHandler, ErrorsArray,
} = require('../../services/response');
const { login } = require('../auth/auth.controller');
const Model = require('./user.model');
const isEmail = require('validator/lib/isEmail');
const zxcvbn = require('zxcvbn');

exports.index = ({ querymen: { query, select, cursor } }, res, next) =>
	Model.find(query, select, cursor)
		.then(entities => entities.map(entity => entity.view(true)))
		.then(success(res))
		.catch(next);

exports.show = ({ params }, res, next) =>
	Model.findById(params.id)
		.then(notFound(res))
		.then(entity => (entity ? entity.view() : null))
		.then(success(res))
		.catch(next);

exports.showMe = ({ entity }, res) =>
	res.json(entity.view(true));

exports.create = asyncHandler(async (req, res, next) => {
	// Server side password check
	// zxcvbn is 1mb and may not always load in time on the client
	const { body } = req;
	const errors = new ErrorsArray();
	const zxcvbnResult = zxcvbn(body.password, [body.email, body.name]);
	if (zxcvbnResult.score < 1) errors.add('password.insecure', 'password', 'The password you\'ve chosen is too insecure.');
	if (body.password.length < 8) errors.add('password.tooShort', 'password');
	if (typeof body.email === 'string' && !isEmail(body.email)) errors.add('invalidEmail', 'email', 'The email you\'ve chosen is invalid.');
	if (errors.length > 0) throw new APIError(400, errors);
	await Model.create(body)
		.catch((err) => {
			if (err.name === 'MongoError' && err.code === 11000) {
				errors.add('auth.alreadyExists', 'email');
				throw new APIError(409, errors);
			}
			throw new APIError(500, 'Error creating entity', err);
		})
		.then(user => login({ user }, res));
}, 'Error creating new entity');

exports.update = ({ body, params, entity }, res, next) =>
	Model.findById(params.id === 'me' ? entity.id : params.id)
		.then(notFound(res))
		.then((result) => {
			if (!result) return null;
			const isAdmin = entity.role === 'admin';
			const isSelfUpdate = entity.id === result.id;
			if (!isSelfUpdate && !isAdmin) {
				return next(new APIError(401));
			}
			return result;
		})
		// TODO: Don't shadow vars
		.then(entity => (entity ? _.merge(entity, body).save() : null))
		.then(entity => (entity ? entity.view(true) : null))
		.then(success(res))
		.catch(next);

exports.updatePassword = ({ bodymen: { body }, params, entity }, res, next) =>
	Model.findById(params.id === 'me' ? entity.id : params.id)
		.then(notFound(res))
		.then((result) => {
			if (!result) return null;
			const isSelfUpdate = entity.id === result.id;
			if (!isSelfUpdate) {
				return next(new APIError(
					401, {
						valid: false,
						message: 'Invalid credentials',
					},
					'Attempt was made to change another entity\'s password',
				));
			}
			return result;
		})
		// TODO: Don't shadow vars
		.then(entity => (entity ? entity.set({ password: body.password }).save() : null))
		.then(entity => (entity ? entity.view(true) : null))
		.then(success(res))
		.catch(next);


exports.updatePasswordWithToken = asyncHandler(async ({ body: { email, code, password } }, res, next) => {
	// TODO: set limit for token use to 5
	// TODO: Make errors tool to reduce and reuse this code
	if (typeof email !== 'string' || !email.length) {
		throw new APIError(400, new ErrorsArray('email.required', 'email'));
	}
	if (!isEmail(email)) {
		throw new APIError(400, new ErrorsArray('email.invalid', 'email'));
	}
	if (!code) throw new APIError(400, { path: 'code', humanError: 'No code provided.' });
	const entity = await Model.findOne({ email });
	if (!entity) {
		pino.info('Attempt was made to reset password of non-existent account');
		throw new APIError(400, new ErrorsArray('email.nonExistent', 'email'));
	}
	if (!entity.passwordResetCode) {
		throw new APIError(400, new ErrorsArray('expiredCode', 'code', 'Expired password recovery code'));
	}
	if (entity.passwordResetCode !== code) {
		throw new APIError(400, new ErrorsArray('incorrectCode', 'code', 'Incorrect password recovery code'));
	}
	const errors = new ErrorsArray();
	const zxcvbnResult = zxcvbn(password, [email]);
	if (zxcvbnResult.score < 1) errors.add('password.insecure', 'password', 'The password you\'ve chosen is too insecure.');
	if (password.length < 8) errors.add('password.tooShort', 'password');
	if (errors.length > 0) throw new APIError(400, errors);
	await Model.update({ email }, { $set: { password, passwordResetCode: null } });
	res.status(202).json('success');
});

const addUnsetProps = (object, additionalProps) => {
	Object.keys(additionalProps).forEach((key) => {
		if (!object[key]) object[key] = additionalProps[key];
	});
};

exports.findOrCreateGoogle = async (entityData) => {
	const {
		googleId, email,
	} = entityData;
	// Attempt match via ID first
	const entityById = await Model.findOne({ googleId });
	if (entityById) {
		// TODO: Don't save on every authentication
		addUnsetProps(entityById, entityData);
		const updatedModel = await entityById.save();
		return updatedModel;
	}
	// Attempt match on email
	if (isEmail(email)) {
		const entityByEmail = await Model.findOne({ email });
		if (entityByEmail) {
			addUnsetProps(entityByEmail, entityData);
			const updatedModel = await entityByEmail.save();
			return updatedModel;
		}
	}
	// No ID || Email
	const newModel = await Model.create(entityData);
	return newModel;
};

exports.destroy = ({ params }, res, next) =>
	Model.findById(params.id)
		.then(notFound(res))
		.then(entity => (entity ? entity.remove() : null))
		.then(success(res))
		.catch(next);
