const mongoose = require("mongoose");
const mongooseKeywords = require("mongoose-keywords");

const modelSchema = new mongoose.Schema(
	{
		name: String,
		description: String,
		dateOfBirth: Date,
		conditions: [String],
		users: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User"
			}
		],
		team:
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Team"
		},
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
			dateOfBirth: this.dateOfBirth,
			conditions: this.conditions,
			users: this.users,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
			team:this.team
		};
	}
};

modelSchema.plugin(mongooseKeywords, {
	paths: ["name", "conditions", "description"]
});

module.exports = mongoose.model("ULpatient", modelSchema);
