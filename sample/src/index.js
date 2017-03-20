import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { Provider } from 'react-redux'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import {
  configureDatatableReducer,
  GroupsConfigurator,
  GroupableDatatable
} from '../../src'

import tables from './config'

import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

const datatableReducer = configureDatatableReducer({
  namespace: 'datatable',
  tables
})

const store = createStore(
  combineReducers({
    datatable: datatableReducer,
    form: formReducer
  }),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

const peopleRows = [
  { firstName: 'Joe', lastName: 'Soap', details: { dob: new Date(1980, 5, 13) } },
  { firstName: 'Jane', lastName: 'Soap', details: { dob: new Date(1983, 2, 1) } },
  { firstName: 'Anne', lastName: 'Schneier', details: { dob: new Date(1973, 2, 1) } },
]

const App = () => <Provider store={store}>
  <MuiThemeProvider>
    <div>
      <h1>Datatable Demo</h1>
      <GroupableDatatable title="Example People" namespace="datatable" table="people" rows={peopleRows}/>
    </div>
  </MuiThemeProvider>
</Provider>

ReactDOM.render(<App />, document.getElementById('app'))
