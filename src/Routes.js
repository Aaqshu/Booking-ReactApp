import React from "react";
import './App.css';
import Booking from './component/Booking';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  withRouter
} from "react-router-dom";
import PaymentPage from "./component/PaymentPage";
import UserNotFound from "./component/UserNotFound";

class Routes extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
            <Route  path="/payment" component={PaymentPage} />
          <Route path="booking/:username" component={Booking} />
            <Route path="/user-not-found" component={UserNotFound} />
            <Route path="/" component={Booking} />  
            
        </Switch>
      </Router>
    );
  }
 
}

export default Routes;
