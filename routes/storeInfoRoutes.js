"use strict";
const express = require("express");
const router = express.Router();

// const storeStatusData = {
//     storeStatus:true
// }

// const {
//   StoreInfo
// } = require("../models/storeStatusModel");
const StoreInfo = require("../models/storeInfoModel");

router.post("/get-store-status", (req, res) => {
  const storeStatusStoreId = req.body.storeId;
  const storeStatuscompanyId = req.body.companyId;
  console.log("storeStatuscompanyId", storeStatuscompanyId)
    console.log("get-store-status");
    StoreInfo
        .find({
          storeId: storeStatusStoreId,
          companyId:storeStatuscompanyId
         })
        .then((data) => {
          console.log("data:", data)   
          let storeStatusPayload = data[0].storeStatus;
          if (data.length !==0) {
            res.status(200).send({storeStatusPayload})
            console.log("found store data:", data[0].storeStatus)
          } else {
            //TODO add error message that the store is not valid
          }
        })
        .catch((error) => {
          res.status(500).send({getStoreErrorMessage:error}) 
          console.log("Error", error);
        });
  });

  router.post("/add-store-table/:id", (req, res) => {
    const storeStatusStoreId = req.params.id;
      StoreInfo
        .create({
          storeId: "1337",
          storeStatus: true
        })
        .then((data) => {
          res.status(200).send({
          storeId: storeStatusStoreId,
          storeStatus: true
        }) })
        .catch((error) => {
          res.status(500).send({addStoreErrorMessage:error}) 
          console.log("Error", error);
        });
  
    });


  // update this part
  router.post("/update-store-status/", (req, res) => {
    const updateStoreStatusStoreId = req.body.storeId;
    const updatedStoreStatusData = req.body;
    console.log("updatedStoreStatusData", updatedStoreStatusData)
    StoreInfo
        .findOneAndUpdate({
          storeId: req.body.storeId,
          companyId: req.body.companyId
        },{storeStatus:req.body.storeStatus}, { upsert: false })
        .then((data) => {
          console.log("updated:", data)
          res.status(200).send({
           success: "store status updated",
           storeId: updateStoreStatusStoreId,
           storeStatus: updatedStoreStatusData
          }) 
        })
        .catch((error) => {
          res.status(500).send({updateStoreErrorMessage:error}) 
          console.log("Error", error);
        });

  });

  module.exports = router;