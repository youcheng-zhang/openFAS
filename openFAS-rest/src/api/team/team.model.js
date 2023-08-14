const mongoose = require("mongoose");
const mongooseKeywords = require("mongoose-keywords");

const modelSchema = new mongoose.Schema(
	{
		name: String,
		description: String,
		users: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "user"
			}
		],
		patients: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Patient"
			}
		],
		ULpatients: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "ULpatient"
			}
		]
	},
	{ timestamps: true }
);

modelSchema.methods = {
	view() {
		return {
			id: this.id,
			name: this.name,
			description: this.description,
			patients: this.patients,
			ULpatients: this.ULpatients
		};
	}
};

modelSchema.plugin(mongooseKeywords, { paths: ["name", "description"] });

module.exports = mongoose.model("Team", modelSchema);
