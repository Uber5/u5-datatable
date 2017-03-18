import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, combineReducers } from 'redux'
import {
  configureDatatableReducer,
  GroupsConfigurator,
  GroupableDatatable
} from '../../src'

const App = () => <p>hello...</p>

ReactDOM.render(<App />, document.getElementById('app'))
