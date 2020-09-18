import React, { useState, useEffect, useReducer } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";
import LoadingBar from  "./loadingBar"
// import "../css/admin.css";

// TODO: Add in copy to let them know they have either enabled or disabled notificaions already
const EnableNotifications = (props) => {
  if (
    Notification.permission !== "denied" &&
    Notification.permission !== "granted"
  ) {
    return (
      <div>
        <h2>Enable Browser Notifications for Current Queue</h2>
        <p>
          Click to allow browser notifications. These can be set in browser
          setttings as well.
        </p>
        <button
          type="button"
          className="btn-start"
          onClick={props.changeNotificationStatus}
          aria-label="Enable Notifications"
        >
          Enable Notifications
        </button>
      </div>
    );
  } else {
  }
  return <div></div>;
};

const SendPwResteEmailButton = (props) => {
  if (props.pwResetEmailSentStatus) {
    return (
      <div>
        <button
          type="button"
          className="btn-started"
          aria-label="Reset Password"
        >
          Reset email has been sent
        </button>
      </div>
    );
  } else {
    return (
      <div>
        <button
          type="button"
          className="btn-start"
          aria-label="Reset Password"
          onClick={props.sendPWResetEMail}
        >
          Send Email
        </button>
      </div>
    );
  }
};

const ErrorMessageDisplay = (props) => {
  if (props.usernameErrorMessage) {
      return (
      <ul>
      <li className="signin-error-message">{props.usernameErrorMessage} </li>
      </ul>
      )
    } else {
      return (
      <div></div>
      )
    }
  }

const SuccessMessageDisplay = (props) => {
  if (props.usernameSuccessMessage) {
      return (
      <ul>
      <li className="signin-success-message">{props.usernameSuccessMessage} </li>
      </ul>
      )
    } else {
      return (
      <div></div>
      )
    }
  }  

const DeleteProfileButton = (props) => {
 if (props.username === props.currentUsername) {
  return (
    <button id={props.username} type="button" className="btn-started" aria-label="Delete">Delete Profile</button>
  ) 
 } else {
  return (
    <button id={props.username} type="button" className="btn-pickedup" aria-label="Delete" onClick={props.confirmDelete}>Delete Profile</button>
  )
 }
}



const AddProfile = (props) => {
  const submitProfile = () => {
    const payload = {
      username: props.newUserData.newUsername,
      fullName: props.newUserData.newUserFullName,
      email: props.newUserData.newUserEmail,
      companyId: props.adminCompanyId,
      storeId: props.adminStoreId,
      userRoleType: "standard"
    };
    axios({
      url: "/api/add-store-user",
      method: "POST",
      data: payload,
    })
      .then((data) => {
        console.log("data:", JSON.stringify(data.data.message));
        props.setUsernameSuccessMessage(data.data.message);
        let tempStoreUsers = props.storeUsers;
        tempStoreUsers.push(payload);
        console.log("usernameSuccessMessage:", props.usernameSuccessMessage)
        props.setStoreUsers([...tempStoreUsers]);
            let resetPayload = {
              username: props.newUserData.newUsername
            }
          axios({
              url: "/api/reset-password-email",
              method: "POST",
              data: resetPayload,
            })
              .then((data) => {
                console.log(data);
              })
              .catch((error) => {
                console.log("Send reset passsword email error: ", error);
              });
      })
      .catch((error) => {
        console.log("Add new user error: Internal server error: ", error);
        props.setUsernameErrorMessage(error.response.data.message);
        // console.log("Add new user error: Internal server error: ", error.response.data.message);
        // Put an alert to notify if there was an error
      });
  }
  
  const handleUserChange = evt => {
    const name = evt.target.name;
    const newValue = evt.target.value;
    props.setNewUserData({[name]: newValue});
    } 

  const resetProfileFields = () => {
    props.setUsernameErrorMessage("");
    props.setUsernameSuccessMessage("");
  }
  
  if(props.storeUsers.length >= 5) {
    return (
      <div className="help-container">
      <h2>Add A Profile</h2>
      <p>You are currently at your 5 profile limit and not able to add more profiles at this time. To add another profile, you must remove a profile above.</p>
      </div>
    ) } else {
      return (
        <div>
        <div className="help-container">
        <h2>Add A Profile (Limit 5)</h2>
        <p>A temprary password will be set and a password reset email will be sent to the email address you give below.</p>
        </div>
        <div id="addProfile">
        <form action="" id="updatePassword" className="form-update">
            <div>
                <label htmlFor="newUsername">Username</label>
                <input type="text" id="newUsername" name="newUsername" aria-label="Username" onChange={handleUserChange}/>
            </div>
            <div>
                <label htmlFor="newUserFullName">Name</label>
                <input type="name" id="newUserFullName" name="newUserFullName" aria-label="Username" onChange={handleUserChange}/>
            </div>
            <div>
                <label htmlFor="newUserEmail">Email</label>
                <input type="email" id="newUserEmail" name="newUserEmail" aria-label="Email" onChange={handleUserChange} />
            </div>
            <ErrorMessageDisplay usernameErrorMessage ={props.usernameErrorMessage}/>
            <SuccessMessageDisplay usernameSuccessMessage ={props.usernameSuccessMessage}/>
            <button type="button" className="btn-start" aria-label="Add A Profile" onClick={submitProfile}>+ Profile</button>
            <button type="reset" className="btn-pickedup" aria-label="Reset" onClick={resetProfileFields}>Reset</button>
        </form>
    </div>
    </div>
      )
    }
}

const Admin = (props) => {
  const [historicalData, setHistoricalData] = useState("");
  const [storeUsers, setStoreUsers] = useState([]);
  const [storeUsersLoaded, setStoreUsersLoaded] = useState(false);
  const [pwResetEmailSentStatus, setPwResetEmailSentStatus] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState("");
  const [usernameSuccessMessage, setUsernameSuccessMessage] = useState("");
  const [newUserData, setNewUserData] = useReducer(
		(state, newState) => ({...state, ...newState}),
      {
        newUsername: '',
        newUserFullName: '',
        newUserEmail: ''
      }
	  );
  
  const adminFullName = props.fullName
  const adminStoreId = props.storeId
  const adminCompanyId = props.companyId
  const adminUsername = props.username
  const userRoleType = props.userRoleType
  
  console.log("newUserData:", newUserData);
  
  useEffect(() => {
    if (adminCompanyId && adminCompanyId) {
      let payload = {
        storeId: adminStoreId,
        companyId: adminCompanyId
      }
      axios({
          url: "/api/get-store-users",
          method: "POST",
          data: payload,
        })
          .then((data) => {
            console.log(
              "data:",
              JSON.stringify(data.data.userData)
            );
            setStoreUsers(data.data.userData);
            setStoreUsersLoaded(true)
          })
          .catch((error) => {
            console.log("getStoreStatus: Internal server error:", error);
            setStoreUsersLoaded(true)
          });
    } 
  }, [adminStoreId,adminCompanyId ]);

  const changeNotificationStatus = () => {
    Notification.requestPermission()
    console.log("notification updates")
  }

  const sendPWResetEMail = () => {
    setPwResetEmailSentStatus(true);
    let payload = {
      username: adminUsername
      }
      axios({
          url: "/api/reset-password-email",
          method: "POST",
          data: payload,
        })
          .then((data) => {
            console.log(data)
            setTimeout(function () {
              setPwResetEmailSentStatus(false);
            }, 60000);

          })
          .catch((error) => {
            console.log("Send reset passsword email error: ", error);
          });
  }

 

  const confirmDelete = (e) => {
    let deleteUsername = e.target.id;
    console.log("deleteUsername:", deleteUsername)
    if (window.confirm("Confirm that you want to delete user: " + deleteUsername)) {
      let payload = {
      username: deleteUsername
      }
      axios({
          url: "/api/delete-store-user",
          method: "POST",
          data: payload,
        })
          .then((data) => {
            console.log(
              "data:",
              JSON.stringify(data.data.userData)
            );
            let deleteUserFindIndex = (element) => element.username === deleteUsername;
            console.log("deleteUserFindIndex")
           
            let deleteUserIndex = storeUsers.findIndex(deleteUserFindIndex);
            let tempStoreUsers = storeUsers
            // let deleteUserIndex = tempStoreUsers.findIndex(deleteUserFindIndex);
            tempStoreUsers.splice(deleteUserIndex, 1);
            console.log(tempStoreUsers)
            // let updatedUserArray = storeUsers.splice(deleteUserIndex, 1);
            // let updatedUserArray = storeUsers.filter(item => item.username !== deleteUsername)
            // setStoreUsers(updatedUserArray);
            setStoreUsers([...tempStoreUsers]);
            setStoreUsersLoaded(true)
            console.log("storeUsers:", storeUsers)


          })
          .catch((error) => {
            console.log("getStoreStatus: Internal server error:", error);
            setStoreUsersLoaded(true)
          });
  }
}

  const downloadReport = (e) => {
    let payload = {
      storeId: adminStoreId,
      companyId: adminCompanyId
    };
    axios({
      url: "/api/report-all-data",
      method: "POST",
      data: payload,
    })
      .then((data) => {
        console.log("data:", JSON.stringify(data.data.data));
        setHistoricalData(data.data.data);
        document.getElementById("csvLinkButton").click();
      })
      .catch((error) => {
        console.log("changeStoreStatus: Internal server error");
        // Put an alert to notify if there was an error
      });
  }

  const SuperUserLevelUser = (props) => {
    if (userRoleType === "superUser") {
      return (
        <div id="statusLevel02">
        <div className="help-container">
            <h2>Company Info:</h2>
            <p>See all companies using the app</p>
            <a href=""><button type="button" className="btn-start">Click to show</button></a>
        </div>
        </div>
      )
    } else {
      return (
        <div></div>
      )
    }
    
  }

  const AdminLevelUser = (props) => {
    if (userRoleType === "superUser" || userRoleType === "admin") {
    return (
      <div id="statusLevel02">
          <div>
            <h2>Current Store Users</h2>
            <p style={{padding:"0px 0px 15px 0px"}}>These are all the current users for your store:</p>
          </div>
          {storeUsers.map((p, index) => (
              <div key={"user_" + index} className="table-container-profile">
                  <div className="table-item-header-profile header-01-profile"><p>Username</p></div>
                  <div className="table-item-header-profile header-02-profile"><p>Full Name</p></div>
                  <div className="table-item-header-profile header-03-profile"><p>Email Address</p></div>
                  <div className="table-item-header-profile header-04-profile"><p>Password</p></div>
                  <div className="table-item-header-profile header-05-profile"><p>&nbsp;</p></div>
              
                  <div className="table-item-profile table-item-01-profile"><p>{p.username}</p></div>
                  <div className="table-item-profile table-item-02-profile"><p>{p.fullName}</p></div>
                  <div className="table-item-profile table-item-03-profile"><p>{p.email}</p></div>
                  <div className="table-item-profile table-item-04-profile"><p>••••••••••</p></div>
                  <div className="table-item-profile table-item-05-profile">
                    <DeleteProfileButton username={p.username} confirmDelete={confirmDelete} currentUsername={adminUsername}/>
                  </div>
              </div>
            ))}

              <div className="help-container">
                <AddProfile adminStoreId={adminStoreId} adminCompanyId={adminCompanyId} setUsernameErrorMessage={setUsernameErrorMessage} setUsernameSuccessMessage={setUsernameSuccessMessage} newUserData={newUserData} setNewUserData={setNewUserData} usernameErrorMessage={usernameErrorMessage} usernameSuccessMessage={usernameSuccessMessage} storeUsers={storeUsers} setStoreUsers={setStoreUsers}/>
              </div>

              

          </div>
    )} else {
        return (
          <div>
          </div>
        )
  }
}

  const StandardLevelUser = (props) => {
    if (userRoleType === "standard" || userRoleType === "superUser" || userRoleType === "admin") {
    return (
      <div id="statusLevel01">
      <EnableNotifications changeNotificationStatus={changeNotificationStatus}/>
      <div>
          <h2>Update Your Password</h2>
          <p>Send yourself a password reset email:</p>
          <SendPwResteEmailButton pwResetEmailSentStatus={pwResetEmailSentStatus} sendPWResetEMail={sendPWResetEMail}  />
      </div>

      <div>
          <h2>Download Historical Data</h2>
          <p style={{padding:"0px 0px 15px 0px"}}>Historical pickup data from the last 7 days:</p>
          <button type="button" className="btn-start" onClick={downloadReport}>Download data</button>
            <CSVLink
            id="csvLinkButton"
            filename={"my-file.csv"}
            target="_blank" 
            data={historicalData}  
            filename="historical_data.csv"
            className="btn-start"
            style={{display:'none'}}
           >
          </CSVLink>
      </div>

      <div className="help-container">
          <h2>Need Help?</h2>
          <p>Use our help documenation:</p>
          <a href=""><button type="button" className="btn-start">Download help guide</button></a>
      </div>

  </div>
    )
    } else {
      return (
        <div></div>
      )
    }
  }

  if (!userRoleType || !storeUsersLoaded) {
    return (
      <div>
      <main>
            <LoadingBar color="#dddddd" />
        </main>
      </div>
    )
  } else if (userRoleType === "superUser" || userRoleType === "admin") {
    return (
      <div>
      <div className="admin-container">
      <div className="admin-info">
          <h2 className="clerk-color txt-center">{adminFullName}</h2>
          <h2 className="txt-center">User Role Level:<br /><span className="clerk-color">{userRoleType}</span></h2>
          {/* <!--status level standard--> */}
         <StandardLevelUser />
          {/* <!--status level admin--> */}
          <AdminLevelUser />
          {/* <!--status level superUser--> */}
          <SuperUserLevelUser />

      </div>
  </div>
  </div>
    );
  } else {
    return (<div>
      You do not have access rights for this page
    </div>
    )
  }
};

export default Admin;