import React, { useState, useEffect } from "react";
import axios from "axios";
import Loader from "react-loader-spinner";


// Build out a component for the counter
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

const StatusColumn = (props) => {
  console.log("xcompletedCustomerDat:", props.completedCustomerData)
  function addBackToQueue(e) {
    let displayOrderId = props.p.orderId;
    let mongoId = e.target.id;

    if (
      window.confirm(
        "Confirm that order # " +
          displayOrderId +
          " should be added back to the current pickups queue?"
      )
    ) {
      let payload = {
        mongoId: mongoId,
        orderId: displayOrderId,
      };
      props.setLoading(true)
      axios({
        url: "/api/order-completed-undo/",
        method: "POST",
        data: payload,
      })
        .then(() => {
          console.log("Customer has been added back to the current pickups queue");
          let completeOrderFindIndex = (element) => element._id == mongoId;
          let deleteOrderIndex = props.completedCustomerData.findIndex(completeOrderFindIndex);
          let tempCompletedOrders = props.completedCustomerData;
          tempCompletedOrders.splice(deleteOrderIndex, 1);
          props.setCompletedCustomerData([...tempCompletedOrders]);


          // setTimeout(function () {
          //   props.setLoading(false);
          // }, 3000);
        })
        .catch((error) => {
          console.log("Internal server error:", error);
          setTimeout(function () {
            props.setLoading(false);
          }, 3000);
          window.confirm(
            "Internal system error. Record could not be added back. Please try again."
          )
        });
    }
  }
  if (props.value === "jobStatus") {
    return (
      <div className="table-item table-item-05">
                <button id={props.p._id}
                  onClick={addBackToQueue} 
                  className="btn-pickedup">Undo Pickup</button>
                <p className="job-status-comment">Job completed by {props.p.clerkNameCompleted}</p>
              </div>
    )
  } else {
    return (
      <div key={"table_" + props.value} className={"table-item table-item-0" + props.index}>
        <p>{props.p[props.value]}</p>
      </div>
    )
  }
  }

const CompletedPickups = (props) => {
  const setIntervalTime = 3000

  const [completedCustomerData, setCompletedCustomerData] = useState([]);
  const [Loading, setLoading] = useState(false);
  const [pageHasLoaded, setPageHasLoaded] = useState(false);
  const [tableColumnHasLoaded, setTableColumnHasLoaded] = useState(false);
  const [completedColumnIdsArray, setCompletedColumnIdsArray] = useState("");
  const [completedColumnCopy, setCompletedColumnCopy] = useState({});

  const completedFullName = props.fullName
  const completedStoreId = props.storeId
  const completedCompanyId = props.companyId
  const completedUsername = props.username

  useEffect(() => {
   if (completedCompanyId && completedStoreId) {
    let payload = {
      companyId: completedCompanyId
    }
    axios({
      url: "/api/table-columns",
      method: "POST",
      data: payload,
    })
      .then((data) => {
        setCompletedColumnIdsArray(data.data.data[0].tableColumnIds);
        setCompletedColumnCopy(data.data.data[0].tableColumnCopy);
        setTableColumnHasLoaded(true) 
      })
      .catch(() => {
        console.log("Internal server error");
      }); 
    
    if (process.env.NODE_ENV === "production") {
      // for local docker:
      if (window.location.hostname === "127.0.0.1") {
        let getCompletedOrders = () => {
          let url = "http://localhost:3000/api/completed-orders"; 
          let payload = 
              {storeId: completedStoreId,
              companyId: completedCompanyId};
          axios({
          url: url,
          method: "POST",
          data: payload,
          })
          .then((data) => {
            if (window.location.pathname === "/completed-orders") {
              let compCustData = data.data.data;
                  compCustData.sort(function(a, b) {
                      a = new Date(a.orderCompletedDate);
                      b = new Date(b.orderCompletedDate);
                      return a>b ? -1 : a<b ? 1 : 0;
                  });
              setCompletedCustomerData([...compCustData]);
              setPageHasLoaded(true);
            }  else {
              clearInterval(completeInterval);
            }
          })
          .catch((error) => {
          console.log("getOrdersError: Internal server error:", error);
          });                                   
          }
          getCompletedOrders();
        let completeInterval = setInterval(getCompletedOrders, setIntervalTime);
      } else {
        let getCompletedOrders = () => {
          let url = "https://" + window.location.hostname + "/api/completed-orders";
          let payload = 
              {storeId: completedStoreId,
              companyId: completedCompanyId};
          axios({
          url: url,
          method: "POST",
          data: payload,
          })
          .then((data) => {
            if (window.location.pathname === "/completed-orders") {
              let compCustData = data.data.data;
                  compCustData.sort(function(a, b) {
                      a = new Date(a.orderCompletedDate);
                      b = new Date(b.orderCompletedDate);
                      return a>b ? -1 : a<b ? 1 : 0;
                  });
              setCompletedCustomerData([...compCustData]);
              setPageHasLoaded(true);
            }  else {
              clearInterval(completeInterval);
            }
          })
          .catch((error) => {
          console.log("getOrdersError: Internal server error:", error);
          });                                   
          }
          getCompletedOrders();
        let completeInterval = setInterval(getCompletedOrders, setIntervalTime);
      }
    } else {
        let getCompletedOrders = () => {
          let url = "http://localhost:8080/api/completed-orders";  
          let payload = 
              {storeId: completedStoreId,
              companyId: completedCompanyId};
          axios({
          url: url,
          method: "POST",
          data: payload,
          })
          .then((data) => {
            if (window.location.pathname === "/completed-orders") {  
              console.log("data.data.data", data.data.data)      
              let compCustData = data.data.data;
                  compCustData.sort(function(a, b) {
                      a = new Date(a.orderCompletedDate);
                      b = new Date(b.orderCompletedDate);
                      return a>b ? -1 : a<b ? 1 : 0;
                  });
              setCompletedCustomerData([...compCustData]);
              setPageHasLoaded(true);
            }  else {
              clearInterval(completeInterval);
            }
          })
          .catch((error) => {
          console.log("getOrdersError: Internal server error:", error);
          });                                  
          }
          getCompletedOrders();
       let completeInterval = setInterval(getCompletedOrders, setIntervalTime);
    }
  }
  }, [completedCompanyId, completedStoreId]);

  // const updateCustomerList = (customers) => {
  //   setCompletedCustomerData([...customers]);
  // };

  const renderLoadingBar = () => {
    if (completedCustomerData.length === 0 && pageHasLoaded) {
      return (
        <div className="no-customer-que">
          No customers currently in the que
        </div>
        );
    } else if (completedCustomerData.length === 0 && !pageHasLoaded) {
      return (
        <div>
        <LoadingBar color="#dddddd" />
      </div>
      );
    } else if (Loading || !tableColumnHasLoaded) {
      return (
        <div>
        <LoadingBar color="#dddddd" />
      </div>
      );
    } else {
      return (
        // table container
        <div>
        {completedCustomerData.map((p) => (
          <div id={p._id} key={p._id} className="table-container col-5">
           {completedColumnIdsArray.map((value, index) =>
              <div key={"header_" + index+1} className={"table-item-header header-0" + index}>
                <p>{completedColumnCopy[value]}</p>
              </div>
              )} 
              {completedColumnIdsArray.map((value, index) =>
                <StatusColumn key={value} p={p} setLoading={setLoading} columnAmount={index} value={value} index={index} completedCustomerData={completedCustomerData} setCompletedCustomerData={setCompletedCustomerData}/>
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
        <h2>Clerk Name: <span className="clerk-color">{props.fullName}</span></h2>
        <h2>Username: <span className="clerk-color">{props.username}</span></h2>
        <p>These are all the customers that have completed their order pickup in the past 12 hours.</p>
        <p>Click to add them back to the current pickups queue if needed.</p>
        <br />
        <div>
        <div>{renderLoadingBar()}</div>
        </div>
      </main>
    </div>
  );
};

export default CompletedPickups;
