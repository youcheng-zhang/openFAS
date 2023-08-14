const mongoose = require("mongoose");
const mongooseKeywords = require("mongoose-keywords");
const { Status } = require("../../constants/session");

const modelSchema = new mongoose.Schema(
	{
		status: {
			type: String,
			default: Status.INITIALISED,
			enum: Object.values(Status)
		},
		beginTime: Date,
		endTime: Date,
		notes: [
			{
				user: {
					type: mongoose.Types.ObjectId,
					ref: "User"
				},
				note: String,
				updatedAt: {
					type: Date,
					default: new Date()
				}
			}
		],
		patientRating: Number,
		movementTimings: Object,
		dynamicResults: Object,
		staticResults: Object,
		patient: {
			type: mongoose.Types.ObjectId,
			ref: "Patient"
		},
		user: {
			type: mongoose.Types.ObjectId,
			ref: "User"
		},
		exercise: {
			type: mongoose.Types.ObjectId,
			ref: "Exercise"
		},
		keywords: {
			type: [String],
			text: true
		}
	},
	{ timestamps: true }
);

modelSchema.methods = {
	view(type = "partial") {
		const views = {
			partial: [
				"id",
				"status",
				"beginTime",
				"endTime",
				"patient",
				"exercise",
				"user"
			],
			full: [
				"id",
				"status",
				"beginTime",
				"endTime",
				"notes",
				"survey",
				"dynamicResults",
				"staticResults",
				"movementTimings",
				"exercise",
				"patient",
				"user"
			]
		};

		return views[type].reduce(
			(acc, item) => ({
				[item]: this[item],
				...acc
			}),
			{}
		);
	}
};

modelSchema.plugin(mongooseKeywords, { paths: ["notes"] });

module.exports = mongoose.model("Session", modelSchema);
