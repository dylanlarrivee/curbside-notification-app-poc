import React, { useReducer} from 'react';
import axios from "axios";
import { createBrowserHistory } from "history";
import shawScottLogo from '../img/ShawScott_Logo_Gradient.png';

const appHistory = createBrowserHistory();


const SignInPage = (props) => {

	const [userLoginData, setUserLoginData] = useReducer(
		(state, newState) => ({...state, ...newState}),
		{
		loginUserName: '',
		loginUserPassword: '',
		loginErrorMessage: ''
		}
	  );

	const handleChange = evt => {
	const name = evt.target.name;
	const newValue = evt.target.value;
	setUserLoginData({[name]: newValue});
	}  

	const handleLogin = (event) => {
		event.preventDefault()
		// Slight delay to prevent brute force attacks
		setTimeout(function(){ 
			const payload = {
				username: userLoginData.loginUserName,
				password: userLoginData.loginUserPassword
			};
			axios({
			  url: "/api/account/signin",
			  method: "POST",
			  data: payload,
			})
			  .then((data) => {
				console.log(JSON.stringify(data));
				console.log("username", data.data.username);
				console.log("token", data.data.token);
				console.log("message", data.data.message);
				window.localStorage.setItem('jwt', data.data.token)
				let errorMessage = data.data.message;
				
				if (data.data.token) {
					appHistory.push("/home");
					appHistory.go();
				} else {
					setUserLoginData({["loginErrorMessage"]: errorMessage});
				}
			  })
			  .catch((error) => {
				console.log("getStoreStatus: Internal server error");
			  });
		}, 100);
	}
		
	  const ErrorMessageDisplay = () => {
		if (userLoginData.loginErrorMessage) {
			  return (
				<ul>
				<li className="signin-error-message">{userLoginData.loginErrorMessage} </li>
			  </ul>
			  )
		  } else {
			  return (
				<div></div>
			  )
		  }
	  }
	
	
	return (
		<div id="signin-body">
			<div id="signin-container"> 
				<div id="signin-app">
				<img src={shawScottLogo} alt="shaw scott Logo" className="signin-logo" />
				<form method="POST" action="" className="signin-form" onSubmit={handleLogin} id="siginForm">
					<div className="signin-form-container">
						<div className="signin-item-1">
						<input type="text" name="loginUserName" value={userLoginData.loginUserName} placeholder="Username" onChange={handleChange}/>
						</div>
						<div className="signin-item-1">
						<input type="password" name="loginUserPassword" value={userLoginData.loginUserPassword} placeholder="Password"  onChange={handleChange}/>
						</div>
						<div className="signin-item-1 signin-error-container">
							<p className="signin-p"><a href="/forgot-password"  className="signin-forgot">Forgot password?</a></p>
							<ErrorMessageDisplay />
						</div>
						<div className="signin-item-1">
							<button type="submit" className="signin-button signin-btn" id="next" value="next">SIGN IN</button>
						</div>
					</div>
				</form> 
				</div>
				<div className="signin-footer">
					<p className="signin-p">&copy;2020 All rights reserved.<br />Shaw / Scott</p>
				</div>  
			</div>
		</div>	
  );
};

export default SignInPage;