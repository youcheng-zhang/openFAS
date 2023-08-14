const _ = require("lodash");
const { success, notFound } = require("../../services/response");
const Model = require("./session.model");

/**
 * CUSTOM CONTROLLERS
 */

exports.indexPatientSessions = ({ params }, res, next) =>
	Model.find({ patient: params.id })
		.populate("notes.user", "name email _id")
		.populate("user", "name email _id")
		.then(notFound(res))
		.then(entity => entity.map(entity => entity.view()))
		.then(success(res))
		.catch(next);

/**
 * CRUD CONTROLLERS
 */

exports.create = ({ body, user }, res, next) =>
	Model.create({ ...body, user: user.id })
		.then(entity => entity.view())
		.then(entity => res.status(201).json(entity))
		.catch(next);

exports.index = ({ querymen: { query, select, cursor }, user }, res, next) =>
	Model.find({ ...query, user: user.id }, select, cursor)
		.populate("notes.user", "name email _id")
		.populate("user", "name email _id")
		.populate("exercise", "name description exercises _id")
		.then(notFound(res))
		.then(entity => entity.map(entity => entity.view()))
		.then(success(res))
		.catch(next);

exports.show = ({ params }, res, next) =>
	Model.findById(params.id)
		.populate("notes.user", "name email _id")
		.populate("user", "name email _id")
		.populate("exercise", "name description exercises _id")
		.then(notFound(res))
		.then(entity => (entity ? entity.view("full") : null))
		.then(success(res))
		.catch(next);

exports.update = ({ body, params }, res, next) =>
	Model.findById(params.id)
		.then(notFound(res))
		.then(entity => (entity ? _.extend(entity, body).save() : null))
		.then(entity => (entity ? entity.view("full") : null))
		.then(success(res))
		.catch(next);

exports.destroy = ({ params }, res, next) =>
	Model.findById(params.id)
		.then(notFound(res))
		.then(entity => (entity ? entity.remove() : null))
		.then(success(res))
		.catch(next);
