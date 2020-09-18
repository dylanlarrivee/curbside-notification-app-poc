const mongoose = require("mongoose");
mongoose.pluralize(null);

// Mongoose schema
const Schema = mongoose.Schema;
const OrderPickupSchema = new Schema({
  name: {
    type: String,
    default: "",
  },
  storeId: {
    type: String,
    default: "",
  },
  orderId: {
    type: String,
    default: "",
  },
  parkingSpotNum: {
    type: String,
    default: "",
  },
  date: {
    type: Date,
    default: "",
  },
  carDescription: {
    type: String,
    default: "",
  },
  companyId: {
    type: String,
    default: "",
  },
  orderStatus: {
    type: String,
    default: "submitted",
  },
  clerkNameProcessing: {
    type: String,
    default: "",
  },
  usernameProcessing: {
    type: String,
    default: "",
  },
  clerkNameCompleted: {
    type: String,
    default: "",
  },
  orderSubmittedDate: {
    type: Date,
    default: Date.now
  },
  orderCompletedDate: {
    type: Date,
    default: ""
  },
  // expire_at: {
  //   type: Date, 
  //   default: Date.now, 
  //   // Set to delete the data after 7 days
  //   expireAfterSeconds: 604800
  // },
    expire_at: {
      type: Date, 
      default: Date.now, 
      // Set to delete the data after 7 days
      index: { 
        expireAfterSeconds: 604800
      }
    }
});

// Mongoose Model
// const NowCurbsideCustomer = mongoose.model('current-curbside-customers', CurbsideCustomerSchema);

// TODO: Delete these
// const NowCurbsideCustomer = (storeId) => {
//   return mongoose.model(
//     storeId + "-current-curbside-customers",
//     CurbsideCustomerSchema
//   );
// };

// const TodayCurbsideCustomer = (storeId) => {
//   return mongoose.model(
//     storeId + "-today-curbside-customers",
//     CurbsideCustomerSchema
//   );
// };

const OrderPickup = () => {
  return mongoose.model("pickups", OrderPickupSchema);
};

module.exports = {
  OrderPickup,
};
