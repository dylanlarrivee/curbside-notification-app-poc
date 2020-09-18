"use strict";
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const {OrderPickup,
} = require("../models/orderPickupModel");
const User = require("../models/usersModel");
const StoreInfo = require("../models/storeInfoModel");
const CompanyInfo = require("../models/companyInfoModel");

const sendEmail = require("../aws/sesSendEmail");

router.post("/report-all-data", (req, res) => {
  OrderPickup()
        .find({
            storeId: req.body.storeId,
            companyId: req.body.companyId
        })
        .then((data) => {   
          res.status(200).send({data})
        })
        .catch((error) => {
            console.log("Error", error);
            res.status(500).send({
              success: false,
              message: error,
            });
        });
  });

  router.post("/get-store-users", (req, res) => {
    User
      .find({
          storeId: req.body.storeId,
          companyId: req.body.companyId
      })
      .then((data) => {   
        let userData = data.map(function(user) { 
          return {email: user["email"], username: user["username"], fullName: user["fullName"], userRoleType: user["userRoleType"], mongoId: user["_id"]
        }})

        res.status(200).send({userData})
      })
      .catch((error) => {
          console.log("Error", error);
          res.status(500).send({
            success: false,
            message: error,
          });
      });
    });

  router.post("/update-store-user", (req, res) => {
    User.findOneAndUpdate(
      {
        username: req.body.username
      },
      {
        $set: {
          email: req.body.email,
          fullName: req.body.fullName
        },
      })
      .then((user) => {
        console.log("user:", typeof user)
        if (user) {
          res.status(200).send({
            success: true,
            message: "User has been updated",
          });
        } else {
          res.status(400).send({
            success: false,
            message: "Error: Not a valid user",
          });
        }
        
      })
      .catch((error) => {
        console.log("update user error:", error)
        res.status(500).send({
          success: false,
          message: error,
        });
      });
    });


  router.post("/add-store-user", (req, res) => {
    console.log("req.body:", req.body)

    let email = req.body.email
    let username = req.body.username
    let fullName = req.body.fullName
    let companyId = req.body.companyId
    let storeId = req.body.storeId
    let userRoleType = req.body.userRoleType
    
    if (!username) {
      return res.status(422).send({
        success: true,
        message: "Error: Username cannot be blank.",
      });
    }
    if (!email) {
      return res.status(422).send({
        success: false,
        message: "Error: Email address cannot be blank.",
      });
    }
    if (!fullName) {
      return res.status(422).send({
        success: false,
        message: "Error: Full name cannot be blank.",
      });
    }
    username = username.toLowerCase();
    username = username.trim();

    User.find(
      {
        username: username,
      })
      .then((foundUsers) => {
        if (foundUsers.length > 0) {
          return res.status(401).send({
            success: false,
            message: "Error: Username already exist.",
          });
        }
        // User.find(
        //   {
        //     email: email,
        //   })
        //   .then((foundUsers) => {
        //     if (foundUsers.length > 0) {
        //       return res.status(401).send({
        //         success: false,
        //         message: "Error: Email address already exist.",
        //       });
        //     }
          let tempPassword = Array(5).fill(null).map(() => Math.random().toString(36).substr(2)).join('')
          // Save the new user
          const newUser = new User();
          newUser.username = username;
          newUser.email = email;
          newUser.password = newUser.generateHash(tempPassword);
          newUser.fullName = fullName;
          newUser.companyId = companyId;
          newUser.storeId = storeId;
          newUser.userRoleType = userRoleType
          newUser.save()
            .then((user) => {
              console.log("new user created:", user)
              res.status(200).send({
                success: true,
                message: "New user created",
              });
            })
            .catch((error) => {
              res.status(500).send({
                success: false,
                message: "Error: Server error",
              });
            })
          // })
          // .catch((error) => {
          //   return res.status(500).send({
          //     success: false,
          //     message: "Error: Server error:", error,
          //   });
          // });
        })
        .catch((error) => {
          return res.status(500).send({
            success: false,
            message: "Error: Server error:", error,
          });
        });
      })
       

  router.post("/delete-store-user", (req, res) => {
    // Make sure the admin cannot delete itself
      User
        .deleteOne({  
            username: req.body.username
        })
        .then((user) => {
          console.log("User deleted:", user)
          res.status(200).send({
            success: true,
            message: "User deleted",
          });
        })
        .catch((error) => {
            console.log("Error", error);
            res.status(500).send({
              success: false,
              message: error,
            });
        });
      });  

/*
 * Send reset password email
 */
router.post("/reset-password-email", (req, res, next) => {
  // Check that email address in not null
  if (req.body.username === "") {
    res.status(400).send({ success: false, message: "Error: Username null" });
  } else {
    User
    .find({  
      username: req.body.username
    })
    .then((user) => {
      if (user === null || user.length == 0) {
        res
          .status(403)
          .send({ success: false, message: "Username address not on record" });
      } else {
        const passwordResetTokenBody = {
          username: req.body.username,
        };
        const jwtVerifyOptions = { expiresIn: "1h" };
        const passwordResetToken = jwt.sign(
          passwordResetTokenBody,
          process.env.SECRET,
          jwtVerifyOptions
        );
        const resetUser = user[0];
        User.findOneAndUpdate(
          {
            username: resetUser.username,
          },
          {
            $set: {
              resetPasswordToken: passwordResetToken,
              resetPasswordExpires: Date.now() + 3600000,
            },
          }
        )
          .then((user) => {
            console.log("user", user);
            if (user === null || user.length == 0) {
              res
                .status(403)
                .send({ success: false, message: "Email address not on record" });
            } else {
              console.log("User password token updated");
    
              const pwResetLink = process.env.PW_RESET_BASE_URL + "/reset-password?rt=" + passwordResetToken;
              const params = {
                Destination: {
                  ToAddresses: [`${user.email}`] // Email address/addresses that you want to send your email
                },
              //   ConfigurationSetName: <<ConfigurationSetName>>,
                Message: {
                  Body: {
                    Html: {
                      // HTML Format of the email
                      Charset: "UTF-8",
                      Data:
                        "<html><body><h1>Hello,</h1><p> You are receiving this because you (or someone else) have requested the reset of the password for your account.<br /><br /> Plese click on the following link, or paste this into your browser to complete the process within one hour of receiving it:" + pwResetLink + "<br /><br /> If you did not request this, please ignore and your password will remain unchanged.,</p></body></html>"
                    },
                    Text: {
                      Charset: "UTF-8",
                      Data: "Hello, You are receiving this because you (or someone else) have requested the reset of the password for your account. Plese click on the following link, or paste this into your browser to complete the process within one hour of receiving it:" + pwResetLink + " If you did not request this, please ignore and your password will remain unchanged."
                    }
                  },
                  Subject: {
                    Charset: "UTF-8",
                    Data: "Link to Reset Curbside Password"
                  }
                },
                Source: process.env.PW_RESET_EMAIL_ADDRESS
              };
              sendEmail(params)
              .then(data => {
                res.status(200).send({
                  success: true,
                  message: "Password reset email sent",
                });
              })
              .catch(error => {
                console.log("there was an error seding the email:", error);
                  res.status(500).send({
                    success: false,
                    message: "Error: Email sender error:" + error,
                  });
              });
            }
          })
          .catch((error) => {
            if (error) {
              console.log(error);
              return res.status(500).send({
                success: false,
                message: "Update user token error: " + error,
              });
            }
          });
    }
    })
    .catch((error) => {
        console.log("Error", error);
        res.status(500).send({
          success: false,
          message: error,
        });
    });
  }
});


/*
 * Add new store info
 */
router.post("/add-store-info", (req, res, next) => {
  let { body } = req;
  let { storeId } = body;
  let { companyId } = body;

  if (!storeId) {
    return res.status(422).send({
      success: false,
      message: "Error: Store Id cannot be blank.",
    });
  }
  if (!companyId) {
    return res.status(422).send({
      success: false,
      message: "Error: Company Id cannot be blank.",
    });
  }
  StoreInfo.find(
    {
      storeId: storeId,
    },
    (err, previousUsers) => {
      if (err) {
        return res.status(500).send({
          success: false,
          message: "Error: Server error",
        });
      } else if (previousUsers.length > 0) {
        return res.status(401).send({
          success: false,
          message: "Error: Store id already exist.",
        });
      }
      // Save the new user
      const newStore = new StoreInfo();
      newStore.storeId = storeId;
      newStore.companyId = companyId;
      newStore.save((err, user) => {
        if (err) {
          return res.status(500).send({
            success: false,
            message: "Error: Server error",
          });
        }
        return res.status(200).send({
          success: true,
          message: "New store info added",
        });
      });
    }
  );
}); 

/*
 * Add new company info
 */
router.post("/add-company-info", (req, res, next) => {
  let { body } = req;
  let { companyId } = body;
  let { tableColumnCopy } = body;
  let { tableColumnIds } = body;
  let { maxUsers } = body;

  if (!tableColumnCopy) {
    return res.status(422).send({
      success: false,
      message: "Error: Table column copy cannot be blank.",
    });
  }
  if (!companyId) {
    return res.status(422).send({
      success: false,
      message: "Error: Company Id cannot be blank.",
    });
  }
  if (!tableColumnIds) {
    return res.status(422).send({
      success: false,
      message: "Error: Table column ids cannot be blank.",
    });
  }
  CompanyInfo.find(
    {
      companyId: companyId,
    },
    (err, previousUsers) => {
      if (err) {
        return res.status(500).send({
          success: false,
          message: "Error: Server error",
        });
      } else if (previousUsers.length > 0) {
        return res.status(401).send({
          success: false,
          message: "Error: Store id already exist.",
        });
      }
      // Save the new user
      const newCompany = new CompanyInfo();
      newCompany.companyId = companyId;
      newCompany.tableColumnCopy = tableColumnCopy;
      newCompany.tableColumnIds = tableColumnIds;
      if (maxUsers) {
        newCompany.maxUsers = maxUsers;
      }
      newCompany.save((err, user) => {
        if (err) {
          return res.status(500).send({
            success: false,
            message: "Error: Server error",
          });
        }
        return res.status(200).send({
          success: true,
          message: "New company info added",
        });
      });
    }
  );
}); 

router.post("/get-all-companies", (req, res) => {
  CompanyInfo
    .find({
        companyId: req.body.companyId
    })
    .then((data) => {   
      let companyData = data.map(function(company) { 
        return {tableColumnIds: company["tableColumnIds"], companyId: company["companyId"], tableColumnCopy: company["tableColumnCopy"], maxUsers: company["maxUsers"]
      }})

      res.status(200).send({companyData})
    })
    .catch((error) => {
        console.log("Error", error);
        res.status(500).send({
          success: false,
          message: error,
        });
    });
  });

  module.exports = router;