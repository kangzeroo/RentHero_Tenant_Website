import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import {
  browserHistory,
  Router,
  Route,
} from 'react-router'
import Store from './store'
// import 'semantic-ui-css/semantic.min.css'
import AppRoot from './components/AppRoot'

ReactDOM.render(
  <Provider store={Store}>
    <Router history={browserHistory}>
      <Route path='/' component={AppRoot} />
      <Route path='*' component={AppRoot} />
    </Router>
  </Provider>
  , document.getElementById('root'))
