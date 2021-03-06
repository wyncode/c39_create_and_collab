import React from 'react';
import { AppContextProvider } from './context/AppContext';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Events from './pages/Events';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Messaging from './pages/Messaging';
import PrivateRoute from './components/PrivateRoute';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import UpdatePassword from './pages/UpdatePassword';
import Welcome from './pages/Welcome';
import UserEditPage from './pages/EditUser';
import PortfolioEditPage from './pages/EditPortfolio';
import PersonalMessaging from './pages/PersonalMessaging';
import EventsForm from './helper/EventsForm';
import JobsForm from './helper/JobsForm';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Images from './pages/Images';

function App() {
  return (
    <AppContextProvider>
      <BrowserRouter>
        <Switch>
          <Route exact path="/events" component={Events} />
          <Route exact path="/home" component={Home} />
          <PrivateRoute exact path="/jobs" component={Jobs} />
          <PrivateRoute exact path="/profile/:id" component={Profile} />
          <PrivateRoute exact path="/gallery/images/:id" component={Images} />
          <PrivateRoute exact path="/messages/" component={Messaging} />
          <PrivateRoute
            exact
            path="/messages/:id"
            component={PersonalMessaging}
          />
          <Route exact path="/reset-password" component={ResetPassword} />
          <Route exact path="/update-password" component={UpdatePassword} />
          <Route exact path="/" component={Welcome} />
          <PrivateRoute exact path="/user-edit-page" component={UserEditPage} />
          <PrivateRoute
            exact
            path="/messages/:id"
            component={PersonalMessaging}
          />
          <PrivateRoute exact path="/jobs-form" component={JobsForm} />
          <Route exact path="/events-form" component={EventsForm} />
          <Route exact path="/reset-password" component={ResetPassword} />
          <Route exact path="/update-password" component={UpdatePassword} />
          <Route exact path="/" component={Welcome} />
          <Route exact path="/user-edit-page" component={UserEditPage} />
          <Route exact path="/portfolio-edit" component={PortfolioEditPage} />
        </Switch>
      </BrowserRouter>
    </AppContextProvider>
  );
}

export default App;
