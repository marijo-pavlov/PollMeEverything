import React from 'react';
import ReactDOM from 'react-dom';
import {Link} from 'react-router';
import request from 'superagent';
import auth from './auth';
import {Modal, Button} from 'react-bootstrap';

var MyPolls = React.createClass({
	getInitialState(){
		return {
			newPoll : {
				question: '',
				choices: [
					{choiceText: ''}, 
					{choiceText: ''}
				]
			},
			success: false,
			myPolls: [],
			showDeleteModal: false,
			currentDeletePoll: -1
		}
	},
	componentDidMount(){
		this.getMyPolls();
	},
	getMyPolls(){
		var self = this;

		request
			.post("/api/mypolls")
			.send({
				token: auth.getToken()
			})
			.end(function(error, result){
				if(error) throw error;

				self.setState({
					myPolls: result.body.polls
				});
			});	
	},
	createNewPoll(event){
		event.preventDefault();
		var self = this;

		request	
			.post('/api/newpoll')
			.send({
				poll: this.state.newPoll,
				token: auth.getToken()
			})
			.end(function(err, res){
				if(res.body.success)
					self.setState({
						success: 'You have just created new poll.',
						newPoll : {
							question: '',
							choices: [
								{choiceText: ''}, 
								{choiceText: ''}
							]
						}
					});
				self.getMyPolls();
				document.getElementById('newPollForm').reset();
			});
	},
	newChoice(){
		var choices = this.state.newPoll.choices;
		choices.push({choiceText: ''});
		var poll = this.state.newPoll;
		poll.choices = choices;

		this.setState({
			newPoll: poll
		});
	},
	eachChoice(choice, i){
		if(this.state.newPoll.choices.length > 2){
			return (
				<div className="form-group has-feedback enable-pointer" key={i}>
					<input type="text" placeholder="Enter Choice" className="form-control" key={i} value={choice.choiceText} onChange={this.updateChoice.bind(null, i)} required/>
					<span className="glyphicon glyphicon-remove form-control-feedback removeChoiceIcon" aria-hidden="true" onClick={this.removeChoice.bind(null, i)}></span>
				</div>
			);
		}else{
			return (
				<div className="form-group" key={i}>
					<input type="text" placeholder="Enter Choice" className="form-control" key={i} value={choice.choiceText} onChange={this.updateChoice.bind(null, i)} required/>
				</div>
			);
		}
	},
	removeChoice(i){
		var choices = this.state.newPoll.choices;
		choices.splice(i, 1);
		var poll = this.state.newPoll;
		poll.choices = choices;

		this.setState({
			newPoll: poll
		});
	},
	updateChoice(i, event){
		var poll = this.state.newPoll;
		poll.choices[i].choiceText = event.target.value;
		this.setState({
			newPoll: poll
		});
	},
	updateQuestion(){
		var poll = this.state.newPoll;
		poll.question = ReactDOM.findDOMNode(this.refs.question).value;
		this.setState({
			newPoll: poll
		});
	},
	showDeleteModal(i){
		this.setState({
			showDeleteModal: true,
			currentDeletePoll: i
		});
	},
	hideDeleteModal(){
		this.setState({
			showDeleteModal: false,
			currentDeletePoll: -1
		});
	},
	deletePoll(){
		var self = this;

		request
			.post('/api/polls/delete/' + self.state.myPolls[self.state.currentDeletePoll]._id)
			.send({
				token: auth.getToken()
			})
			.end(function(err, result){
				if(err) throw err

				if(result.status == 200){
					self.getMyPolls();
				}
			});

		this.hideDeleteModal();
	},
	everyPoll(poll, i){
		var monthNames = ["January", "February", "March", "April", "May", "June",
  			"July", "August", "September", "October", "November", "December"
		];
		var added = new Date(poll.published);
		return (	
			<div className="col-xs-12 poll" key={i}>	
				<div className="row">		
					<div className="col-xs-2">
						<div className="date">
							<div className="text-center">{added.getDate()}</div>
							<div className="text-center">{monthNames[added.getMonth()]}</div>
						</div>
					</div>
					<div className="col-xs-9 pollTitle">
						<h3><Link to={"polls/" + poll._id}>{poll.question}</Link></h3>
					</div>
					<div className="col-xs-1">
						<button type="button" className="btn btn-default deleteButton" onClick={this.showDeleteModal.bind(null, i)}>
							<i className="glyphicon glyphicon-trash alert alert-danger"></i>
						</button>
					</div>
				</div>
			</div>
			);
	},
	removeSuccess(){
		this.setState({
			success: false
		});
	},
	render(){
		return(
			<div className="container">
			<Modal show={this.state.showDeleteModal} onHide={this.hideDeleteModal}>
	          <Modal.Header closeButton>
	            <Modal.Title>Are you sure you want to delete that poll?</Modal.Title>
	          </Modal.Header>
	          <Modal.Body>
	            <Button className="alert alert-danger" onClick={this.deletePoll}>Yes</Button>
	            <Button className="alert alert-success" onClick={this.hideDeleteModal}>No</Button>
	          </Modal.Body>
	        </Modal>

			{this.state.success && (
				<div className="alert alert-success" role="alert">
			   		<span>{this.state.success}</span>
			   		<button type="button" className="close" aria-label="Close" onClick={this.removeSuccess}><span aria-hidden="true">&times;</span></button>
				</div>
			)}

				<div className="row">
						<div className="col-xs-12">
							<h2>Create new Poll</h2>
						</div>

					<div className="col-xs-12">
						<form onSubmit={this.createNewPoll} id="newPollForm">
						    <div className="form-group">
						      <label>Question</label>
						      <input ref="question" type="text" placeholder="Type in your question." className="form-control" onChange={this.updateQuestion} required/>
						    </div>
						    <div className="form-group">
						      <label>Choices</label>
						      	{this.state.newPoll.choices.map(this.eachChoice)}
						    </div>
						    <div className="form-group">
						    	<input type="button" className="btn btn-info form-control" value="Add new choice" onClick={this.newChoice} />
						    </div>

						    <div className="form-group">
						    	<input name="submit" type="submit" value="Create new poll" className="btn btn-primary form-control"/>
						    </div>
					  </form>
				  </div>

					<div className="col-xs-12">
					  <h2>Existing Polls</h2>
				  	</div>

					{(this.state.myPolls.length === 0 ?
						<div className="col-xs-12">
							<div className="alert alert-info" role="alert">
						   		<span>You do not have any poll. Go create one.</span>
							</div>
						</div>
					 : null)}

				  {this.state.myPolls.map(this.everyPoll)}
				</div>
			</div>
		);
	}
})

module.exports = MyPolls;