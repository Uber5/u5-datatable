import React from 'react'
import { connect } from 'react-redux'
import {
  Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn
} from 'material-ui/Table'
import Subheader from 'material-ui/Subheader'

import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'

import Popover from 'material-ui/Popover/Popover'

import MapIcon from 'material-ui/svg-icons/maps/place'

import FloatingActionButton from 'material-ui/FloatingActionButton'

import IconExpanded from 'material-ui/svg-icons/content/remove'
import IconCollapsed from 'material-ui/svg-icons/content/add'
import MoreIcon from 'material-ui/svg-icons/navigation/more-horiz'
import CloseIcon from 'material-ui/svg-icons/navigation/close'

import * as d3c from 'd3-collection'
import * as d3a from 'd3-array'
import * as d3ScaleChromatic from 'd3-scale-chromatic'
import * as R from 'ramda'

import DrilldownMap from './map'

const styles = {
  tab: {
    height: 26
  },
  tableRowColumn: {
    height: 24
  },
  tableRowColumnClickable: {
    height: 24,
    cursor: 'pointer',
  },
  actionsRowColumn: {
    width: 24,
    height: 24,
    cursor: 'pointer',
  },
  actionsRowColumnHeader: {
    width: 24,
    height: 24,
  }
}

// as data is nested, we have to 'collect' the rows from the lowest level,
// so that we can e.g. run the aggregation function on the data
const rowsFromData = (groups, data) => {
  if (!groups.length) {
    return data.values
  } else {
    return data.values.reduce((res, data) => {
      return R.concat(res, rowsFromData(R.tail(groups), data))
    }, [])
  }
}

class PopoverMapButton extends React.Component {
  state = { open: false }
  close = () => {
    this.setState({ open: false })
  }
  open = () => {
    this.setState({ open: true })
  }
  render() {
    const { config, rows } = this.props
    const { open } = this.state

    return (
      <div>
        <MapIcon onClick={this.open}/>
        <Popover style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} open={open} onRequestClose={this.close}>
          <DrilldownMap rows={rows} config={config} />
          <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 10000 }}>
            <FloatingActionButton mini={true} onClick={this.close}>
              <CloseIcon />
            </FloatingActionButton>
          </div>
        </Popover>
      </div>
    )
  }
}

const GroupContextMenu = ({ config, data, group, groups, level  }) => {

  return (
    <PopoverMapButton config={config} rows={rowsFromData(groups, data)}/>
  )
}

const GroupRow1 = ({ config, data, group, groups, onOpen, isOpen, level }) => {

  // TODO: the idea is that we may want to choose which aggregations we want to
  // see on a group... then a group would have to know a list of aggregation keys...
  // for now, we are grabbing all keys from config.aggregationSpecs
  const groupAggregations = R.keys(config.aggregationSpecs)

  const aggregations = (groupAggregations || []).map(agg => {
    const spec = config.aggregationSpecs[agg]
    if (!spec) throw new Error(`${ agg } not found in aggregationSpecs`);
    return {
      label: spec.label,
      value: spec.f(rowsFromData(groups, data)),
      spec
    }
  })

  const nGroups = config.groups.length, nGroupsLeft = groups.length
  const scaleValue = 0.85 * (nGroups - nGroupsLeft) / nGroups

  return (
    <TableRow onCellClick={(e, x, colNumber) => {
      if (colNumber === 0) {
        onOpen()
      }
    }} style={styles.tableRowColumn}>
      <TableRowColumn style={R.merge(styles.tableRowColumnClickable, {
        width: config.groupColumnWidth,
        background: d3ScaleChromatic.interpolateSpectral(scaleValue)
      })}>
        { isOpen ? <IconExpanded/> : <IconCollapsed/> }
        {
          group.displayValue
            ? group.displayValue(data.key)
            : ([group.label, data.key].join(' '))
        }
      </TableRowColumn>
      <TableRowColumn style={styles.actionsRowColumn}>
        <GroupContextMenu {...{ config, data, group, groups, level }}/>
      </TableRowColumn>
      {
        aggregations.map((agg, ix) => {
          return (
            <TableRowColumn key={ix} style={R.merge(
              styles.tableRowColumn,
              { width: agg.spec.width}
            )}>
              {agg.spec.component ? agg.spec.component({ value: agg.value }) : `${ agg.value }`}
            </TableRowColumn>
          )
        })
      }
    </TableRow>
  )
}

const GroupRow2 = ({ config, data, group, groups, level }) => {
  return (
    <TableRow style={styles.tableRowColumn}>
      <TableRowColumn style={{ paddingLeft: 0, paddingRight: 0 }}
        colSpan={R.keys(config.aggregationSpecs).length + 2}>

        <DrilldownRecursive level={level+1} {...{ config, data: data.values, groups }} />

      </TableRowColumn>
    </TableRow>
  )
}

class DrilldownRecursive extends React.Component {

  constructor(props) {
    super(props)
    this.state = { open: [] }
  }

  render() {
    const { config, data, groups, isRoot, level } = this.props
    const { open } = this.state

    if (groups.length) {
      // render next group's data as rows

      return (
        <div>
          <Table wrapperStyle={{ minWidth: config.tableMinWidth }}>
            {
              isRoot &&
              <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                <TableRow>
                  <TableHeaderColumn style={{ width: config.groupColumnWidth }}>
                    Group
                  </TableHeaderColumn>
                  <TableHeaderColumn style={styles.actionsRowColumnHeader}>
                    Actions
                  </TableHeaderColumn>
                  {
                    (R.keys(config.aggregationSpecs) || []).map((agg, ix) => {
                      const spec = config.aggregationSpecs[agg]
                      return (
                        <TableHeaderColumn key={ix} style={{width: spec.width}}>
                          {spec.label || agg}
                        </TableHeaderColumn>
                      )
                    })
                  }
                </TableRow>
              </TableHeader>
            }
            <TableBody>
              {
                R.unnest(R.zip(data, data)).map((group, ix) => ix % 2 === 0 ? (
                  <GroupRow1 level={level} key={ix} data={group} config={config}
                    group={R.head(groups)} groups={R.tail(groups)}
                    isOpen={this.state.open[ix/2]}
                    onOpen={() => {
                      this.state.open[ix/2] = !this.state.open[ix/2]
                      this.setState(this.state)
                    }}
                  />
                ) : (open[(ix-1)/2] &&
                  <GroupRow2 level={level} key={ix} data={group} config={config}
                    group={R.head(groups)} groups={R.tail(groups)}
                  />
                ))
              }
            </TableBody>
          </Table>
        </div>
      )
    } else {
      // render rows
      const sortedData = config.sort ? config.sort(data) : data
      return (
        <Table>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              {
                R.keys(config.columnSpecs).map(specKey => {
                  const spec = config.columnSpecs[specKey]
                  return (
                    <TableHeaderColumn key={specKey}>
                      { spec.label || specKey }
                    </TableHeaderColumn>
                  )
                })
              }
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              sortedData.map((row, index) => (
                <TableRow key={index} style={styles.tableRowColumn}>
                {
                  R.keys(config.columnSpecs).map(specKey => {
                    const spec = config.columnSpecs[specKey]
                    const value = R.path(specKey.split('.'), row)
                    return (
                      <TableRowColumn key={specKey} style={styles.tableRowColumn}>
                        {spec.format ? spec.format(row) : `${ value }` }
                      </TableRowColumn>
                    )
                  })
                }
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      )
    }
  }
}
DrilldownRecursive.propTypes = {
  config: React.PropTypes.any.isRequired,

}

import TableOptionsMenu from './table-options-menu'

let GroupableDatatable = ({ groupsSpec, rows, config, table, title }) => {

  const { groups } = groupsSpec
  const data = groups.reduce((d, group) => {
    const sort = group.sort === 'descending' ? d3a.descending : d3a.ascending
    let result
    if (group.type === 'byColumn') {
      result = d.key(R.path(group.columnKey.split('.'))).sortKeys(sort)
    } else if (group.type === 'custom') {
      const moment = require('moment')
      result = d.key(value => {
        const v = value
        const r = eval(`${ group.expression }`)
        return r
      }).sortKeys(sort)
    }
    return result
  }, d3c.nest()).entries(rows)

  return (
    <div>
      <Subheader>
        {title || 'Datatable'}
        <span style={{ float: 'right' }}>
          <TableOptionsMenu {...{ groupsSpec, config, groups, data, table }} />
        </span>
      </Subheader>
      <DrilldownRecursive isRoot={true} level={0} {...{ config, groups, data }} />

    </div>
  )
}

GroupableDatatable = connect((state, ownProps) => {
  const { namespace, rows, table } = ownProps
  const groupsSpec = state[namespace].tables[table]
  return {
    rows, groupsSpec, config: state[namespace].tables[table], table
  }
})(GroupableDatatable)

GroupableDatatable.propTypes = {
  namespace: React.PropTypes.string.isRequired,
  table: React.PropTypes.string.isRequired,
  rows: React.PropTypes.any.isRequired,
  title: React.PropTypes.any
}

export default GroupableDatatable
