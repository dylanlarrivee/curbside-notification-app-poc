const mongoose = require('mongoose');
mongoose.pluralize(null);

// Mongoose schema
const Schema = mongoose.Schema;
const StoreInfoSchema = new Schema({
  storeId: {
    type: String,
    default: ''
  },
  companyId: {
    type: String,
    default: ''
  },
  storeStatus: {
    type: Boolean,
    default: false
  }
});

// const StoreInfo = () => {
//   return mongoose.model('store-info', StoreInfoSchema);
// } 
// module.exports = {
//   StoreInfo
// };

module.exports = mongoose.model("store-info", StoreInfoSchema);
