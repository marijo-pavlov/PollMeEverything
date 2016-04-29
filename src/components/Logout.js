import React from 'react';
import auth from './auth';

var Members = React.createClass({
	componentDidMount(){
		auth.logout();
	},
	render(){
		return(
			<div className="container">
				<div className="row">
					<div className="col-xs-12">
						<h2>You are now logged out. Thank you for using PollMeEverything.</h2>
					</div>
				</div>
			</div>
		);
	}
})

module.exports = Members;