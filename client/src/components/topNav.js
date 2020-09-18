import React, { useEffect, useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { createBrowserHistory } from "history";
import { Switch, Route, Redirect } from "react-router-dom";

import axios from "axios";
import CurrentPickups from "./currentPickups";
import CompletedPickups from "./completedPickups";
import HomePage from "./home";
import Admin from "./admin";
import Logout from "./logout";
import SignInPage from "./signIn";
import PageNotFound from "./pageNotFound";
import ResetPassword from "./resetPassword"
import ForgotPassword from "./forgotPassword"

const appHistory = createBrowserHistory();

export const AuthContext = React.createContext({});

const Loading = () => {
  return <div></div>;
};

const Auth = ({ children }) => {
  const jwtToken = window.localStorage.jwt;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storeId, setStoreId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");  
  const [userRoleType, setUserRoleType] = useState("");

  useEffect(() => {
    axios({
      url: "api/account/auth",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        authorization: `Bearer ${jwtToken}`
      },
    })
      .then((data) => {
        setIsAuthenticated(true);
        setIsLoading(false);
        setStoreId(data.data.storeId);
        setCompanyId(data.data.companyId);
        setFullName(data.data.fullName);
        setUsername(data.data.username);
        setUserRoleType(data.data.userRoleType);

      })
      .catch((error) => {
        console.log("Token auth error:", error);
        setIsAuthenticated(false);
        setIsLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading,  storeId, userRoleType, companyId, username, fullName }}>
      {children}
    </AuthContext.Provider>
  );
};


const TopNav = (storeId,isAuthenticated,username, userRoleType, companyId, fullName) => {
 
  // Toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon
  const mobileMenuClose = () => {
    document.getElementById("menu-open").checked = false;
  };

  // Refresh the page for these routes so the sse connection doesnt get stale
  const refreshNowPage = () => {
    // const history = useHistory();
    appHistory.push("/current-orders");
    appHistory.go();
    // console.log(window.location.href);
  };
  const refreshTodayPage = () => {
    // const history = useHistory();
    appHistory.push("/completed-orders");
    appHistory.go();
    // console.log(window.location.href);
  };

  const logout = () => {
    localStorage.clear("jwt");
    appHistory.push("/signin");
    appHistory.go();
  };

  const FullNavBar = () => {
    return (
     <div>
     <div className="header">
      <div className="login" onClick={mobileMenuClose}>
        <NavLink
          onClick={logout}
          to="/logout"
          activeClassName="active-nav"
        >
          Logout
        </NavLink>
      </div>
    </div>
    <input type="checkbox" className="menu-open" id="menu-open" />
    <label htmlFor="menu-open" className="icon-toggle">
      <div className="spinner diagonal part-1"></div>
      <div className="spinner horizontal"></div>
      <div className="spinner diagonal part-2"></div>
    </label>
    <div id="menu" onClick={mobileMenuClose}>
      <ul className="sidebarMenuInner">
        <li>
          <NavLink to="/home" activeClassName="active-nav">
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/current-orders"
            activeClassName="active-nav"
            onClick={refreshNowPage}
          >
            Current Orders
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/completed-orders"
            activeClassName="active-nav"
            onClick={refreshTodayPage}
          >
            Completed Orders
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin" activeClassName="active-nav">
            Admin
          </NavLink>
        </li>
      </ul>
    </div>
    </div>
    )
  }

  function AuthenticatedRoute({ component: Component, ...rest }) {
    const { isAuthenticated, isLoading, storeId, userRoleType, companyId, username, fullName } = useContext(AuthContext);
    return (
      <Route
        {...rest}
        render={(props) =>
          (!isLoading) ? (
            isAuthenticated ? (
              <div>
              <FullNavBar/>
              <Component {...props} fullName={fullName} storeId={storeId} username={username} userRoleType={userRoleType} companyId={companyId} />
            </div>
            ) : (
              <Redirect
                push to={{
                  pathname: "/signin",
                  state: { from: props.location },
                }}
              />
            )
          ) : (
            <Loading />
          )
        }
      />
    );
  }


  return  (
    <Auth>
    <Router>
      <Switch>
          <AuthenticatedRoute exact path="/" component={HomePage} fullName={fullName} storeId={storeId} companyId={companyId} userRoleType={userRoleType} username={username} isAuthenticated={isAuthenticated}/>
          <AuthenticatedRoute exact path="/home" component={HomePage} fullName={fullName} storeId={storeId} companyId={companyId} userRoleType={userRoleType} username={username}isAuthenticated={isAuthenticated} />
          <AuthenticatedRoute path="/current-orders" component={CurrentPickups} fullName={fullName} storeId={storeId} companyId={companyId} userRoleType={userRoleType} username={username}isAuthenticated={isAuthenticated}/>
          <AuthenticatedRoute exact path="/completed-orders" component={CompletedPickups} fullName={fullName} storeId={storeId} companyId={companyId} userRoleType={userRoleType} username={username} isAuthenticated={isAuthenticated}/>
          <AuthenticatedRoute exact path="/admin" component={Admin} fullName={fullName} storeId={storeId} companyId={companyId} userRoleType={userRoleType} username={username}isAuthenticated={isAuthenticated}/>
          <AuthenticatedRoute exact path="/logout" component={Logout} fullName={fullName} storeId={storeId} companyId={companyId} userRoleType={userRoleType} username={username}isAuthenticated={isAuthenticated}/>
          <Route exact path="/signin" component={SignInPage} fullName={fullName} storeId={storeId} companyId={companyId} userRoleType={userRoleType} username={username} isAuthenticated={isAuthenticated}/>
          <Route exact path="/reset-password" component={ResetPassword} fullName={fullName} storeId={storeId} companyId={companyId} userRoleType={userRoleType} username={username}isAuthenticated={isAuthenticated}/>
          <Route exact path="/forgot-password" component={ForgotPassword} fullName={fullName} storeId={storeId} companyId={companyId} userRoleType={userRoleType} username={username}isAuthenticated={isAuthenticated}/>
          <AuthenticatedRoute exact path="*" component={PageNotFound} fullName={fullName} storeId={storeId} companyId={companyId} userRoleType={userRoleType} username={username}isAuthenticated={isAuthenticated} />
      </Switch>
    </Router>
    </Auth> 
  );
};

export default TopNav;
