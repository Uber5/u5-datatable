import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { Provider } from 'react-redux'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import * as R from 'ramda'
import moment from 'moment'

import {
  configureDatatableReducer,
  GroupsConfigurator,
  Datatable
} from '../../src'

import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

const datatableReducer = configureDatatableReducer({})

const store = createStore(
  combineReducers({
    datatable: datatableReducer,
    form: formReducer
  }),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

const peopleRows = [
  { _id: 1, firstName: 'Joe', lastName: 'Soap', details: { dob: new Date(1980, 5, 13) } },
  { _id: 2, firstName: 'Jane', lastName: 'Soap', details: { dob: new Date(1983, 2, 1) } },
  { _id: 3, firstName: 'Anne', lastName: 'Schneier', details: { dob: new Date(1973, 2, 1) } },
]

import DetailsIcon from 'material-ui/svg-icons/content/create'
import DeleteIcon from 'material-ui/svg-icons/action/delete'

const columns = {
  firstName: {
    label: 'First name'
  },
  lastName: {},
  fullName: { // TODO: Not a good idea! Cannot group on a value that does not
              // exist in the raw data...
    label: 'Full name',
    format: v => ([ v.firstName, v.lastName ].join(' '))
  },
  'details.dob': {
    label: 'Birth date',
    format: v => v.details.dob && v.details.dob.toLocaleDateString()
  },
  'actions': {
    label: 'Actions',
    format: v => (<div>
      <DetailsIcon style={{ cursor: 'pointer' }}
        onClick={e => { e.stopPropagation(); alert(`Details of person ${ v._id } here...`)}}
      />
      <DeleteIcon style={{ cursor: 'pointer' }}
        onClick={e => {e.stopPropagation(); alert(`Should delete person ${ v._id }`)}}
      />
    </div>)
  }
}

import MapIcon from 'material-ui/svg-icons/maps/place'

const aggregations = {
  count: {
    f: rows => rows.length,
    label: '#',
    width: 20
  },
  ageRange: {
    label: 'Age range',
    f: rows => {
      const dob = R.path(['details', 'dob'])
      const ageOf = d => moment().diff(d, 'years', false)
      const byAge = R.pipe(R.sortBy(dob), R.map(dob), R.map(ageOf))(rows)
      const domain = [ R.last(byAge), R.head(byAge) ]
      if (domain[0]) {
        if (domain[0] === domain[1]) {
          return `${ domain[0] } years of age`
        } else {
          return `${ domain[0] } to ${ domain[1] } years of age`
        }
      }
    },
    width: 50
  },
  actions: {
    label: 'Actions',
    f: (rows, group) => rows,
    component: ({ value, group }) => (
      <div style={{ cursor: 'pointer' }}>
        <MapIcon onClick={() => console.log('here be map...', value, group)} />
      </div>
    )
  }
}

const groupings = [
  {
    label: 'By last name and yob',
    groups: [
      {
        type: 'byColumn',
        columnKey: 'lastName'
      },
      {
        type: 'custom',
        expression: 'moment(v.details.dob).format("YYYY")',
        label: 'By year-of-birth',
        sort: 'descending'
      }
    ]
  },
  {
    label: 'By last name',
    groups: [
      {
        type: 'byColumn',
        columnKey: 'lastName'
      }
    ]
  },
  {
    label: 'Silly many groups',
    groups: R.times(n => ({
      type: 'custom',
      expression: `v.firstName && v.firstName[${ n }]`,
      label: `By firstName, char ${ n+1 }:`
    }), 9)
  }
]

const initialGroups = [
  {
    type: 'byColumn',
    columnKey: 'lastName'
  },
  {
    type: 'custom',
    expression: 'moment(v.details.dob).format("YYYY")',
    label: 'By year-of-birth',
    sort: 'descending'
  }
]

const App = () => <Provider store={store}>
  <MuiThemeProvider>
    <div>
      <h1>Datatable Demo</h1>
      <Datatable
        title="Example People"

        /** the `table` tells the datatable where to store config chosen by the
         *  user.
         */
        table="people"

        rows={peopleRows}

        /**
         * specify a sort function, which takes an array of rows as input.
         * Here, we use ramda to create such a function for us.
         */
        sort={R.sortWith([
          R.ascend(R.prop('lastName')),
          R.ascend(R.prop('firstName'))
        ])}

        config={{ aggregations, columns, groupings, groupColumnWidth: 120, tableMinWidth: 450 }}

        initialGroups={initialGroups}

      />
    </div>
  </MuiThemeProvider>
</Provider>

ReactDOM.render(<App />, document.getElementById('app'))
