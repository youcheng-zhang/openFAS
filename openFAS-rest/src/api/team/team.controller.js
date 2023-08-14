const _ = require("lodash");
const { success, notFound } = require("../../services/response");
const Model = require("./team.model");
const sessionModel = require("../session/session.model");
const ULsessionModel = require("../ULsession/ULsession.model");
const patientModel = require("../patient/patient.model");
const ULpatientModel = require("../ULpatient/ULpatient.model");

/**
 * CUSTOM CONTROLLERS
 */

/**
 * CRUD CONTROLLERS
 */

exports.create = ({ body, user }, res, next) =>
	Model.create({ ...body, users: [user.id] })
		.then(entity => entity.view())
		.then(entity => res.status(201).json(entity))
		.catch(next);

exports.index = ({ querymen: { query, select, cursor }, user }, res, next) =>
	Model.find({ ...query, users: user.id }, select, cursor)
		.populate("ULpatients", "name description")
		.populate("patients", "name description")
		.then(entity => entity.map(entity => entity.view()))
		.then(success(res))
		.catch(next);

exports.indexPatient = ({ params }, res, next) =>
	patientModel.find({ team: params.id })
		.populate("users", "email name id")
		.then(entity => entity.map(entity => entity.view()))
		.then(success(res))
		.catch(next);

exports.indexULPatient = ({ params }, res, next) =>
	ULpatientModel.find({ team: params.id })
		.populate("users", "email name id")
		.then(entity => entity.map(entity => entity.view()))
		.then(success(res))
		.catch(next);

exports.show = ({ params }, res, next) =>
	Model.findById(params.id)
		.populate("ULpatients", "name description conditions")
		.populate("patients", "name description conditions")
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

exports.destroy = ({ params }, res, next) => {
	ULpatientModel.find({ team: params.id })
		.then(entities => entities.map(entity =>
			ULsessionModel.deleteMany({ patient: entity.id })
		)
		)
		.then(
			ULpatientModel.deleteMany({ team: params.id })
		)
		.then(
			patientModel.find({ team: params.id })
				.then(entities => entities.map(entity =>
					sessionModel.deleteMany({ patient: entity.id })
				)
				)
				.then(
					patientModel.deleteMany({ team: params.id })
				)
		)
		.then(
			Model.findById(params.id)
				.then(notFound(res))
				.then(entity => (entity ? entity.remove() : null))
				.then(success(res))
				.catch(next)
		)
}
