const { sign } = require('../../services/jwt');
const { success } = require('../../services/response');

exports.login = (req, res) => {
	const { user } = req;
	const token = sign(user.id);
	success(res, 200)({ token, user: user.view() });
};
