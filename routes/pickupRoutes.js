"use strict";

const express = require("express");
const router = express.Router();

const {
  OrderPickup,
} = require("../models/orderPickupModel");

// const {CompanyInfo} = require("../models/companyInfoModel");
const CompanyInfo = require("../models/companyInfoModel");

// Store ID for the logged in user. This will be dynamic based on user later
const sessionStoreId = 1337;

// Current date helper function
const currentDate = () => {
  var now = new Date;
  var y = now.getFullYear();
  var m = now.getMonth() + 1;
  var d = now.getDate();
  var mm = m < 10 ? "0" + m : m;
  var dd = d < 10 ? "0" + d : d;
  return "" + y + mm + dd;
};

const curbsideData = {
  // old way
  // currentQueueData: "",
  // allDayQueueData: "",
  // new way testing
  nowQueueData: [],
  todayQueueData: [],
};

// Routes
// Current stream old--------------------------------------------------------------------------------------
// router.get("/stream-current/:companyId-:storeId", (req, res) => {
//   console.log("req.get('host');", req.get('host'))
//   const currentSessionStoreId = req.params.storeId;
//   const currentSessionCompanyId = req.params.companyId;
//   console.log("now store id", currentSessionStoreId);
//   res.writeHead(200, {
//     "Content-Type": "text/event-stream",
//     "Cache-Control": "no-cache",
//     "X-Accel-Buffering": "no",
//     Connection: "keep-alive",
//   });
  
//   setInterval(() => {
//     OrderPickup()
//       .find({
//         $or:[ {orderStatus: "submitted"}, {orderStatus: "processing"}],
//         storeId: currentSessionStoreId,
//         companyId: currentSessionCompanyId,
//       })
//       .then((data) => {
//         res.write("data:" + JSON.stringify(data));
//         res.write("\n\n");
//       })
//       .catch((error) => {
//         console.log("Error", error);
//       });
//     // res.write("data:" + JSON.stringify(curbsideData.nowQueueData));
//     // res.write("\n\n");
//     res.flushHeaders();
//   }, 3000);
// });

// Current stream - new polling from app --------------------------------------------------------------------------------------
router.post("/current-orders", (req, res) => {
  //console.log("req.get('host');", req.get('host'))
  let orderData = req.body;
    OrderPickup()
      .find({
        $or:[ {orderStatus: "submitted"}, {orderStatus: "processing"}],
        storeId: orderData.storeId,
        companyId: orderData.companyId,
      })
      .then((data) => {
        res.status(200).send({
          success: true,
          message: orderData.companyId + "_" + orderData.storeId + " current orders",
          data: data
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

// Completed stream url - old --------------------------------------------------------------------------------------
// router.get("/stream-completed/:companyId-:storeId", (req, res) => {
//   const completedSessionStoreId = req.params.storeId;
//   const completedSessionCompanyId = req.params.companyId;
//   res.writeHead(200, {
//     "Content-Type": "text/event-stream",
//     "Cache-Control": "no-cache",
//     "X-Accel-Buffering": "no",
//     Connection: "keep-alive",
//     // enabling CORS
//     // "Access-Control-Allow-Origin": "*",
//     // "Access-Control-Allow-Headers":
//     //   "Origin, X-Requested-With, Content-Type, Accept",
//   });
//   setInterval(() => {
//     OrderPickup()
//       .find({
//         orderStatus: "completed",
//         storeId: completedSessionStoreId,
//         companyId: completedSessionCompanyId,
//         date: currentDate(),
//       })
//       .then((data) => {
//         res.write("data:" + JSON.stringify(data));
//         res.write("\n\n");
//       })
//       .catch((error) => {
//         console.log("Today stream db error:", error);
//       });
//     // res.write("data:" + JSON.stringify(curbsideData.todayQueueData));
//     // res.write("\n\n");
//     res.flushHeaders();
//   }, 3000);
// });

// Completed stream - new polling from app --------------------------------------------------------------------------------------
router.post("/completed-orders", (req, res) => {
  let twelveHoursAgo = Date.now() - 43200000;
  let orderData = req.body;
    OrderPickup()
      .find({
        orderStatus: "completed",
        storeId: orderData.storeId,
        companyId: orderData.companyId,
        orderSubmittedDate: {$gt: twelveHoursAgo} ,
        // date(),
      })
      .then((data) => {
        console.log(data)
        res.status(200).send({
          success: true,
          message: orderData.companyId + "_" + orderData.storeId + " completed orders",
          data: data
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

// Add order - new --------------------------------------------------------------------------------------
router.post("/add-order", (req, res) => {
  // res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  // res.header(
  //   "Access-Control-Allow-Headers",
  //   "Origin, X-Requested-With, Content-Type, Accept"
  // );
  let custData = req.body;
  if (custData.orderId && custData.storeId && custData.companyId) {
    // check if there is already a customer with matching store id / order id. Might change this to lookup on the full day table instead?
    OrderPickup()
      .find({
        orderId: custData.orderId,
        storeId: custData.storeId,
        companyId: custData.companyId
      })
      .then((data) => {
        console.log("data:", data)
        if (data.length == 0) {
          // Need to add in a check first to make sure the record is not already in the current queue collection before adding them to avoid duplicates
          OrderPickup()
            .create({
              name: custData.name,
              storeId: custData.storeId,
              orderId: custData.orderId,
              parkingSpotNum: custData.parkingSpotNum,
              carDescription: custData.carDescription,
              companyId: custData.companyId,
              orderStatus: "submitted",
              orderSubmittedDate: Date.now(),
              // Convert to PST 
              date: (Date.now() - 25200000),
            })
            .then(() => {
              res.status(200).send({
                success: true,
                message: "Order added",
              });
            })
            .catch((error) => {
              res.status(500).send({
                success: false,
                message: error,
              });
            });
        } else {
          res.status(409).send({
            success: false,
            message: "Duplicate order entry",
          });
          console.log("Duplicate order entry");
        }
      })
      .catch((error) => {
        console.log("Error", error);
        res.status(500).send({
          success: false,
          message: error,
        });
      });
  } else {
    res.status(422).send({
      success: false,
      message: "Missing add order info",
    });
  }
});

// Order completed - new --------------------------------------------------------------------------------------
router.post("/order-complete", (req, res) => {
  const removeCustomerStoreId = req.params.id;
  let clerkName = req.body.clerkName
  let data = req.body;
  OrderPickup().findOneAndUpdate(
    {
      _id: data.id,
    },
    {
      $set: {
        orderStatus: "completed",
        clerkNameCompleted: clerkName,
         orderCompletedDate: Date.now(),
      },
    })
    .then((data) => {
      res.status(200).send({
        success: true,
        message: "Order has been completed",
      });
    })
    .catch((error) => {
      res.status(500).send({
        success: false,
        message: error,
      });
    })
});



// Order processing - new --------------------------------------------------------------------------------------
router.post("/order-processing", (req, res) => {
  let data = req.body;
  let clerkName = req.body.clerkName
  let username = req.body.username
  OrderPickup().findOneAndUpdate(
    {
      _id: data.id,
    },
    {
      $set: {
        orderStatus: "processing",
        clerkNameProcessing: clerkName,
        usernameProcessing: username
      },
    })
    .then((data) => {
      res.status(200).send({
        success: true,
        message: "Order processing",
      });
    })
    .catch((error) => {
      res.status(500).send({
        success: false,
        message: error,
      });
    })
});

// Stop Order processing - new -- --------------------------------------------------------------------------------------
router.post("/stop-order-processing", (req, res) => {
  let data = req.body;
  OrderPickup().findOneAndUpdate(
    {
      _id: data.id,
    },
    {
      $set: {
        orderStatus: "submitted",
        clerkNameProcessing: "",
        usernameProcessing: ""
      },
    })
    .then((data) => {
      res.status(200).send({
        success: true,
        message: "Order stopped processing",
      });
    })
    .catch((error) => {
      res.status(500).send({
        success: false,
        message: error,
      });
    })
});

// Order back to submitted - new --------------------------------------------------------------------------------------

router.post("/order-completed-undo", (req, res) => {
  // res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  // res.header(
  //   "Access-Control-Allow-Headers",
  //   "Origin, X-Requested-With, Content-Type, Accept"
  // );
  let custData = req.body;
  if (custData.orderId) {
    OrderPickup().findOneAndUpdate(
      {
        _id: custData.mongoId,
      },
      {
        $set: {
          orderStatus: "submitted",
        },
      })
      .then(() => {
        console.log("Order has been reverted back to submitted");
        res.status(200).send({
          success: true,
          message: "Order reverted back to submitted",
        });
      })
      .catch((error) => {
        res.status(500).send({
          success: false,
          message: error,
        });
      });
  }
});

router.post("/table-columns", (req, res) => {
  // res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  // res.header(
  //   "Access-Control-Allow-Headers",
  //   "Origin, X-Requested-With, Content-Type, Accept"
  // );
  let custData = req.body;
  CompanyInfo
  .find({ companyId: custData.companyId })
      .then((data) => {
        console.log("table column data:", data)
        if (data.length == 0) {
          console.log("No matching comapnyId")
          res.status(404).send({
            success: false,
            message: "No matching comapnyId",
          });
        } else {
          res.status(200).send({
            success: true,
            message: "CompanyId found",
            data: data
          });
        }
      })
      .catch((error) => {
        res.status(500).send({
          success: false,
          message: error,
        });
      });  
});

// Add order - new --------------------------------------------------------------------------------------
router.post("/add-order", (req, res) => {
  // res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  // res.header(
  //   "Access-Control-Allow-Headers",
  //   "Origin, X-Requested-With, Content-Type, Accept"
  // );
  let custData = req.body;
  console.log("customer added:", custData);
  if (custData.orderId) {
    // check if there is already a customer with matching store id / order id. Might change this to lookup on the full day table instead?
    OrderPickup()
      .find({
        orderId: custData.orderId,
        storeId: custData.storeId,
        companyId: custData.companyId
      })
      .then((data) => {
        if (data.length == 0) {
          // Need to add in a check first to make sure the record is not already in the current queue collection before adding them to avoid duplicates
          OrderPickup()
            .create({
              name: custData.name,
              storeId: custData.storeId,
              orderId: custData.orderId,
              parkingSpotNum: custData.parkingSpotNum,
              carDescription: custData.carDescription,
              companyId: custData.companyId,
              orderStatus: "submitted",
              date: Date.now(),
            })
            .then(() => {
              res.status(200).send({
                success: true,
                message: "Order added",
              });
            })
            .catch((error) => {
              res.status(500).send({
                success: false,
                message: error,
              });
            });
        } else {
          res.status(409).send({
            success: false,
            message: "Duplicate order entry",
          });
          console.log("Duplicate order entry");
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

module.exports = router;
