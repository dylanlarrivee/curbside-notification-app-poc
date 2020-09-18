import React, { useState, useEffect } from "react";
import axios from "axios";
import Loader from "react-loader-spinner";

// const storeInfo = {
//   storeId: "1337",
//   storeStatus: true,
// };

const HomePage = (props) => { 
  const [storeStatus, setStoreStatus] = useState("");
  const [storeStatusLoading, setStoreStatusLoading] = useState(false);

  const homeStoreId = props.storeId
  const companyId = props.companyId

  

  useEffect(() => {
    let payload = {
      storeId: homeStoreId,
      companyId: companyId
    };
    if (homeStoreId && companyId) {
      axios({
        url: "/api/get-store-status",
        method: "POST",
        data: payload,
      })
        .then((data) => {
          console.log(
            "data.data.storeStatusPayload",
            JSON.stringify(data.data.storeStatusPayload)
          );
          updateStoreStatus(data.data.storeStatusPayload);
        })
        .catch((error) => {
          console.log("getStoreStatus: Internal server error");
        });
    }
  }, [homeStoreId, companyId]);

  const updateStoreStatus = (updatedStoreStatus) => {
    setStoreStatus(updatedStoreStatus);
    setStoreStatusLoading(true);
  };

  function changeStoreStatus(e) {
    let payload = {
      storeStatus: !storeStatus,
      storeId: homeStoreId,
      companyId: companyId
    };
    axios({
      url: "/api/update-store-status/",
      method: "POST",
      data: payload,
    })
      .then((data) => {
        console.log("Store status has been updated");
        setStoreStatus(payload.storeStatus);
      })
      .catch((error) => {
        console.log("changeStoreStatus: Internal server error");
        // Put an alert to notify if there was an error
      });
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

  const pauseButtonType = () => {
    if (storeStatus) {
      return (
        <div>
          <button onClick={changeStoreStatus} className="btn-pause">
            Pause curbside app for this store
          </button>
        </div>
      );
    } else {
      return (
        <div>
          <button onClick={changeStoreStatus} className="btn-resume">
            Resume curbside app for this store
          </button>
        </div>
      );
    }
  };

  const renderLoadingBar = () => {
    if (storeStatusLoading) {
      return <div>{pauseButtonType()}</div>;
    } else {
      return (
        // table container
        <div>
          <LoadingBar color="#dddddd" />
        </div>
      );
    }
  };


  return (
    <div>
      <main>
        <h1>Curbside Pickup Store #{props.storeId}</h1>
        <p>Real time updates as customers are outside your&nbsp;store.</p>
        <div>{renderLoadingBar()}</div>
      </main>
    </div>
  );
};

export default HomePage;
