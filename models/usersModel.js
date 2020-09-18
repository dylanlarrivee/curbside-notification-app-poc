const mongoose = require('mongoose');
mongoose.pluralize(null);
const bcrypt = require('bcryptjs');

// Mongoose schema
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  email: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    default: ''
  },
  signUpDate: {
    type: Date,
    default: Date.now
  },
  username: {
    type: String,
    default: '',
    unique : true,
    dropDups: true
  },
  companyId: {
    type: String,
    default: ''
  },
  storeId: {
    type: String,
    default: ''
  },
  userRoleType: {
    type: String,
    default: 'standard'
  },
  resetPasswordToken: {
    type: String,
    default: ''
  },
  resetPasswordExpires: {
    type: Date,
    default: ''
  },
  fullName: {
    type: String,
    default: ''
  }

});
UserSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

// const User = () => {
//   return mongoose.model("users", UserSchema);
// }
// module.exports = {
//   User
// }

module.exports = mongoose.model("users", UserSchema);