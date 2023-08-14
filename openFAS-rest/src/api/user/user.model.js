const crypto = require('crypto');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const mongooseKeywords = require('mongoose-keywords');
const { env } = require('../../config');
const { Schema } = mongoose;

const roles = ['user', 'admin'];

const modelSchema = new Schema({
	name: {
		type: String,
		default: 'Authorised Clinician'
	},
	email: {
		type: String,
		match: /^\S+@\S+\.\S+$/,
		unique: true,
		trim: true,
		lowercase: true,
	},
	passwordResetCode: {
		type: String,
		required: false,
		expires: 900,
	},
	password: {
		type: String,
	},
	role: {
		type: String,
		enum: roles,
		default: 'user',
	},
}, {
	timestamps: true,
});

modelSchema.path('email').set(function setDefaults(email) {
	if (!this.picture || this.picture.indexOf('https://gravatar.com') === 0) {
		const hash = crypto.createHash('md5').update(email).digest('hex');
		this.picture = `https://gravatar.com/avatar/${hash}?d=identicon`;
	}

	if (!this.name) this.name = email.replace(/^(.+)@.+$/, '$1');

	return email;
});

// Hash password on save
modelSchema.pre('save', function password(next) {
	if (!this.isModified('password')) return next();
	/* istanbul ignore next */
	const rounds = env === 'test' ? 1 : 9;
	bcrypt.hash(this.password, rounds)
		.then((hash) => {
			this.password = hash;
			next();
		})
		.catch(next);
});

// Hash password on update
modelSchema.pre('update', function password(next) {
	if (!this._update.$set || !this._update.$set.password) return next();
	/* istanbul ignore next */
	const rounds = env === 'test' ? 1 : 9;
	bcrypt.hash(this._update.$set.password, rounds)
		.then((hash) => {
			this._update.$set.password = hash;
			next();
		})
		.catch(next);
});

modelSchema.methods = {
	view() {
		return {
			email: this.email,
			role: this.role
		};
	},

	authenticate(password) {
		return bcrypt.compare(password, this.password).then(valid => (valid ? this : false));
	},
};

modelSchema.plugin(mongooseKeywords, { paths: ['email'] });
modelSchema.statics = { roles };

module.exports = mongoose.model('User', modelSchema);;
