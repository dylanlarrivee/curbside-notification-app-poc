import React, { useReducer, useEffect} from 'react';
import axios from "axios";
import shawScottLogo from '../img/ShawScott_Logo_Gradient.png';
import Loader from "react-loader-spinner";

// Build out a component for the loader
const LoadingBar = (props) => {
    return (
      <div
        style={{
          width: "100%",
          height: "100",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Loader type="ThreeDots" color={props.color} height="100" width="100" />
      </div>
    );
  };
// Disaply error messages if any
const ErrorMessageDisplay = ({resetPasswordData}) => {
	if (resetPasswordData.resetErrorMessage) {
		  return (
			<ul>
			<li v-for="error in errors" className="signin-error-message">{resetPasswordData.resetErrorMessage} </li>
		  </ul>
		  )
	  } else {
		  return (
			<div></div>
		  )
	  }
  }

  const VerifyTokenDiplay = ({resetPasswordData, setResetPasswordData}) => {
	const handleChange = evt => {
		const name = evt.target.name;
		const newValue = evt.target.value;
		setResetPasswordData({[name]: newValue});
		setResetPasswordData({['inputFocus']: name});
	}  

	if (resetPasswordData.tokenVerified && !resetPasswordData.passwordUpdated) {
		return (
			<div>
			<div className="text-container">
				<p className="signin-p">Enter new password below:</p>
			</div>
			<div className="signin-form-container">
				<div className="signin-item-1">
					<input key="newPassword" className="signin-input" type="password" name="newPassword" value={resetPasswordData.newPassword} placeholder="New password" onChange={handleChange} />
				</div>
				<div className="signin-item-1">
					<input key="confirmNewPassword" className="signin-input" type="password" name="confirmNewPassword" value={resetPasswordData.confirmNewPassword} placeholder="Confirm new password" onChange={handleChange} />
				</div>
				<div className="signin-item-1 signin-error-container">
					<ErrorMessageDisplay resetPasswordData={resetPasswordData}/>
				</div>
				<div className="signin-item-1">
					<button type="submit" className="signin-button signin-btn-resend" id="next" value="next">Save new password</button>
				</div>
			</div>
		</div>
			
		  );
	  } else if (!resetPasswordData.tokenLoaded) {
		return (
			 <div>
				  <LoadingBar color="#dddddd" />
			</div>
		  );
	  } else if (resetPasswordData.passwordUpdated) {
		return (
			<div>
				<div className="text-container txt-center">
					<p className="signin-p">Your password has been updated successfully.</p>
				</div>
				<div className="signin-item-1">
					<a href="/signin"><button type="button" className="signin-button signin-btn-resend">Back to signin page</button></a>
				</div> 
			</div>
			)
	  } 
	  else {
		return (
			<div>
				<div className="text-container txt-center">
						<p className="signin-p">Link is invalid or has expired. Please try again.</p>
				</div>
				<div className="signin-item-1">
					<a href="/signin"><button type="button" className="signin-button signin-btn-resend">Back to signin page</button></a>
				</div>
			</div> 
		  );
	  }
  }

const ResetPasswordPage = (props) => {

	const [resetPasswordData, setResetPasswordData] = useReducer(
		(state, newState) => ({...state, ...newState}),
		{
		newPassword: '',
		confirmNewPassword: '',
		resetErrorMessage:'',
		passwordResetToken:'',
		tokenVerified: false,
		tokenLoaded: false,
		passwordUpdated: false
		}
		);
	const params = new URLSearchParams(window.location.search);
	if (params.has("rt") && !resetPasswordData.passwordResetToken) {
		setResetPasswordData({passwordResetToken: params.get('rt')}); 
	}

	useEffect(() => {
		if (resetPasswordData.passwordResetToken) {
		let payload = {
			token: resetPasswordData.passwordResetToken,
			};
		
		axios({
		url: "/api/account/reset-auth",
		method: "POST",
		data: payload,
		})
		.then((data) => {
			if (data.data.success) {
				setResetPasswordData({["tokenVerified"]: true});
				setResetPasswordData({["tokenLoaded"]: true});
			}
		})
		.catch((error) => {
			setResetPasswordData({["tokenLoaded"]: true});
		});
	}
	}, [resetPasswordData.passwordResetToken]);

	const handleResetPasswordSubmit = (event) => {
		event.preventDefault()
		// TODO Add in a length / charcter requirment for the new password
		// TODO Add in a requirment that new password can not be the same as old password
		if (!resetPasswordData.confirmNewPassword || !resetPasswordData.newPassword) {
			setResetPasswordData({["resetErrorMessage"]: "Passwords must not be empty"});
			return
		}
		if (resetPasswordData.confirmNewPassword !== resetPasswordData.newPassword) {
			setResetPasswordData({["resetErrorMessage"]: "Passwords must match"});
			return
		}

		let payload = {
			token: resetPasswordData.passwordResetToken,
			newPassword: resetPasswordData.confirmNewPassword
			};

		axios({
		  url: "/api/account/reset-password",
		  method: "POST",
		  data: payload,
		})
		  .then((data) => {
			console.log("data:", JSON.stringify(data));
			console.log("data end:");
			let errorMessage = data.data.message;
			if (data.data.success) {
				setResetPasswordData({["passwordUpdated"]: true});
				console.log("success: true")
			} else {
				setResetPasswordData({["resetErrorMessage"]: errorMessage});
			}
		  })
		  .catch((error) => {
			console.log(error)
			if (error.message.includes("401")) {
                setResetPasswordData({["tokenVerified"]: false});
            } else if (error.message.includes("500")){
                setResetPasswordData({["resetErrorMessage"]: "Internal server error. Please try again."});
			}else {
               setResetPasswordData({["resetErrorMessage"]: error.response.data.message}); 
			}
			
		  });
	  };
	  return (
		<div id="signin-body">
		<div id="signin-container"> 
			<div id="signin-app">
			<img src={shawScottLogo} alt="shaw scott Logo" className="signin-logo" />
			<form method="POST" action="" className="signin-form" onSubmit={handleResetPasswordSubmit}>
			<VerifyTokenDiplay resetPasswordData={resetPasswordData} setResetPasswordData={setResetPasswordData}/>
			</form> 
			</div>
			<div className="signin-footer">
				<p className="signin-p">&copy;2020 All rights reserved.<br />Shaw / Scott</p>
			</div>  
		</div>
	</div>	

		
	  )
};

export default ResetPasswordPage;