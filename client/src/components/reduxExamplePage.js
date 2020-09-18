import React, { useEffect } from "react";
import axios from "axios";
import Loader from "react-loader-spinner";
import { nowCustomerAction } from '../reducers/customerReducers' 
import { useSelector, useDispatch } from 'react-redux'

const storeInfo = {
  storeId : "1337"
}

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

const Admin = (props) => {
  const dispatch = useDispatch()
  const nowCustomerData = useSelector(state => state.customerInfo) 
  const state = useSelector(state => state);
  console.log("state", JSON.stringify(state))
  console.log("state.storestatus", JSON.stringify(state.storeStatus.status))
  //const nowCustomerData = useSelector(state => state.filter(custData => custData.nowCustomerContent)) 
 // console.log("nowCustomerData",nowCustomerData)

  // const [nowCustomerData, setNowCustomerData] = useState([]);
  // const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      // for local docker: 
      if(window.location.hostname === '127.0.0.1') {
        const windowUrl = "http://localhost:3000/api/stream-now/" + storeInfo.storeId;
        let eventSource = new EventSource(windowUrl);
         // eventSource.onmessage = e => updateCustomerList(JSON.parse(e.data))
        eventSource.onmessage = (e) => updateCustomerList(JSON.parse(e.data));
      } else {
        const windowUrl = "https://" + window.location.hostname + "/api/stream-now/" + storeInfo.storeId;
        let eventSource = new EventSource(windowUrl);
         // eventSource.onmessage = e => updateCustomerList(JSON.parse(e.data))
        eventSource.onmessage = (e) => updateCustomerList(JSON.parse(e.data));
      }
    } else {
      const windowUrl = "http://localhost:8080/api/stream-now/" + storeInfo.storeId;
      let eventSource = new EventSource(windowUrl);
      // eventSource.onmessage = e => updateCustomerList(JSON.parse(e.data))
      eventSource.onmessage = (e) => updateCustomerList(JSON.parse(e.data));
    }
  }, []);

  const updateCustomerList = (customers) => {
   // dispatch(nowCustomerAction(customers))
    // setNowCustomerData([...customers]);
  };
  const nowCustomerData2 = useSelector(state => state)
  //console.log("nowCustomerData2",JSON.stringify(nowCustomerData2))

  //const dataName = useSelector(state => state.filter(custData => custData.content)) 
  const dataName = useSelector(state => state) 
  //console.log("dataName:", JSON.stringify(dataName))

  console.log("testing")

  function orderPickedUp(e) {
    let displayOrderId = e.target.parentNode.parentNode.id;
    if (
      window.confirm(
        "Confirm that order # " +
          displayOrderId +
          " has picked up their order and can be removed."
      )
    ) {
      let payload = {
        id: e.target.id,
      };
      //setLoading(true);
      axios({
        url: "/api/removeCustomer",
        method: "POST",
        data: payload,
      })
        .then(() => {
          console.log("Customer has been removed");
          setTimeout(function () {
            //setLoading(false);
          }, 1000);
        })
        .catch(() => {
          console.log("Internal server error");
        });
    }
  }
  // dataName: {"customerInfo":[{"nowCustomerContent":[{"_id":"5eb302d7e0acde7ce8637e8c","name":"StreamTest1","storeId":"1337","orderId":"101","parkingSpotNum":"1a","carDescription":"Blue Jeep","date":"20200506","__v":0}]}],"loginInfo":[],"storeStatus":[{"storeStatus":false}]}

  const renderLoadingBar = () => {
    if (nowCustomerData.length === 0) {
      return (
        <div>
          <LoadingBar color="#dddddd" />
        </div>
      );
    } else {
      return (
        // table container
        <div>
        {nowCustomerData[0]["nowCustomerContent"].map((p) => (
        <div id={p.orderId} key={p._id} className="table-container col-5">
            <div className="table-item-header header-01"><p>Name</p></div>
            <div className="table-item-header header-02"><p>Order #</p></div>
            <div className="table-item-header header-03"><p>Parking Spot&nbsp;#</p></div>
            <div className="table-item-header header-04"><p>Car Description</p></div>
            <div className="table-item-header header-05"><p>Order Picked Up?</p></div>
        
            <div className="table-item table-item-01"><p>{p.name}</p></div>
            <div className="table-item table-item-02"><p>{p.orderId}</p></div>
            <div className="table-item table-item-03"><p>{p.parkingSpotNum}</p></div>
            <div className="table-item table-item-04"><p>{p.carDescription}</p></div>
            <div className="table-item table-item-05"><button id={p._id} onClick={orderPickedUp} className="btn-pickedup">Submit</button></div>   
        </div>
         ))}
         </div>
      );
    }
  };

  return (
    <div>
      <main>
      <h1>Curbside Pickup Store #%%1337%%</h1>
        <p>Real time updates as customers are outside your&nbsp;store.</p>
        <button className="btn-pause">Pause curbside app for this store</button>
      <div>{renderLoadingBar()}</div>
      </main>    
    </div>
  );
};

export default Admin;

