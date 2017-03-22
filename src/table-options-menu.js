import React from 'react'
import { connect } from 'react-redux'
import MenuItem from 'material-ui/MenuItem'
import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
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

    const { data, config, groups, table, groupsSpec } = this.props

    const groupsItems = (config.predefinedGroups || []).map(g => (
      <MenuItem key={g.label} value={g.label} primaryText={g.label}
        onClick={ () => this.props.choosePredefinedGroup(g.label) }
      />
    ))
    if (groupsItems.length) {
      groupsItems.push(<Divider />)
    }
    groupsItems.push(
      <MenuItem value="_custom" primaryText="Custom"
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
            menuItems={groupsItems}
          />
          <MenuItem onTouchTap={() => console.log('more stuff')} primaryText="Do more stuff" />
          <MenuItem onTouchTap={this.clearGroups} primaryText="Clear groups" />
          <Divider />
          <MenuItem
            primaryText="Export"
          />
          <Divider />
          <MenuItem onTouchTap={this.handleRawOpen}
            primaryText="Expert view"
          />
        </IconMenu>

        <GroupsDialog
          open={this.state.customOpen}
          done={() => this.setState({ customOpen: false })}
          table={table}
          groupsConfig={groupsSpec}
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
  const { table, config, groupsSpec } = ownProps
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
      const predefinedGroups = groupsSpec.predefinedGroups
      const groups = (R.find(R.propEq('label', label), predefinedGroups) || {}).groups
      const values = {
        groups,
        label
      }
      return dispatch({ type: GROUPS_CHANGED, values, table })
    }
  }
})(TableOptionsMenu)
