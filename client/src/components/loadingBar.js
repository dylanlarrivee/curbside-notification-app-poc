import React from "react";
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


  export default LoadingBar;