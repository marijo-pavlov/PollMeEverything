var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var db = mongoose.createConnection('mongodb://localhost/voting-app');

var PollChoices = new Schema({
		choiceText: {
			type: String,
			required: true
		},
		votes: {
			type: Number,
			required: true,
			default: 0
		}
})

var PollSchema = new Schema({
	question: {
		type: String,
		required: true
	},
	published: {
		type: Date,
		default: Date.now,
		required: true
	},
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	choices: [PollChoices]
});

var Poll = module.exports = mongoose.model('Poll', PollSchema);