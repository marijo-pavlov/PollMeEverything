var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var jwt = require('jwt-simple');

var User = require('../models/user');
var Poll = require('../models/poll');

const jwtSecretToken = 'n3tnr3it4t54mgrg';

router.post('/register', function(req, res, next){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password;

	req.checkBody('name', 'Name field is required.').notEmpty();
	req.checkBody('email', 'Email field is required.').notEmpty();
	req.checkBody('email', 'Email not valid.').isEmail();
	req.checkBody('username', 'Username field is required.').notEmpty();
	req.checkBody('password', 'Password field is required.').notEmpty();
	req.checkBody('password2', 'Passwords do not match.').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		return res.json({
				success: false,
				errors: errors
				});
	}else{
		var newUser = new User({
			name: name,
			email: email,
			username: username,
			password: password
		});

		User.createUser(newUser, function(err, user){
			return res.json({
					success: true
					});
		});
	}


});

passport.use(new LocalStrategy(
	function(username, password, done){
		User.getUserByUsername(username, function(err, user){
			if(err) throw err;
			if(!user){
				console.log("User not found!");
				return done(null, false);
			}

			User.comparePassword(password, user.password, function(err, isMatch){
				if(err) throw err;
				if(isMatch){
					console.log("User found and same password");
					return done(null, user);
				}
				else {
					console.log("User found but not same password");
					return done(null, false);
				}
			});
		});
	}
));

router.post('/login', function(req, res, next){
	passport.authenticate('local', function(error, user, info){
		if(error) 
			throw error;
		if(user){
			var payload = {
				iss: user._id
			};
			var token = jwt.encode(payload, jwtSecretToken);
			return res.json({token: token, username: user.username});
		}
		else 
			return res.status(401).end();
	})(req, res, next);
});

router.post('/changepassword', function(req, res, next){
	var token = req.body.token;
	var oldpassword = req.body.oldpassword;
	var newpassword = req.body.newpassword;
	var newpassword2 = req.body.newpassword2;

	req.checkBody('newpassword', 'New Passwords do not match.').equals(req.body.newpassword2);

	var errors = req.validationErrors();

	if(errors){
		return res.json({
				success: false,
				errors: errors
				});
	}else{
		var userId = jwt.decode(token, jwtSecretToken).iss;

		User.checkPassword(userId, oldpassword, function(err, isMatch){
			if(err) throw err;
			if(!isMatch){
				errors = [];
				errors.push({msg: 'It seems that you typed in wrong old password. Please try again.'});
				return res.json({
						success: false,
						errors: errors
						});
			}

			User.changePassword(userId, newpassword, function(err, user){
				if(err) throw err;
				return res.json({
						success: true
						});
			});

		});
	}
});

router.post('/getinfo', function(req, res, next){
		var userId = jwt.decode(req.body.token, jwtSecretToken).iss;

		User.findById(userId, function(err, user){
			if(err) throw err;

			return res.json({
				user:{
					name: user.name,
					email: user.email,
					username: user.username
				}
			});
		});
});

router.post('/changeinfo', function(req, res, next){
		var userId = jwt.decode(req.body.token, jwtSecretToken).iss;

		var keys = Object.keys(req.body);
		var changeInfo = {};
		keys.forEach(function(element){
			if(req.body[element])
				changeInfo[element] = req.body[element];
		});

		delete changeInfo.token;

		if(changeInfo.email){
			req.checkBody('email', 'Email not valid.').isEmail();

			var errors = req.validationErrors();

			if(errors){
				return res.json({
						success: false,
						errors: errors
						});
			}		
		}

		User.changeInfo(userId, changeInfo, function(err, user){
			if(err) throw err;

			return res.json({
				user: user,
				success: true
			})
		});
});

router.post('/newpoll', function(req, res, next){
	var userId = jwt.decode(req.body.token, jwtSecretToken).iss;

	if(!userId)
		res.status(401).end();

	User.findById(userId, function(err, user){
		if(err) throw err;

		var newPoll = new Poll({
			question: req.body.poll.question,
			choices: req.body.poll.choices,
			createdBy: userId
		})

		newPoll.save(newPoll, function(err){
			if(err) throw err;

			return res.json({
				success: true
			});
		})
	});

});

router.post('/addoption', function(req, res, next){
		var userId = jwt.decode(req.body.token, jwtSecretToken).iss;
		var pollId = req.body.pollId;
		var newOption = req.body.newOption;

		if(!userId)
			return res.status(401).end();

		User.findById(userId, function(err, user){
			if(err) throw err;

			Poll.findById(pollId, function(error, poll){
				if(error) throw error;

				poll.choices.push({
					choiceText: newOption
				});

				poll.save(function(err){
					if(err) throw err;

					return res.status(200).end();
				});
			});
		});


});

router.get('/polls', function(req, res, next){
	Poll.find({}, {_id:1, question: 1, published: 1, choices: 1}, function(error, result){
		if(error) throw error;

		return res.json({
			polls: result
		});
	});
});

router.post('/mypolls', function(req, res, next){
	var userId = jwt.decode(req.body.token, jwtSecretToken).iss;

	User.findById(userId, function(err, user){
		if(err) throw err;

		Poll.find({createdBy: userId}, {_id:1, question: 1, published: 1}, function(error, result){
			if(error) throw error;

			return res.json({
				polls: result
			});
		});
	});
});

router.get('/polls/:id', function(req, res, next){
	var pollId = req.params.id;

	Poll.findById(pollId, function(err, poll){
		if(err) throw err;

		if(!poll)
			return res.status(400).end();

		return res.json({
			poll: poll
		});
	});
});

router.post('/addvote', function(req, res, next){
	Poll.findOne({_id:req.body.pollId, choices: { $elemMatch: {_id: req.body.choiceId} } }, function(err, poll){
		if(err) throw err;

		poll.choices = poll.choices.map(function(choice){
			if(choice._id == req.body.choiceId)
				choice.votes++;

			return choice;
		});

		poll.save(function(err){
			if(err) throw err;

			Poll.findById(poll._id, function(err, poll){
				if(err) throw err;

				return res.json({
					poll: poll,
					success: true
				});
			});
		});

	})
});

router.post('/polls/delete/:id', function(req, res, next){
	var userId = jwt.decode(req.body.token, jwtSecretToken).iss;
	
	var pollId = req.params.id;

	User.findById(userId, function(err, user){
		if(err) throw err;

		if(!user)
			return res.status(400).end();

		Poll.remove({_id: pollId}, function(err){
			if(err) throw err;

			res.status(200).end();
		})
	});
});

module.exports = router;
