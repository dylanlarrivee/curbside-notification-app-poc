"use strict";
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
// const nodemailer = require("nodemailer");
const bcrypt = require('bcryptjs');

const User = require("../models/usersModel");

const sendEmail = require("../aws/sesSendEmail");
/*
 * Authenticate token
 */
const getTokenFrom = (req) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.substring(7);
  }
  return null;
};

router.post("/account/auth", (req, res, next) => {
  const body = req.body;
  const token = getTokenFrom(req);
  console.log("token", token);
  jwt.verify(token, process.env.SECRET, (err, verifiedJwt) => {
    if (err || !token) {
      return res.status(401).send({
        success: false,
        message: "Token missing or invalid",
        tokenError: err
      });
    } else {
      console.log("verifiedJwt", verifiedJwt);
      return res.status(200).send({
        success: true,
        message: "Valid token",
        storeId: verifiedJwt.storeId,
        companyId: verifiedJwt.companyId,
        fullName: verifiedJwt.fullName,
        username: verifiedJwt.username,
        userRoleType: verifiedJwt.userRoleType,
      });
    }
  });
});

/*
 * Sign In
 */
router.post("/account/signin", (req, res, next) => {
  console.log("req.headers.host:", req.headers.host)
  let { body } = req;
  let { password } = body;
  let { username } = body;
  if (!username && !password) {
    return res.status(422).send({
      success: false,
      message: "Error: Username and password cannot be blank.",
    });
  }

  if (!username) {
    return res.status(422).send({
      success: false,
      message: "Error: Username cannot be blank.",
    });
  }
  if (!password) {
    return res.status(422).send({
      success: false,
      message: "Error: Password cannot be blank.",
    });
  }
  username = username.toLowerCase();
  username = username.trim();
  User
    .find(
    {
      username: username,
    })
    .then((users) => {   
      if (users.length != 1) {
        return res.send({
          success: false,
          message: "Error: Invalid Username",
        });
      }
      const user = users[0];
      if (!user.validPassword(password)) {
        return res.send({
          success: false,
          message: "Error: Invalid Password",
        });
      }
      // Otherwise correct user
      const userForToken = {
        username: user.username,
        id: user._id,
        storeId: user.storeId,
        companyId: user.companyId,
        fullName: user.fullName,
        userRoleType: user.userRoleType
      };

      const jwtVerifyOptions = { expiresIn: "12h" };
      const token = jwt.sign(
        userForToken,
        process.env.SECRET,
        jwtVerifyOptions
      );

      return res.status(200).send({
        success: true,
        message: "Valid sign in",
        token,
        username: user.username,
        name: user.name,
        // token: doc._id
      });

    })
    .catch((error) => {
      return res.send({
        success: false,
        message: "Error: Internal server error",
      });
    });
});

/*
 * Logout
 */
// router.get("/account/logout", (req, res, next) => {
//   // Get the token
//   const { query } = req;
//   const { token } = query;
//   // ?token=test
//   // Verify the token is one of a kind and it's not deleted.
//   User.findOneAndUpdate(
//     {
//       _id: token,
//       isDeleted: false,
//     },
//     {
//       $set: {
//         isDeleted: true,
//       },
//     },
//     null,
//     (err, sessions) => {
//       if (err) {
//         console.log(err);
//         return res.send({
//           success: false,
//           message: "Error: Server error",
//         });
//       }
//       return res.send({
//         success: true,
//         message: "Good",
//       });
//     }
//   );
// });

/*
 * Sign up
 */
router.post("/account/signup", (req, res, next) => {
  const { body } = req;
  const { password } = body;
  let { email } = body;
  let { username } = body;
  let { companyId } = body;
  let { storeId } = body;
  let { fullName } = body;
  let { userRoleType } = body;

  if (!username) {
    return res.status(422).send({
      success: false,
      message: "Error: Username cannot be blank.",
    });
  }
  if (!password) {
    return res.status(422).send({
      success: false,
      message: "Error: Password cannot be blank.",
    });
  }
  username = username.toLowerCase();
  username = username.trim();
  // Steps:e
  // 1. Verify username doesn't exist
  // 2. Save
  User.find(
    {
      username: username,
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
          message: "Error: Account already exist.",
        });
      }
      // Save the new user
      const newUser = new User();
      newUser.username = username;
      newUser.email = email;
      newUser.password = newUser.generateHash(password);
      newUser.username = username;
      newUser.companyId = companyId;
      newUser.storeId = storeId;
      newUser.fullName = fullName;
      newUser.userRoleType = userRoleType;
      newUser.save((err, user) => {
        if (err) {
          return res.status(500).send({
            success: false,
            message: "Error: Server error",
          });
        }
        return res.status(200).send({
          success: true,
          message: "Signed up",
        });
      });
    }
  );
}); // end of sign up endpoint

/*
 * Forgot Password
 */
router.post("/account/forgot-password", (req, res, next) => {
  console.log("req.body.email", req.body.username);
  // Check that email address in not null
  if (req.body.username === "") {
    res.status(400).send({ success: false, message: "Username required" });
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
    User.findOneAndUpdate(
      {
        username: req.body.username,
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

          // const transporter = nodemailer.createTransport({
          //   host: "smtp.gmail.com",
          //   port: 465,
          //   secure: true,
          //   pool: true, // This is the field you need to add
          //   auth: {
          //     user: `${process.env.PW_RESET_EMAIL}`,
          //     pass: `${process.env.PW_RESET_PASSWORD}`,
          //   },
          // });
          // const mailOptions = {
          //   from: "curbsides.shawscottapps@gmail.com",
          //   to: `${user.email}`,
          //   subject: "Link to Reset Curbside Password",
          //   text:
          //     "You are receiving this because you (or someone else) have requested the reset of the password for your account. \n\n" +
          //     "Plese click on the following link, or paste this into your browser to complete the process within one hour of receiving it: \n\n" +
          //     `http://localhost:3000/reset-password?rt=${passwordResetToken} \n\n` +
          //     "If you did not request this, please ignore and your password will remain unchanged.\n",
          // };
          // transporter.sendMail(mailOptions, (error, response) => {
          //   if (error) {
          //     console.log("there was an error seding the email:", error);
          //     res.status(500).send({
          //       success: false,
          //       message: "Error: Email sender error:" + error,
          //     });
          //   } else {
          //     res.status(200).send({
          //       success: true,
          //       message: "Password reset email sent",
          //     });
          //   }
          // });
          // ------------------------------------------------
          const pwResetLink = "http://localhost:3000/reset-password?rt=" + passwordResetToken;
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
            message: "Update user token error:" + error,
          });
        }
      });
  }
});

/*
 * Reset Password
 */
router.post("/account/reset-password", (req, res, next) => {
  // Check that password meets character requirments. We dont want $ because of mongodb
  if (req.body.newPassword.includes("$")) {
    return res.status(403).send({
        success: false,
        message: "Error: Password contains invlaid characters ($)",
      });
  }
  
  // Get the token
  const resetToken = req.body.token;
  const newPassword = req.body.newPassword;

  jwt.verify(resetToken, process.env.SECRET, (error, verifiedJwt) => {
    if (error || !resetToken) {
      return res.status(401).send({
        success: false,
        message: "Token missing or invalid",
      });
    } else {
      User.findOneAndUpdate(
        {
          resetPasswordToken: resetToken,
          username: verifiedJwt.username,
        },
        {
          $set: {
            password: bcrypt.hashSync(newPassword, bcrypt.genSaltSync(8), null),
            resetPasswordToken: ''
          },
        }
      )
        .then((user) => {
          console.log("user", user);
          if (user === null || user.length == 0) {
            res
              .status(401)
              .send({ success: false, message: "Reset password link is invalid or has expired" });
          } else {
            console.log("User password updated");
            res.status(200).send({
              success: true,
              message: "Password updated",
            });
          }
        })
        .catch((error) => {
          if (error) {
            console.log(error);
            return res.status(500).send({
              success: false,
              message: "Update user password error:" + error,
            });
          }
        });
    }
  });
});

/*
 * Reset Password Authentication
 */
router.post("/account/reset-auth", (req, res, next) => {
  // Get the token
  const resetToken = req.body.token;
  console.log("resetToken", resetToken);
  jwt.verify(resetToken, process.env.SECRET, (error, verifiedJwt) => {
    if (error || !resetToken) {
      return res.status(401).send({
        success: false,
        message: "Token missing or invalid",
      });
    } else {
      console.log("verifiedJwt", verifiedJwt);
      // Verify the token is one of a kind and it's not deleted.
      User.find({
        resetPasswordToken: resetToken,
        username: verifiedJwt.username,
      })
        .then((data) => {
          if (data.length == 0) {
            console.log("tokenError:", data);
            res.status(401).send({
              success: false,
              message: "Token missing or invalid",
            });
          } else
            res.status(200).send({
              success: true,
              message: "Valid token",
            });
        })
        .catch((error) => {
          res.status(500).send({
            success: false,
            message: "Server error:",
            error,
          });
        });
    }
  });
});

module.exports = router;
