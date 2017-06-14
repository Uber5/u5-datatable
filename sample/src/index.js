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
      income: Math.floor(800 + Math.random() * 2000),
      accountNumber: '' + Math.floor(1000000 + Math.random() * 100000)
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

import { Portal } from 'react-overlays'
import JSONTree from 'react-json-tree'

class JSONViewerInContainer extends React.Component {
  state = {
    isOpen: false
  }
  render() {
    const { isOpen } = this.state
    const { data, container, width } = this.props
    return (
      <div>
        <button onClick={() => this.setState({ isOpen: true })}>data</button>
        { isOpen &&
          <Portal container={() => container}>
            <div style={{ minWidth: width, background: 'lightgray' }}>
              <div style={{ textAlign: 'right' }}>
                <button onClick={() => this.setState({ isOpen: false })}>Close</button>
              </div>

              <JSONTree
                data={data}
                valueRenderer={(raw, value, path) => <span>{raw}</span>}
              />
            </div>
          </Portal>
        }
      </div>
    )
  }
}

const getRowValue = (row, column, container, width) => {
  const path = column.path.split('.')
  const value = column.path === '.' ? row : R.path(path, row)
  const formatter = column.formatter ? column.formatter : v => v
  const formatted = (value => {
    try {
      const context = {
        React,
        out: '',
        value,
        row
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
        return <JSONViewerInContainer data={raw} container={container} width={width}/>
      } else {
        return '' + raw // should be primitive types, e.g. number
      }
    } catch (e) {
      return <a href="#" onClick={() => alert(e.toString())}>Error!</a>
    }
  })(value)
  return formatted
}

class MultiGridView extends React.Component {

  componentWillUpdate(nextProps, nextState) {
    this.grid && this.grid.recomputeGridSize()
  }

  render() {
    const { rows, columns } = this.props

    if (!rows || rows.length === 0) return <div>no rows</div>
    if (!columns || columns.length === 0) return <div>no columns</div>

    return (
      <div>

        <div style={{ position: 'absolute' }}>
          <div ref='container' style={{
            position: 'absolute',
            zIndex: 10,
          }}>
          </div>
        </div>

        <AutoSizer disableHeight>
          {({ width }) => (
            <MultiGrid
              ref={grid => this.grid = grid}
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
                  try {
                    const row = rows[rowIndex - 1]
                    const column = columns[columnIndex]
                    const value = getRowValue(row, column, this.refs.container, width)
                    const content = <div>{value}</div>
                    return (
                      <div key={key} style={R.merge(style, {
                        borderBottom: '1px solid #eee',
                        borderRight: '1px solid #eee'
                      })}>
                        {content}
                      </div>
                    )
                  } catch(e) {
                    return <div>Error {e.getMessage()}</div>
                  }
                }
              }}
            />
          )}
        </AutoSizer>
      </div>
    )
  }
}

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
  ],
  table: {
    rowHeight: 40 // TODO: or function?
  },
  groups: [ // TODO
  ],
  onSave: config => console.log('should be called when config shall be saved', config),
})(({ configuration }) => (
  <MultiGridView
    rows={peopleRows}
    columns={configuration.columns}
  />
))

/* columns and rows can be defined either when configuring the `config`
 * higher-order component, or as props on the configured component
 */
const App = () => <Provider store={store}>
  <MuiThemeProvider>
    <div>
      <h1>Datatable Demo</h1>

      <MyGrid rows={peopleRows} />

    </div>
  </MuiThemeProvider>
</Provider>

ReactDOM.render(<App />, document.getElementById('app'))
