import React from 'react'

class AddColumnButton extends React.Component {
  render() {
    const { onAddColumn } = this.props
    return <button onClick={() => onAddColumn({
      path: '',
      label: 'New Column'
    })}>Add column</button>
  }
}

export default AddColumnButton
