import React, { useReducer} from 'react';
import axios from "axios";
import shawScottLogo from '../img/ShawScott_Logo_Gradient.png';
import Loader from "react-loader-spinner";


// Build out a component for the loading screen
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
// Display any error messages if present
const ErrorMessageDisplay = ({forgotPasswordData}) => {
if (forgotPasswordData.errorMessage) {
    return (
        <ul>
            <li className="signin-error-message">{forgotPasswordData.errorMessage} </li>
        </ul>
        )
    } else {
        return (
        <div></div>
        )
    }
}

// Display different copy depending on if email has been sent or not
const PasswordResetConfirmation = ({forgotPasswordData, setForgotPasswordData}) => {
  
  const handleChange = event => {
      const name = event.target.name;
      const newValue = event.target.value;
      setForgotPasswordData({[name]: newValue});
  }  
    
    if (forgotPasswordData.passwordEmailSent) {
        return (
            <div className="text-container">
                <p className="signin-p">A password reset email has been sent. Please check your inbox.</p>
            </div>
          );
    } else if (forgotPasswordData.resetEmailLoading) {
        return (
             <div id="resetEmailLoading">
                <LoadingBar color="#dddddd" />
            </div>
          );
      } else {
        return (
            <div>
                <div className="text-container">
			        <p className="signin-p">Enter your username below to send yourself a password reset email:</p>
		        </div>
                <div className="signin-form-container">
                    <div className="signin-item-1">
                        <input key="forgotPasswordEmailInput" id="forgotPasswordEmailInput" className="signin-input" type="text" name="username" value={forgotPasswordData.username} placeholder="Username" onChange={handleChange} />
                    </div>
                    <div className="signin-item-1 signin-error-container">
                        <ErrorMessageDisplay forgotPasswordData={forgotPasswordData}/>
                    </div>
                    <div className="signin-item-1">
                        <button type="submit" className="signin-button signin-btn-resend" id="next" value="next">Send password reset email</button>
                    </div>
                </div>
            </div>
          );
    }
}

const ForgotPassword = (props) => {
	const [forgotPasswordData, setForgotPasswordData] = useReducer(
		(state, newState) => ({...state, ...newState}),
		{
        username: '',
        errorMessage:'',
        passwordEmailSent: false,
        resetEmailLoading: false
		}
      );
	const handleForgotPassword = (event) => {
        event.preventDefault();
        setForgotPasswordData({["resetEmailLoading"]: true});
		const payload = {
			username: forgotPasswordData.username
		};
		axios({
		  url: "/api/account/forgot-password",
		  method: "POST",
		  data: payload,
		})
		  .then((data) => {
			console.log("data", JSON.stringify(data));
            let errorMessageCopy = data.data.message;
			if (data.data.success) {
				setForgotPasswordData({["passwordEmailSent"]: true});
            } 
            setForgotPasswordData({["resetEmailLoading"]: false});
		  })
		  .catch((error) => {
            console.log("Error:", JSON.stringify(error.message));
            if (error.message.includes("400")) {
                setForgotPasswordData({["errorMessage"]: "Email address required" });
            } else if (error.message.includes("403")) {
                setForgotPasswordData({["errorMessage"]: "Email address not on record" });
            } else {
                setForgotPasswordData({["errorMessage"]: "Internal server error please try again" });
            }
            setForgotPasswordData({["resetEmailLoading"]: false});
		  });
      };
	

        return (
            <div id="signin-body">
                <div id="signin-container"> 
                    <div id="signin-app">
                    <img src={shawScottLogo} alt="shaw scott Logo" className="signin-logo" />
                    <form method="POST" action="" className="signin-form" onSubmit={handleForgotPassword}>
                    <PasswordResetConfirmation forgotPasswordData={forgotPasswordData} setForgotPasswordData={setForgotPasswordData}/>
                    </form> 
                    </div>
                    <div className="signin-footer">
                        <p className="signin-p">&copy;2020 All rights reserved.<br />Shaw / Scott</p>
                    </div>  
                </div>
            </div>	
         );
};

export default ForgotPassword;