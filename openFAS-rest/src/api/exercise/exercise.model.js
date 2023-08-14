const mongoose = require("mongoose");
const mongooseKeywords = require("mongoose-keywords");

const modelSchema = new mongoose.Schema(
	{
		name: String,
		description: String,
		movements: [{
				order: Number,
				name: String,
				imageUrl: String,
				duration: Number,
				maximalDuration: {
					type: Number,
					default: null,
				}
		}],
		keywords: {
			type: [String],
			text: true
		}
	},
	{ timestamps: true }
);

modelSchema.methods = {
	view() {
		return {
			id: this.id,
			name: this.name,
			description: this.description,
			movements: this.movements,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
};

modelSchema.plugin(mongooseKeywords, { paths: ["name", "description"] });

module.exports = mongoose.model("Exercise", modelSchema);
