import React, { useState, useEffect } from "react";
import axios from "axios";
import Loader from "react-loader-spinner";

// Build out a component for the loding bar
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
// Populate the Job Status column
const StatusColumn = (props) => {
  function orderProcessing(e) {
    let displayOrderId = props.p.orderId;
    let mongoId = e.target.parentNode.parentNode.id;
    //let displayOrderId = e.target.parentNode.parentNode.id;
    if (
      window.confirm(
        "Confirm that you are ready to process order # " +
          displayOrderId
      )
    ) {
      let payload = {
        id: e.target.parentNode.parentNode.id,
        clerkName: props.fullName,
        username: props.username

      };
      props.setLoading(true);
      axios({
        url: "/api/order-processing",
        method: "POST",
        data: payload,
      })
        .then(() => {
          let completeOrderFindIndex = (element) => element._id === mongoId;
          let deleteOrderIndex = props.currentCustomerData.findIndex(completeOrderFindIndex);
          let tempProcessingOrders = props.currentCustomerData;
          tempProcessingOrders[deleteOrderIndex].usernameProcessing = props.username
          tempProcessingOrders[deleteOrderIndex].orderStatus = "processing";
          props.setCurrentCustomerData([...tempProcessingOrders]);
          // setTimeout(function() { props.setLoading(false); }, 2000);
          props.setLoading(false);
        })
        .catch(() => {
          console.log("Internal server error");
          props.setLoading(false);
          // setTimeout(function () {
          //   props.setLoading(false);
          // }, 3000);
          window.confirm(
            "Internal system error. Record could not be deleted. Please try again."
          )
        });
    }
  }

  function stopOrderProcessing(e) {
    let displayOrderId = props.p.orderId;
    let mongoId = e.target.parentNode.parentNode.id;
    if (
      window.confirm(
        "Confirm that you want to stop processing order # " +
          displayOrderId
      )
    ) {
      let payload = {
        id: e.target.parentNode.parentNode.id,
        clerkName: props.fullName,
        username: props.username

      };
      props.setLoading(true);
      axios({
        url: "/api/stop-order-processing",
        method: "POST",
        data: payload,
      })
        .then(() => {
          let completeOrderFindIndex = (element) => element._id === mongoId;
          let deleteOrderIndex = props.currentCustomerData.findIndex(completeOrderFindIndex);
          let tempStopOrders = props.currentCustomerData;
          tempStopOrders[deleteOrderIndex].orderStatus = "submitted";
          props.setCurrentCustomerData([...tempStopOrders]);
          props.setLoading(false);
        })
        .catch(() => {
          console.log("Internal server error");
          props.setLoading(false);
          // setTimeout(function () {
          //   props.setLoading(false);
          // }, 3000);
          window.confirm(
            "Internal system error. Record could not be deleted. Please try again."
          )
        });
    }
  }

  function completeOrderProcesssing(e) {
    let displayOrderId = props.p.orderId;
    let mongoId = e.target.parentNode.parentNode.id;
    if (
      window.confirm(
        "Confirm that order # " +
          displayOrderId +
          " has picked up their order and can be removed."
      )
    ) {
      let payload = {
        id: mongoId,
        clerkName: props.username
      };
      props.setLoading(true);
      axios({
        url: "/api/order-complete/",
        method: "POST",
        data: payload,
      })
        .then(() => {
          let completeOrderFindIndex = (element) => element._id === mongoId;
          let deleteOrderIndex = props.currentCustomerData.findIndex(completeOrderFindIndex);
          let tempCompletedOrders = props.currentCustomerData;
          tempCompletedOrders.splice(deleteOrderIndex, 1);
          props.setCurrentCustomerData([...tempCompletedOrders]);
          props.setLoading(false);
          // setTimeout(function () {
          //   props.setLoading(false);
          // }, 3000);
        })
        .catch(() => {
          console.log("Internal server error");
          props.setLoading(false);
          // setTimeout(function () {
          //   props.setLoading(false);
          // }, 3000);
          window.confirm(
            "Internal system error. Record could not be updated to completed. Please try again."
          )
        });
    }
  }
  const columnClass = "table-item table-item-0" + props.columnAmount
  
if (props.value === "jobStatus") {
  if (props.p.orderStatus === "submitted") {
    return (
      <div key={"table_" + props.value} className={columnClass}>
        <button id={props.p._id}
            onClick={orderProcessing}
            className="btn-start">Start</button>
        <button id={props.p._id}
            onClick={completeOrderProcesssing}
            className="btn-complete">Complete</button>
    </div>
    )
  } else if (props.p.orderStatus === "processing") {
    if(props.username === props.p.usernameProcessing) {
      return (
        <div key={"table_" + props.value} className={columnClass}>
          <button onClick={stopOrderProcessing} className="btn-stop">Stop</button>
          <button id={props.p._id}
              onClick={completeOrderProcesssing}
              className="btn-complete">Complete</button>
              <p className="job-status-comment">You are working on this job.</p>
        </div>
    )
    } else {
      return (
        <div key={"table_" + props.value} className={columnClass}>
          <button className="btn-started">Started</button>
          <button id={props.p._id}
              onClick={completeOrderProcesssing}
              className="btn-complete">Complete</button>
              <p className="job-status-comment">{props.p.usernameProcessing} is working on this job.</p>
        </div>
    )
    }
    
  }
} else {
  return (
    <div key={"table_" + props.value} className={"table-item table-item-0" + props.index}>
      <p>{props.p[props.value]}</p>
    </div>
  )
}
}

const CurrentPickups = (props) => {

  const setIntervalTime = 3000
  
  // Notification.requestPermission()
  // console.log("notification updates")

  const [currentCustomerData, setCurrentCustomerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageHasLoaded, setPageHasLoaded] = useState(false);
  const [currentColumnIdsArray, setCurrentColumnIdsArray] = useState([]);
  const [currentColumnCopy, setCurrentColumnCopy] = useState({});

  // const [currentCustomerCount, setCurrentCustomerCount] = useState(0);

  const currentQueue = {
    count:0
  }
  // const curStreamData = {
  //   firstLoad:false
  // }

  const currentFullName = props.fullName
  const currentStoreId = props.storeId
  const currentCompanyId = props.companyId
  const currentUsername = props.username

  useEffect(() => {
    if (currentCompanyId && currentStoreId) {
      let payload = {
        companyId: currentCompanyId
      }
      axios({
        url: "/api/table-columns",
        method: "POST",
        data: payload,
      })
        .then((data) => {
          setCurrentColumnIdsArray(data.data.data[0].tableColumnIds);
          setCurrentColumnCopy(data.data.data[0].tableColumnCopy); 
        })
        .catch((error) => {
          console.log("Internal server error:", error);
        });
        
        if (process.env.NODE_ENV === "production") {
          // for local docker:
          if (window.location.hostname === "127.0.0.1") {
            let getCurrentOrders = () => {
              let url = "http://localhost:3000/api/current-orders";    
              let payload = 
                  {storeId: currentStoreId,
                  companyId: currentCompanyId};
              axios({
              url: url,
              method: "POST",
              data: payload,
              })
              .then((data) => {
                if (window.location.pathname === "/current-orders") {
                  let curCustData = data.data.data;
                  curCustData.sort(function(a, b) {
                      a = new Date(a.orderSubmittedDate);
                      b = new Date(b.orderSubmittedDate);
                      return b>a ? -1 : b<a ? 1 : 0;
                  });
                  setCurrentCustomerData([...curCustData]);
                  setPageHasLoaded(true);
                  if (currentQueue.count < curCustData.length) {
                    new Notification('There are customers in your queue')
                  }
                  let queueCount = curCustData.length
                  currentQueue.count = queueCount
                }  else {
                  clearInterval(currentInterval);
                }

              })
              .catch((error) => {
              console.log("getOrdersError: Internal server error:", error);
              });
            }
            getCurrentOrders();  
            let currentInterval = setInterval(getCurrentOrders, setIntervalTime);
          } else {
            let getCurrentOrders = () => {
              let url = "https://" + window.location.hostname + "/api/current-orders";  
              let payload = 
                  {storeId: currentStoreId,
                  companyId: currentCompanyId};
              axios({
              url: url,
              method: "POST",
              data: payload,
              })
              .then((data) => {
                if (window.location.pathname === "/current-orders") {
                  let curCustData = data.data.data;
                  curCustData.sort(function(a, b) {
                      a = new Date(a.orderSubmittedDate);
                      b = new Date(b.orderSubmittedDate);
                      return b>a ? -1 : b<a ? 1 : 0;
                  });
                  setCurrentCustomerData([...curCustData]);
                  setPageHasLoaded(true);
                  if (currentQueue.count < curCustData.length) {
                    new Notification('There are customers in your queue')
                  }
                  let queueCount = curCustData.length
                  currentQueue.count = queueCount
                }  else {
                  clearInterval(currentInterval);
                }
              })
              .catch((error) => {
              console.log("getOrdersError: Internal server error:", error);
              });
            }
            getCurrentOrders();  
            let currentInterval = setInterval(getCurrentOrders, setIntervalTime);
          }
      } 
        else {
          let getCurrentOrders = () => {
              console.log("running")
              let url = "http://localhost:8080/api/current-orders";  
              let payload = 
                  {storeId: currentStoreId,
                  companyId: currentCompanyId};
              axios({
              url: url,
              method: "POST",
              data: payload,
              })
              .then((data) => {
                if (window.location.pathname === "/current-orders") {
                  let curCustData = data.data.data;
                  curCustData.sort(function(a, b) {
                      a = new Date(a.orderSubmittedDate);
                      b = new Date(b.orderSubmittedDate);
                      return b>a ? -1 : b<a ? 1 : 0;
                  });
                  setCurrentCustomerData([...curCustData]);
                  setPageHasLoaded(true);
                  if (currentQueue.count < curCustData.length) {
                    new Notification('There are customers in your queue')
                  }
                  let queueCount = curCustData.length
                  currentQueue.count = queueCount
                }  else {
                  clearInterval(currentInterval);
                }
              })
              .catch((error) => {
              console.log("getOrdersError: Internal server error:", error);
              });
            }
            getCurrentOrders();  
          let currentInterval = setInterval(getCurrentOrders, setIntervalTime);
          }
    }
  }, [currentCompanyId, currentStoreId]);

  const renderLoadingBar = () => {  
    if (currentCustomerData.length === 0 && pageHasLoaded) {
      return (
        <div className="no-customer-que">
          No customers currently in the que
        </div>
        );
    } else if (currentCustomerData.length === 0 && !pageHasLoaded) {
      return (
        <div>
        <LoadingBar color="#dddddd" />
      </div>
      );
    } else if (loading) {
      return (
        <div>
        <LoadingBar color="#dddddd" />
      </div>
      );
    } else {
      return (
        // table container
        <div>
          {currentCustomerData.map((p) => (
            <div id={p._id} key={p._id} className="table-container col-5">
             {currentColumnIdsArray.map((value, index) =>
                <div key={"header_" + index+1} className={"table-item-header header-0" + index}>
                  <p>{currentColumnCopy[value]}</p>
                </div>
                )} 
                {currentColumnIdsArray.map((value, index) =>
                  <StatusColumn key={value} p={p} setLoading={setLoading} columnAmount={index} value={value} index={index} fullName={currentFullName} username={currentUsername} currentCustomerData={currentCustomerData} setCurrentCustomerData={setCurrentCustomerData} />
              )} 
            </div>
          ))}
        </div>
      );
    }
  };

  

  return (
    <div>
      <main>
        <h1>Curbside Pickup Store #{props.storeId}</h1>
        <h2>Clerk Name: <span className="clerk-color">{currentFullName}</span></h2>
        <h2>Username: <span className="clerk-color">{currentUsername}</span></h2>
        <p >Real time updates as customers are outside your&nbsp;store.</p>
        <br />
        <div>{renderLoadingBar()}</div>
      </main>
    </div>
  );
};

export default CurrentPickups;
