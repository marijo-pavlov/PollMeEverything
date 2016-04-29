import React from 'react';
import ReactDOM from 'react-dom';
import request from 'superagent';
import auth from './auth';
import ReactFauxDOM from 'react-faux-dom';
import Chart from './Chart';

var Poll = React.createClass({
	getInitialState(){
		return {
			data: {
				question: '',
				choices: [],
			},
			success: false,
			voted: this.checkIfVoted(),
			infoMessage: false,
			pollId: this.props.params.pollId,
			loggedIn: auth.getToken()
		}
	},
	checkIfVoted(){
		var pollId = this.props.params.pollId;

		var votingAppArray = JSON.parse(localStorage.getItem('votingAppArray'));

		if(!votingAppArray)
			return false;

		return votingAppArray.indexOf(pollId) !== -1;
	},
	componentDidMount(){
		this.getPollInfo();

		if(this.state.voted){
			this.setState({
				infoMessage: 'You have already voted.'
			});
		}

		// Twitter javascript
		window.twttr = (function(d, s, id) {
		  var js, fjs = d.getElementsByTagName(s)[0],
		    t = window.twttr || {};
		  if (d.getElementById(id)) return t;
		  js = d.createElement(s);
		  js.id = id;
		  js.src = "https://platform.twitter.com/widgets.js";
		  fjs.parentNode.insertBefore(js, fjs);
		 
		  t._e = [];
		  t.ready = function(f) {
		    t._e.push(f);
		  };
		 
		  return t;
		}(document, "script", "twitter-wjs"));
	},
	componentDidUpdate(){
		var twitterShare = {
			twitterUrl: 'https://twitter.com/intent/tweet',
			text: "text=" + encodeURIComponent(this.state.data.question + " | PollMeEverything"),
			url: "url=" + encodeURI(window.location.href)
		};

		document.getElementById('twitterShare').href = twitterShare.twitterUrl + "?" + twitterShare.text + "&" + twitterShare.url;		
	},
	getPollInfo(){
		var self = this;

		request
			.get("/api/polls/" + this.state.pollId)
			.end(function(error, result){
				if(error) throw error;

				self.setState({
					data: result.body.poll
				});
			});
	},
	eachOption(choice, i){
		return 	(
			<option value={choice._id} key={i}>{choice.choiceText}</option>
		);
	},
	addVote(event){
		event.preventDefault();

		var self = this;

		var vote = ReactDOM.findDOMNode(this.refs.vote).value;

		if(vote !== 'message' && this.state.voted){
			return self.setState({
				infoMessage: 'You have already voted. You cannot vote again.',
				success: false
			});
		}

		if(vote !== 'message' && !this.state.voted){
			request
				.post('/api/addvote')
				.send({
					pollId: this.state.pollId,
					choiceId: vote
				})
				.end(function(err, res){
					if(err) throw err;

					if(res.body.success){
						self.setState({
							success: 'Thank you for voting.',
							infoMessage: false,
							voted: true,
							data: res.body.poll
						});

						var votingArray = JSON.parse(localStorage.getItem('votingAppArray'));
						if(!votingArray)
							votingArray = [];

						votingArray.push(self.state.pollId);
						localStorage.setItem('votingAppArray', JSON.stringify(votingArray));
						document.getElementById('voteForm').reset();
					}
				});
		}
	},
	addNewOption(event){
		event.preventDefault();
		var self = this;

		var newOption = ReactDOM.findDOMNode(self.refs.newoption).value;

		if(newOption){
			request
				.post('/api/addoption')
				.send({
					token: self.state.loggedIn,
					newOption: newOption,
					pollId: self.state.pollId
				})
				.end(function(err, result){
					if(err) throw err;

					if(result.status == 200){
						self.setState({
							success: 'You have successfully added new option!'
						});
						self.getPollInfo();
						document.getElementById('newOptionForm').reset();
					}
				});
		}
	},
	showChart(){
		var data = this.state.data;
		
		var sum = 0;
		data.choices.forEach(function(e){
			sum += e.votes;
		});

		if(sum > 0){
			return (
				<Chart data={data} />
			);
		}else{
			return (<div className="alert alert-info" role="alert">
		   		<span>Nobody voted so there are no results to show.</span>
			</div>);
		}

	},
	removeSuccess(){
		this.setState({
			success: false
		});
	},
	removeInfoMessage(){
		this.setState({
			infoMessage: false
		});
	},
	render(){
		return (
			<div className="container">
				{this.state.success && (
					<div className="alert alert-success" role="alert">
				   		<span>{this.state.success}</span>
				   		<button type="button" className="close" aria-label="Close" onClick={this.removeSuccess}><span aria-hidden="true">&times;</span></button>
					</div>
				)}
				{this.state.voted && this.state.infoMessage && (
					<div className="alert alert-info" role="alert">
				   		<span>{this.state.infoMessage}</span>
				   		<button type="button" className="close" aria-label="Close" onClick={this.removeInfoMessage}><span aria-hidden="true">&times;</span></button>
					</div>
				)}

				<div className="row">
					<div className="col-sm-12">
						<h2>{this.state.data.question}</h2>
					</div>
				</div>

				<div className="row">
					<div className="col-sm-5">
						<form onSubmit={this.addVote} id="voteForm">
							<div className="form-group">
								<label>Select your option</label>
								<select className="form-control" ref="vote">
									<option value="message">Choose an option</option>
									{this.state.data.choices.map(this.eachOption)}
								</select>
							</div>
							<input className="btn btn-primary form-control" type="submit" value="Vote" />
						</form>
						<br/>
						{this.state.loggedIn &&
							(<form onSubmit={this.addNewOption} id="newOptionForm">
							    <div className="form-group">
							      <label>You do not like what you see? Add new option.</label>
							      <input ref="newoption" type="text" placeholder="What is it going to be?" className="form-control"/>
							    </div>
								<input className="btn btn-primary form-control" type="submit" value="Add new option" />
							</form>)
						}
						<a className="btn btn-block twitterButton" href="#" id="twitterShare">
						<i className="fa fa-twitter" aria-hidden="true">Share on Twitter</i></a>
					</div>
					<div className="col-sm-6 col-sm-offset-1" id="chartContainer">
						{this.showChart()}
					</div>
				</div>
			</div>
			);
	}
});

module.exports = Poll;