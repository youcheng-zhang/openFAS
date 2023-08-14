const _ = require("lodash");
const { success, notFound } = require("../../services/response");
const Model = require("./ULpatient.model");
const sessionModel = require("../ULsession/ULsession.model");
const teamModel = require("../team/team.model");

/**
 * CUSTOM CONTROLLERS
 */

/**
 * CRUD CONTROLLERS
 */

exports.create = ({ body, user }, res, next) => {
	Model.create({ ...body, users: [user.id] })
		.then(entity => entity.view())
		.then(entity => teamModel.update({ _id: entity.team }, { $push: { ULpatients: entity.id } }))
		.then(
			Model.findOne({ name: body.name, dateOfBirth: body.dateOfBirth, description: body.description, team: body.team })
				.then(entity => { res.status(201).json(entity); })
				.catch(next)
		)
}

exports.index = ({ querymen: { query, select, cursor }, user }, res, next) =>
	Model.find({ ...query, users: user.id }, select, cursor)
		.populate("users", "email name id")
		.then(entity => entity.map(entity => entity.view()))
		.then(success(res))
		.catch(next);

exports.indexteam = ({ params }, res, next) =>
	Model.find({ team: params.teamid })
		.populate("users", "email name id")
		.then(entity => entity.map(entity => entity.view()))
		.then(success(res))
		.catch(next);

exports.show = ({ params }, res, next) =>
	Model.findById(params.id)
		.populate("users", "email name id")
		.then(notFound(res))
		.then(entity => (entity ? entity.view() : null))
		.then(success(res))
		.catch(next);

exports.update = ({ body, params }, res, next) =>
	Model.findById(params.id)
		.then(notFound(res))
		.then(entity => (entity ? _.extend(entity, body).save() : null))
		.then(entity => (entity ? entity.view() : null))
		.then(success(res))
		.catch(next);

// delete ULpatient and all ULsessions related to the patient
exports.destroy = ({ params }, res, next) => {
	sessionModel.deleteMany({ patient: params.id })
		.then(
			Model.findById(params.id)
				.then(entity => entity ? teamModel.update({ _id: entity.team }, { $pull: { patients: entity.id } }) : null)
		)
		.then(
			Model.findById(params.id)
				.then(notFound(res))
				.then(entity => (entity ? entity.remove() : null))
				.then(success(res))
				.catch(next)
		)
}
