//@flow

import { Portal } from 'react-overlays'

import React from 'react'
import * as Babel from 'babel-standalone'
import template from 'babel-template'
import * as t from 'babel-types'

import onClickOutside from 'react-onclickoutside'

interface State {
  isEditing: bool,
  editedCode?: string,
  feedback?: string
}

class EditableCodeTextAreaInner extends React.Component {

  handleClickOutside = e => this.props.close()

  render() {
    const { code, width, onChange } = this.props
    return <textarea
      style={{ width: width }}
      value={code}
      rows={Math.max(3, (code || '').split('\n').length)}
      onChange={onChange}
    />
  }
}

const EditableCodeTextArea = onClickOutside(EditableCodeTextAreaInner)

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
    const { code, container, width } = this.props
    const { isEditing, editedCode, feedback } = this.state

    if (isEditing) {
      return (
        <Portal container={() => container}>
          <div style={{
            padding: 10,
            display: 'block',
            background: 'yellow',
            width
          }}>
            <EditableCodeTextArea
              width={width - 20}
              code={editedCode || code}
              close={() => this.setState({ isEditing: false })}
              onChange={e => this.updateCode(e.target.value)}
            />
            { feedback &&
              <pre>
                { feedback }
              </pre>
            }
          </div>
        </Portal>
      )
    } else {
      return <span onClick={() => this.setState({ isEditing: true })}>
        {code}
        { editedCode && editedCode !== code &&
          <p>(unsaved changes)</p>
        }
        { !editedCode && !code &&
          <p>(no formatter)</p>
        }
      </span>
    }

  }
}
