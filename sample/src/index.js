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

const firstNames = [ 'Joe', 'Jane', 'Jack', 'Jacqui' ]
const lastNames = [ 'Soap', 'Schneier', 'Bush' ]
const pick = n => Math.floor(Math.random() * n)

const peopleRows = R.pipe(
  R.times(R.identity),
  R.map(i => ({
    _id: i + 1,
    firstName: firstNames[pick(firstNames.length)],
    lastName: lastNames[pick(lastNames.length)],
    details: {
      dob: new Date(
        1918 + Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 12),
        1 + Math.floor(Math.random() * 28)
      ),
      income: Math.floor(800 + Math.random() * 2000)
    }
  })),
)(1000)

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
    skipExport: true,
    format: (v, ownProps) => (<div>
      <DetailsIcon style={{ cursor: 'pointer' }}
        onClick={e => { e.stopPropagation();
          // `prop1` demonstrates how props of datatable get passed on
          alert(`Details of person ${ v._id } here, prop1=${ ownProps.prop1 }`)
        }}
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
    width: 130
  },
  actions: {
    label: 'Actions',
    f: (rows, group) => rows,
    component: ({ value, group, prop1 }) => (
      <div style={{ cursor: 'pointer' }}>
        <MapIcon onClick={() =>
          console.log('here be map...', value, group, prop1)} />
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

import 'react-virtualized/styles.css'
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer'
import Table from 'react-virtualized/dist/commonjs/Table'
import MultiGrid from 'react-virtualized/dist/commonjs/MultiGrid'
import Column from 'react-virtualized/dist/commonjs/Table/Column'

const styles = {
  table: {
    width: '100%'
  },
  column: {
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  }
}

const RowsView = rows => (
  <div>
    <AutoSizer disableHeight>
      {({ width }) => (
        <Table
          style={styles.table}
          height={300}
          width={width}
          headerHeight={24}
          rowCount={peopleRows.length}
          rowGetter={({ index }) => peopleRows[index]}
          rowHeight={24}
        >
          <Column label='ID'
            style={styles.column}
            cellDataGetter={
              ({ columnData, dataKey, rowData }) => rowData._id
            }
            dataKey='_id'
            width={60}
          />
          <Column label='First name'
            headerRenderer={({
              label
            }) => (
              <div style={{ textTransform: 'none' }}>
                {label}
              </div>
            )}
            cellDataGetter={
              ({ columnData, dataKey, rowData }) => rowData.firstName
            }
            dataKey='firstName'
            width={90}
          />
          <Column label='Date of birth'
            dataKey='details.dob'
            width={90}
            flexGrow={1}
          />
        </Table>
      )}
    </AutoSizer>
  </div>
)

const getRowValue = (row, column) => {
  const path = column.path.split('.')
  const value = R.path(path, row)
  const formatter = column.formatter ? column.formatter : v => v
  const formatted = (value => {
    try {
      const context = {
        React,
        out: '',
        value
      }
      formatter.call(undefined, context)

      const raw = typeof(context.out) === 'function'
        ? context.out.call(undefined, undefined)
        : context.out

      if (!raw) return ''
      if (React.isValidElement(raw)) {
        return raw
      } else if (typeof raw === 'string') {
        return raw
      } else if (typeof raw === 'object') {
        return <span>data...</span> // TODO: should have pop-out JSON view?
      } else {
        return '' + raw // should be primitive types, e.g. number
      }
    } catch (e) {
      return <a href="#" onClick={() => alert(e.toString())}>Error!</a>
    }
  })(value)
  return formatted
}

const MultiGridView = ({ rows, columns }) => (
  <div>
    <AutoSizer disableHeight>
      {({ width }) => (
        <MultiGrid
          fixedColumnCount={1}
          fixedRowCount={1}
          columnCount={columns.length}
          rowCount={rows.length + 1}
          height={300}
          style={{
            border: '1px solid #ddd'
          }}
          width={width}
          columnWidth={({ index }) => columns[index].width || 80 }
          rowHeight={({ index }) => index === 0 ? 28 : 20}
          cellRenderer={({
            columnIndex, rowIndex, key, style
          }) => {
            if (rowIndex === 0) {
              return (
                <div key={key} style={R.merge(style, {
                  height: 24,
                  borderBottom: '1px solid #eee',
                  borderRight: '1px solid #eee'
                })}>
                  <div style={{ fontWeight: 700, }}>
                    {columns[columnIndex].label}
                  </div>
                </div>
              )
            } else {
              const row = rows[rowIndex - 1]
              const column = columns[columnIndex]
              const value = getRowValue(row, column)
              const content = <div>{value}</div>
              return (
                <div key={key} style={R.merge(style, {
                  borderBottom: '1px solid #eee',
                  borderRight: '1px solid #eee'
                })}>
                  {content}
                </div>
              )
            }
          }}
        />
      )}
    </AutoSizer>
  </div>
)

import config from '../../src/configuration/config'
import { ColumnsConfigurator } from '../../src/configuration/columns-configurator'

const MyGrid = config({
  columns: [
    { label: 'Id', path: '_id', width: 32, },
    { label: 'First name', path: 'firstName' },
    { label: 'Last name', path: 'lastName' },
    {
      label: 'Date of birth',
      path: 'details.dob',
      width: 120,
      formatter: 'out = value.toLocaleDateString()'
    },
    {
      label: 'Income',
      path: 'details.income'
    }
  ]
})(({ configuration }) => (
  <MultiGridView
    rows={peopleRows}
    columns={configuration.columns}
  />
))

const App = () => <Provider store={store}>
  <MuiThemeProvider>
    <div>
      <h1>Datatable Demo</h1>

      <MyGrid />

      <RowsView
        header={() => <p>this is a header</p>}
        numRows={peopleRows.length}
        renderRow={i => <p>This is row {i}</p>}
      />

    </div>
  </MuiThemeProvider>
</Provider>

ReactDOM.render(<App />, document.getElementById('app'))
