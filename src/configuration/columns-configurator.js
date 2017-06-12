import React from 'react'
import JSONTree from 'react-json-tree'
import * as R from 'ramda'

import { EditableCodeView } from '../editable-code-view'

class JSONEditableText extends React.Component {

  state = {
    isEditing: false
  }

  render() {
    const { value, onChange } = this.props
    const { isEditing } = this.state

    if (isEditing) {
      return <input
        type='text'
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={() => this.setState({ isEditing: false })}
      />
    } else {
      return <span onClick={() => this.setState({ isEditing: true })}>
        {value}
      </span>
    }
  }

}

const ColumnConfigurator = ({ column, index, onDelete, onChange }) => (
  <span>
    <JSONTree data={column} valueRenderer={(raw, value, path) => {
      switch(path) {
        case 'label':
          return <JSONEditableText
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
          <ol>
            { columns.map((col, ix) => (
              <li key={ix}>
                <ColumnConfigurator
                  index={ix}
                  column={col}
                  onDelete={this.onDelete}
                  onChange={c => this.onChangeColumn(ix, c)}
                />
              </li>
            ))}
          </ol>
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
