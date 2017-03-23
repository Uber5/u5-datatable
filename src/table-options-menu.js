import React from 'react'
import { connect } from 'react-redux'
import MenuItem from 'material-ui/MenuItem'
import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import GroupIcon from 'material-ui/svg-icons/action/list'
import ClearGroupsIcon from 'material-ui/svg-icons/communication/clear-all'
import DownloadIcon from 'material-ui/svg-icons/file/file-download'
import ExpertIcon from 'material-ui/svg-icons/action/build'
import CustomSettingsIcon from 'material-ui/svg-icons/action/settings'
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right'
import Divider from 'material-ui/Divider'
import {
  Card, CardActions, CardHeader, CardMedia, CardTitle, CardText
} from 'material-ui/Card'
import { Tabs, Tab } from 'material-ui/Tabs'
import * as R from 'ramda'

import { GROUPS_CHANGED } from './actions'
import { GroupsDialog } from './groups-configurator'

class TableOptionsMenu extends React.Component {

  state = { rawOpen: false }

  handleRawClose = () => {
    this.setState(R.merge(this.state, { rawOpen: false }))
  }

  handleRawOpen = () => {
    this.setState(R.merge(this.state, { rawOpen: true }))
  }

  clearGroups = () => {
    this.props.clearGroups()
  }

  render() {

    const { data, config, currentConfig, table } = this.props
    const { groups } = currentConfig

    const groupsItems = (config.groupings || []).map(g => (
      <MenuItem key={g.label} value={g.label} primaryText={g.label}
        onClick={ () => this.props.choosePredefinedGroup(g.label) }
      />
    ))
    if (groupsItems.length) {
      groupsItems.push(<Divider />)
    }
    groupsItems.push(
      <MenuItem value="_custom"
        primaryText="Custom"
        leftIcon={<CustomSettingsIcon />}
        onClick={e => this.setState({ customOpen: true })}
      />
    )
    return (
      <div>

        <IconMenu
          iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
        >
          <MenuItem primaryText="Group by"
            rightIcon={<ArrowDropRight />}
            leftIcon={<GroupIcon />}
            menuItems={groupsItems}
          />
          <MenuItem
            onTouchTap={this.clearGroups}
            primaryText="Clear groups"
            leftIcon={<ClearGroupsIcon />}
          />
          <Divider />
          <MenuItem
            primaryText="Export"
            leftIcon={<DownloadIcon />}
          />
          <Divider />
          <MenuItem onTouchTap={this.handleRawOpen}
            leftIcon={<ExpertIcon />}
            primaryText="Expert view"
          />
        </IconMenu>

        <GroupsDialog
          open={this.state.customOpen}
          done={() => this.setState({ customOpen: false })}
          table={table}
          config={config}
          groups={groups}
        />

        <Dialog
          modal={false}
          open={this.state.rawOpen}
          autoScrollBodyContent={true}
          actions={[
            <FlatButton
              label="Close"
              primary={true}
              onTouchTap={this.handleRawClose}
            />
          ]}
          onRequestClose={this.handleRawClose}
        >
          <Tabs>
            <Tab label="data">
              <pre>
                {JSON.stringify(data, null, 2)}
              </pre>
            </Tab>
            <Tab label="config">
              <pre>
                {JSON.stringify(config, null, 2)}
              </pre>
            </Tab>
            <Tab label="groups">
              <pre>
                {JSON.stringify(groups, null, 2)}
              </pre>
            </Tab>
          </Tabs>
        </Dialog>
      </div>
    )
  }
}

export default connect((state, ownProps) => {
  return {}
}, (dispatch, ownProps) => {
  const { table, config } = ownProps
  return {
    clearGroups: () => dispatch({
      type: GROUPS_CHANGED,
      values: {
        groups: [],
        label: 'Not grouped',
      },
      table
    }),
    choosePredefinedGroup: label => {
      const groupings = config.groupings
      const groups = (R.find(R.propEq('label', label), groupings) || {}).groups
      const values = {
        groups,
        label
      }
      return dispatch({ type: GROUPS_CHANGED, values, table })
    }
  }
})(TableOptionsMenu)
