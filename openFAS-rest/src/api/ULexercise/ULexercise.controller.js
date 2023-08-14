const _ = require("lodash");
const { success, notFound } = require("../../services/response");
const Model = require("./ULexercise.model");

/**
 * CUSTOM CONTROLLERS
 */

/**
 * CRUD CONTROLLERS
 */

exports.create = ({ body }, res, next) =>
	Model.create(body)
		.then(entity => entity.view())
		.then(entity => res.status(201).json(entity))
		.catch(next);

exports.index = ({ querymen: { query, select, cursor }}, res, next) =>
	Model.find(query, select, cursor)
		.then(entity => entity.map(entity => entity.view()))
		.then(success(res))
		.catch(next);

exports.show = ({ params }, res, next) =>
	Model.findById(params.id)
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

exports.destroy = ({ params }, res, next) =>
	Model.findById(params.id)
		.then(notFound(res))
		.then(entity => (entity ? entity.remove() : null))
		.then(success(res))
		.catch(next);
