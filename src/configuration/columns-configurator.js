import React from 'react'
import JSONTree from 'react-json-tree'
import * as R from 'ramda'

import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer'
import Table from 'react-virtualized/dist/commonjs/Table'
import Column from 'react-virtualized/dist/commonjs/Table/Column'
import WindowScroller from 'react-virtualized/dist/commonjs/WindowScroller'

import onClickOutside from 'react-onclickoutside'

import { Portal } from 'react-overlays'

import { EditableCodeView } from '../editable-code-view'

class EditableTextInner extends React.Component {

  state = {
    isEditing: false
  }

  handleClickOutside = e => this.setState({ isEditing: false })

  render() {
    const { value, onChange, type } = this.props
    const { isEditing } = this.state

    if (isEditing) {
      return <input
        type={type || 'text'}
        value={value || ''}
        autoFocus
        onChange={e => {
          const raw = e.target.value
          const value = type === 'number' ? Number(raw) : raw
          console.log('EditableText, onChange', value, typeof value, type)
          onChange(value)
        }}
        onBlur={() => this.setState({ isEditing: false })}
      />
    } else {
      return <div style={{ height: '100%' }}
        onClick={() => this.setState({ isEditing: true })}
      >
        {'' + value}
      </div>
    }
  }

}

const EditableText = onClickOutside(EditableTextInner)

const ColumnConfigurator = ({ column, index, onDelete, onChange }) => (
  <span>
    <JSONTree data={column} valueRenderer={(raw, value, path) => {
      switch(path) {
        case 'label':
          return <EditableText
            value={value}
            onChange={value => onChange({
              ...column,
              label: value,
            })}
          />
        case 'formatter':
          return <EditableCodeView
            code={value}
            onChange={value => onChange({
              ...column,
              formatter: value,
            })}
          />
        default:
          return <span>{raw}</span>
      }
    }}/>
    <button onClick={() => onDelete(index)}>Remove</button>
  </span>
)

const plainTextRenderer = ({ path, onChange, type }) => ({
  cellData, columnData, dataKey, rowData, rowIndex
}) => (
  <EditableText
    value={cellData}
    type={type}
    onChange={value => onChange({
      ...rowData,
      [path]: value,
    })}
  />
)

class TableOfColumns extends React.Component {
  render() {
    const { columns, onChange } = this.props

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
            <Table
              headerHeight={24}
              height={400}
              autoHeight
              rowCount={columns.length}
              rowGetter={({ index }) => columns[index]}
              rowHeight={20}
              width={width}
            >
              <Column
                label='No'
                cellDataGetter={
                  ({ columnData, dataKey, rowData }) => rowData._ix + 1
                }
                dataKey='_ix'
                width={60}
              />
              <Column
                label='Label'
                cellDataGetter={
                  ({ columnData, dataKey, rowData }) => rowData.label
                }
                cellRenderer={plainTextRenderer({ path: 'label', onChange })}
                dataKey='label'
                width={60}
                flexGrow={1}
              />
              <Column
                label='Path'
                cellDataGetter={
                  ({ columnData, dataKey, rowData }) => rowData.path
                }
                cellRenderer={plainTextRenderer({ path: 'path', onChange })}
                dataKey='path'
                width={60}
                flexGrow={1}
              />
              <Column
                label='Width'
                cellDataGetter={
                  ({ columnData, dataKey, rowData }) => rowData.width
                }
                cellRenderer={plainTextRenderer({ path: 'width', onChange, type: 'number' })}
                dataKey='width'
                width={60}
                flexGrow={1}
              />
              <Column
                label='Formatter'
                cellDataGetter={
                  ({ columnData, dataKey, rowData }) => rowData.formatter
                }
                cellRenderer={
                  ({
                    cellData, columnData, dataKey, rowData, rowIndex
                  }) => (
                    <EditableCodeView
                      container={this.refs.container}
                      width={width}
                      code={cellData}
                      onChange={value => onChange({
                        ...rowData,
                        formatter: value,
                      })}
                    />
                  )
                }
                dataKey='formatter'
                width={120}
                flexGrow={1}
              />
            </Table>
          )}
        </AutoSizer>

      </div>

    )
  }
}

export class ColumnsConfigurator extends React.Component {
  state = {
    isOpen: false,
    isAddOpen: false
  }
  onDelete = ix => {
    console.log('onDelete', ix)
    this.props.onChange(R.remove(ix, 1, this.props.columns))
  }
  onChangeColumn = (ix, newColumn) => {
    this.props.onChange(R.adjust(() => newColumn, ix, this.props.columns))
  }
  render() {
    const { columns, onChange } = this.props
    const { isOpen, isAddOpen } = this.state
    return (
      <div>
        <button onClick={() => this.setState({ isOpen: !isOpen })}>
          Columns
        </button>
        { isOpen &&
          <TableOfColumns
            columns={
              R.addIndex(R.map)(
                (col, ix) => R.merge(col, { _ix: ix })
              )(columns)
            }
            onChange={c => this.onChangeColumn(c._ix, c)}
          />
        }
        { isOpen &&
          <button onClick={() => this.setState({ isAddOpen: !isAddOpen })}>Add</button>
        }
        { isOpen && isAddOpen &&
          <p>add...</p>
        }
      </div>
    )
  }
}
