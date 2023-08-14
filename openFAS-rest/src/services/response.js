const pino = require('pino')();

/**
 * @param {string} error message
 * @param {status} HTTP status to return
 * @param {status} baseError in the event that we are responding to
 * an error that could be ambiguous, pass the original error too
 */
function APIError(status, message, baseError) {
	Object.defineProperty(this, 'name', {
		enumerable: false,
		writable: true,
		value: 'APIError',
	});
	Object.defineProperty(this, 'message', {
		enumerable: false,
		writable: true,
		value: message,
	});
	Object.defineProperty(this, 'status', {
		enumerable: false,
		writable: true,
		value: status,
	});
	Object.defineProperty(this, 'baseError', {
		enumerable: false,
		writable: true,
		value: baseError,
	});
}
Object.setPrototypeOf(APIError.prototype, Error.prototype);
exports.APIError = APIError;

const errorCodeDictionary = new Map([
	['password.tooShort', 'Password must contain a minimum of 8 characters'],
	['required', 'This field must be set'],
	['auth.alreadyExists', 'A user already exists with this email'],
	['auth.invalidCredentials', 'Invalid credentials.'],
	['email.required', 'An email address must be specified.'],
	['email.invalid', 'A valid email address must be specified.'],
	['email.nonExistent', 'There\'s no account associated with this email.'],
]);

class ErrorsArray extends Array {
	constructor(code, path, customMessage) {
		super();
		if (code) this.add(code, path, customMessage);
	}
	add(code, path = 'meta', customMessage) {
		let message = customMessage;
		if (!customMessage) message = errorCodeDictionary.get(code);
		this.push({
			code,
			path,
			message,
		});
	}
}

exports.ErrorsArray = ErrorsArray;

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
	if (err.name === 'APIError') {
		if (err.hasOwnProperty('baseError')) pino.error(err.baseError);
		if (typeof err.message !== 'undefined') {
			pino.info(err.message);
			return res.status(err.status || 500).json(err.message);
		}
		return res.status(err.status || 500).end();
	}
	// Mongo validation errors
	if (err.name === 'ValidationError') {
		pino.info(err);
		return res.status(err.status || 400).end();
	}
	// Service and programmer errors
	pino.error(err);
	const errors = new ErrorsArray(500, 'meta', 'Server error');
	return res.status(500).json(errors);
}

/**
 * Express middleware wrapper for async functions
 * @param {async function}
 */
exports.asyncHandler = (fn, errMsg = 'Server error') => {
	return (...args) => fn(...args)
		.catch((err) => {
			let newErr;
			if (err.name !== 'APIError') {
				newErr = new APIError(500, errMsg, err);
			} else newErr = err;
			args[2](newErr);
		});
}

exports.success = (res, status) => (entity) => {
	if (entity) return res.status(status || 200).json(entity);
	return res.status(200).end();
};

exports.notFound = () => (entity) => {
	if (entity) return entity;
	throw new APIError(404);
};

exports.authorOrAdmin = (res, user, userField) => (entity) => {
	if (!entity) return null;
	const isAdmin = user.role === 'admin';
	const isAuthor = entity[userField] && entity[userField].equals(user.id);
	if (isAuthor || isAdmin) return entity;
	return res.status(401).end();
};

/**
 * Paginated Response Wrapper
 */
exports.paginateResponse = (cursor, count, items) => {
	const page = (cursor.skip / cursor.limit) + 1;
	const totalPages = Math.ceil(count / cursor.limit);
	return {
		pageInfo: {
			page,
			totalPages
		},
		items
	}
}
