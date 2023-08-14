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
		ULResults: {
			type: Object,
			default: {}
		},
		score: {
			type: Number,
			default: 0
		},
		maximunScore: {
			type: Number,
			default: 0
		},
		staticScore: {
			type: Number,
			default: 0
		},
		maximunStaticScore: {
			type: Number,
			default: 0
		},
		dynamicScore: {
			type: Number,
			default: 0
		},
		maximunDynamicScore: {
			type: Number,
			default: 0
		},
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
			ref: "ULExercise"
		},
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
				"exercise",
				"patient",
				"user",
				"score",
				"maximunScore",
				"staticScore",
				"maximunStaticScore",
				"dynamicScore",
				"maximunDynamicScore",
				"notes"
			],
			full: [
				"id",
				"status",
				"beginTime",
				"endTime",
				"ULResults",
				"patient",
				"user",
				"score",
				"maximunScore",
				"staticScore",
				"maximunStaticScore",
				"dynamicScore",
				"maximunDynamicScore",
				"notes"
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


module.exports = mongoose.model("ULsession", modelSchema);
