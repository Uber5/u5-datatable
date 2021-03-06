import React from 'react'
import { connect } from 'react-redux'
import { reduxForm, Field, FieldArray, formValueSelector, reset } from 'redux-form'
import Dialog from 'material-ui/Dialog'
import IconMenu from 'material-ui/IconMenu'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import { RadioButton } from 'material-ui/RadioButton'
import MenuItem from 'material-ui/MenuItem'
import { TextField, RadioButtonGroup, SelectField } from 'redux-form-material-ui'
import Popover from 'material-ui/Popover/Popover'
import Toggle from 'material-ui/Toggle'
import { Card, CardText, CardHeader } from 'material-ui/Card'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import EditIcon from 'material-ui/svg-icons/editor/mode-edit'
import RemoveIcon from 'material-ui/svg-icons/content/clear'
import UpIcon from 'material-ui/svg-icons/navigation/arrow-upward'
import DownIcon from 'material-ui/svg-icons/navigation/arrow-downward'
import AddIcon from 'material-ui/svg-icons/content/add'
import * as R from 'ramda'

import { GROUPS_CHANGED } from './actions'

const validate = values => {
  const errors = {}
  const groupsErrors = []
  values.groups.forEach((group, index) => {
    const groupErrors = {}
    if (!group || !group.type) {
      groupErrors.type = "Must select a type"
    } else { // if we have a type
      if (group.type === 'byColumn' && !group.columnKey) {
        groupErrors.columnKey = "Needs a column key"
      }
      if (group.type === 'custom' && !group.expression) {
        groupErrors.expression = 'Expression must be specified (e.g. \'v => moment(v).startOf("day")\')'
      }
    }
    if (R.keys(groupErrors).length) {
      groupsErrors[index] = groupErrors
    }
  })
  if (groupsErrors.length) {
    errors.groups = groupsErrors
  }
  // console.log('validate, errors', errors)
  return errors
}

const renderGroups = ({ fields, groupsValues, table, config, meta: { touched, error }}) => {

  const move = (index, n) => {
    // const [ e ] = fields.splice(index, 1)
    // fields.splice(index + n, 0, e)
    fields.move(index, index + n)
  }

  const groupConfigLabel = group => {
    if (group.label) {
      return group.label
    }
    if (group.type === 'byColumn') {
      const specKey = group.columnKey
      const spec = specKey && config.columns[specKey]
      return spec && `By ${ spec.label || specKey }` || '?'
    } else if (group.type === 'custom') {
      return group.expression || '?'
    }
    return 'New group'
  }

  return (
    <div>
      {
        fields.map((group, index) => {
          const values = (groupsValues && groupsValues[index]) || {}
          // TODO: we cannot have initiallyExpanded depend on e.g. 'values.type'
          // being there or not, as this gets rendered twice
          // initially, first with an empty array as values (?), then with values.
          return (
            <Card key={index} initiallyExpanded={true}>
              <CardHeader title={
                <span>
                  {`${ index + 1 }: ${ groupConfigLabel(values) }`}
                  <IconButton tooltip="Remove group"
                    onClick={e => fields.remove(index)}>
                    <RemoveIcon />
                  </IconButton>
                  { index > 0 &&
                    <IconButton tooltip="Move group up a level"
                      onClick={() => move(index, -1)}>
                      <UpIcon />
                    </IconButton>
                  }
                  { index + 1 < fields.length &&
                    <IconButton tooltip="Move group down a level"
                      onClick={() => move(index, 1)}>
                      <DownIcon />
                    </IconButton>
                  }
                </span>}
                actAsExpander={true}
                showExpandableButton={true}
             />
              <CardText expandable={true}>
                <Field name={`${group}.type`} component={SelectField} hintText="Choose type">
                  <MenuItem value="byColumn" primaryText="By column value" />
                  <MenuItem value="custom" primaryText="Custom expression" />
                </Field>
                { values.type === 'byColumn' ?
                  <div>
                    <Field name={`${group}.columnKey`} component={SelectField} hintText="Choose which column">
                      {
                        R.keys(config.columns).map(specKey => {
                          const spec = config.columns[specKey]
                          return <MenuItem key={specKey}
                            value={specKey}
                            primaryText={spec.label || specKey} />
                        })
                      }
                    </Field>
                  </div>
                  : null
                }
                { values.type === 'custom' &&
                  <Field name={`${group}.expression`} component={TextField} multiLine={true} hintText="Javascript expression (determines group value)"/>
                }
                { values.type &&
                  <Field name={`${group}.label`} component={TextField} hintText="Label (optional)" />
                }
                { values.type &&
                  <Field name={`${group}.sort`} component={SelectField} hintText="Sort order of group">
                    <MenuItem value="ascending" primaryText="Ascending a..z" />
                    <MenuItem value="descending" primaryText="Descending z..a" />
                  </Field>
                }
              </CardText>
            </Card>
          )
        })
      }
      <FlatButton type="button" onClick={() => fields.push({})} label="Add" icon={<AddIcon />}/>
    </div>
  )
}

const getFormName = tableName => `groupsForm_${ tableName }`

class GroupsDialogAndForm extends React.Component {
  state = { expert: false }
  render() {

    const {
      handleSubmit, pristine, groupsValues, table, config, open, done
    } = this.props

    return (
      <form onSubmit={handleSubmit}>
        <Dialog modal={false} open={open}
          onRequestClose={done}
          autoScrollBodyContent={true}
          actions={[
            <FlatButton primary={false} label="Cancel" onClick={done}/>,
            <FlatButton primary={true} disabled={pristine} type="submit" label="Update groups" onClick={handleSubmit}/>,
          ]}
        >
          { !this.state.expert &&
            <FieldArray name="groups" component={renderGroups} props={{
              groupsValues,
              table,
              config
            }} />
          }
          { this.state.expert &&
            <Field name="expertGroups" component={TextField} multiLine={true} rows={10} hintText="Export group configuration (JSON)"/>
          }
          <span style={{ float: 'right' }}>
            <Toggle onToggle={(e, checked) => {
              this.setState({ expert: checked })
            }}
             label="Expert mode"
            />
          </span>
        </Dialog>
      </form>
    )
  }
}
let Form = GroupsDialogAndForm

Form = reduxForm({
  onSubmit: (values, dispatch, ownProps) => {

    if (values.expertGroups) {
      console.log('EXPERT', values.expertGroups)
      values.groups = JSON.parse(values.expertGroups)
      if (R.keys(validate(values)).length) {
        alert("Invalid JSON for groups, please double check.")
        return
      }
    }
    dispatch({ type: GROUPS_CHANGED, values: {...values}, table: ownProps.table })
    ownProps.done() // need this to close popover

  },
  validate
})(Form)

Form = connect((state, ownProps) => {
  const { table, config, groups, open } = ownProps
  const formName = getFormName(table)
  const selector = formValueSelector(formName)
  const groupsValues = selector(state, 'groups')
  const initialValues = {
    groups
  }
  return {
    groupsValues,
    initialValues,
    form: formName,
    table,
    config,
    open
  }
})(Form)

let GroupsState = ({ summary }) => (
  <span>{summary}</span>
)

GroupsState = connect((state, ownProps) => {
  return {
    summary: '(summary)' // TODO
  }
})(GroupsState)

export const GroupsDialog = ({ open, done, table, config, groups }) => {
  if (!open) { return null }
  return (
    <Form
      table={table}
      config={config}
      groups={groups}
      open={open}
      done={done}
    />
  )
}

import ContentFilter from 'material-ui/svg-icons/content/filter-list'
import GroupIcon from 'material-ui/svg-icons/action/list'

class PopoutGroups extends React.Component {
  state = { open: false }
  render() {
    const { table, groupsConfig } = this.props
    const config = groupsConfig
    return (
      <span>
        <IconMenu
          iconButtonElement={<IconButton><GroupIcon /></IconButton>}
          value={this.state.valueMultiple}
        >
          {
            config.predefinedGroups &&
            config.predefinedGroups.map(g => (
              <MenuItem key={g.label} value={g.label} primaryText={g.label}
                onClick={ () => this.props.choosePredefinedGroup(g.label) }
              />
            ))
          }
          <MenuItem value="_custom" primaryText="Custom..."
            onClick={e => this.setState({ open: true })}
          />
        </IconMenu>
        <GroupsDialog open={this.state.open}
          done={() => this.setState({ open: false })}
          table={table}
          groupsConfig={groupsConfig} />
      </span>
    )
  }
}

const PopoutGroupsConnected = connect(undefined, (dispatch, ownProps) => {
  const { groupsConfig, table } = ownProps
  return {
    choosePredefinedGroup: label => {
      const predefinedGroups = groupsConfig.predefinedGroups
      const groups = (R.find(R.propEq('label', label), predefinedGroups) || {}).groups
      const values = {
        groups,
        label
      }
      return dispatch({ type: GROUPS_CHANGED, values, table })
    }
  }
})(PopoutGroups)

let GroupsConfigurator = ({ groupsConfig, table }) => {
  return (
    <span>
      <GroupsState {...{groupsConfig}}/>
      <PopoutGroupsConnected {...{groupsConfig, table}}/>
    </span>
  )
}

GroupsConfigurator = connect((state, ownProps) => {
  const { namespace, table } = ownProps
  const datatableConfig = state[namespace].tables
  const groupsConfig = datatableConfig[table]
  return {
    groupsConfig,
    table
  }
})(GroupsConfigurator)
GroupsConfigurator.propTypes = {
  namespace: React.PropTypes.string.isRequired,
  table: React.PropTypes.string.isRequired
}

export default GroupsConfigurator
