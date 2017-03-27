import React from 'react'
import IconMenu from 'material-ui/IconMenu'
import IconButton from 'material-ui/IconButton'
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more'
import MenuItem from 'material-ui/MenuItem'
import DropDownMenu from 'material-ui/DropDownMenu'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import {
  Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle
} from 'material-ui/Toolbar';
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back'
import * as R from 'ramda'
import { saveAs } from 'file-saver'

export default class ToolbarExamplesSimple extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: 3,
    };
  }

  handleChange = (event, index, value) => this.setState({value});

  downloadRows = () => {
    const { selected, config } = this.props

    const escape = s => s.replace(/["]/g, "\\$&") // escape '"' only

    const headers = R.keys(config.columns)
    .filter(colName => config.columns[colName].skipExport !== true)
    .map(colName => config.columns[colName].label || colName)
    .map(label => `"${ escape(label) }"`).join(',')

    const lines = selected.map(row => {
      const line = R.keys(config.columns)
      .filter(colName => config.columns[colName].skipExport !== true)
      .map(colName => {
        const value = R.path(colName.split('.'), row)
        const spec = config.columns[colName]
        const formatted = spec.format ? spec.format(row) : value
        const escaped = formatted ? escape(formatted.toString()) : ''
        return `"${ escaped }"`
      }).join(',')
      return line
    })

    const asCsv = R.concat([ headers ], lines ).join('\n')
    const blob = new Blob([ asCsv ], { type: "text/csv;charset=utf-8" })
    saveAs(blob, "data.csv")
  }

  render() {
    const { selected, clearSelected } = this.props
    return (
      <Toolbar>
        <ToolbarGroup firstChild={true}>
          <FlatButton
            label="Back"
            icon={<BackIcon />}
            onClick={clearSelected}
          />
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarTitle text={`${ selected.length } selected`} />
          <ToolbarSeparator />
          <RaisedButton label="Download" primary={true}
            onClick={this.downloadRows}
          />
        </ToolbarGroup>
      </Toolbar>
    );
  }
}
