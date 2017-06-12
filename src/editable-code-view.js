//@flow

import React from 'react'
import * as Babel from 'babel-standalone'
import template from 'babel-template'
import * as t from 'babel-types'

interface State {
  isEditing: bool,
  editedCode?: string,
  feedback?: string
}

export class EditableCodeView extends React.Component {

  state: State = {
    isEditing: false
  }

  updateCode = (newCode: string) => {
    this.setState({ editedCode: newCode })
    try {
      const { onChange } = this.props
      const transformed = Babel.transform(newCode, {
        plugins: [],
        presets: [ 'es2015', 'stage-2', 'react' ],
      })
      const { code, ast } = transformed
      this.setState({ feedback: undefined })
      onChange(newCode)
    } catch(e) {
      this.setState({
        feedback: e.toString()
      })
    }
  }

  render() {
    const { code } = this.props
    const { isEditing, editedCode, feedback } = this.state

    if (isEditing) {
      return <div>
        <textarea
          value={editedCode || code}
          onChange={e => this.updateCode(e.target.value)}
          onBlur={() => this.setState({ isEditing: false })}
          />
        { feedback &&
          <pre>
            { feedback }
          </pre>
        }
      </div>
    } else {
      return <span onClick={() => this.setState({ isEditing: true })}>
        {code}
        { editedCode && editedCode !== code &&
          <p>(unsaved changes)</p>
        }
      </span>
    }

  }
}
