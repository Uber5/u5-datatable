import React from 'react'

class Tabs extends React.Component {

  state = {
    selectedIndex: this.props.initialIndex || 0
  }

  render() {
    const { selectedIndex } = this.state
    const { tabs, initialIndex, ...otherProps } = this.props

    return <div {...otherProps}>
      <div>
        {
          tabs.map((t, ix) => <button
            style={{ textDecoration: ix === selectedIndex ? 'underline' : 'none' }}
            key={ix}
            onClick={() => this.setState({ selectedIndex: ix })}
          >
            { t.title }
          </button>)
        }
      </div>
      <div>
        { tabs[selectedIndex].component }
      </div>
    </div>
  }
}

export default Tabs
