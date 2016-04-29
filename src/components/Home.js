import React from 'react';
import {Link} from 'react-router';
import request from 'superagent';


var Home = React.createClass({
	getInitialState(){
		return {
			polls: []
		}
	},
	componentDidMount(){
		var self = this;

		request
			.get('/api/polls')
			.end(function(err, res){
				if(err) throw err;

				self.setState({
					polls: res.body.polls
				})
			});
	},
	eachPoll(poll, i){
		var monthNames = ["January", "February", "March", "April", "May", "June",
  			"July", "August", "September", "October", "November", "December"
		];
		var added = new Date(poll.published);
		var votes = poll.choices.map(function(a){
			return a.votes;
		}).reduce(function(prev, next){
			return prev + next;
		});
		return (	
			<div className="col-xs-12 poll" key={i}>	
				<div className="row">		
					<div className="col-xs-2">
						<div className="date">
							<div className="text-center">{added.getDate()}</div>
							<div className="text-center">{monthNames[added.getMonth()]}</div>
						</div>
					</div>
					<div className="col-xs-10 pollTitle">
						<h3><Link to={"polls/" + poll._id}>{poll.question}</Link></h3>
					</div>
				</div>
			</div>
			);
	},
	render(){
		return(
			<div className="container">
				<div className="row">
					<div className="col-xs-12">
						<h1>Polls</h1>
					</div>
				</div>

				{(this.state.polls.length === 0 ?
					<p className="alert alert-info">Currently there are no polls.</p> : null
				)}
				
				<div className="row">
					{this.state.polls.map(this.eachPoll)}
				</div>
			</div>
		);
	}
})

module.exports = Home;