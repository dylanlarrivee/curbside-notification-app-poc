const mongoose = require('mongoose');
mongoose.pluralize(null);

// Mongoose schema
const Schema = mongoose.Schema;
const CompanyInfoSchema = new Schema({
  tableColumnIds: {
    type: Array,
    default: ''
  },
  companyId: {
    type: String,
    default: ''
  },
  tableColumnCopy: {
    type: Object,
    default: {}
  },
  maxUsers: {
    type: String,
    default: '5'
  }
});

// const CompanyInfo = () => {
//   return mongoose.model('company-info', CompanyInfoSchema);
// } 
// module.exports = {
//   CompanyInfo
// };

module.exports = mongoose.model("company-info", CompanyInfoSchema);
