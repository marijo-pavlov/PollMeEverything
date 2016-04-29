import React from 'react';
import {render} from 'react-dom';
import {Router, Route, Link, browserHistory} from 'react-router';
import MainLayout from './components/MainLayout';
import Home from './components/Home';
import MyPolls from './components/MyPolls';
import Register from './components/Register';
import Login from './components/Login';
import Logout from './components/Logout';
import Account from './components/Account';
import Poll from './components/Poll';
import auth from './components/auth';

function requireAuth(nextState, replace){
	if(!auth.loggedIn()){
		replace({
			pathname: '/login',
			state: {
				nextPathName: nextState.location.pathname
			}
		})
	}
}

render(
	<Router history={browserHistory}>
		<Route component={MainLayout}>
			<Route path="/" component={Home} />
			<Route path="/mypolls" component={MyPolls} onEnter={requireAuth}/>
			<Route path="/polls/:pollId" component={Poll} />
			<Route path="/register" component={Register} />
			<Route path="/login" component={Login} />
			<Route path="/logout" component={Logout} />
			<Route path="/account" component={Account} onEnter={requireAuth}/>
		</Route>
	</Router>, 
	document.getElementById('react-container')
);