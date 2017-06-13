//@flow

import { Portal } from 'react-overlays'

import React from 'react'
import * as Babel from 'babel-standalone'
import template from 'babel-template'
import * as t from 'babel-types'

import onClickOutside from 'react-onclickoutside'

import brace from 'brace'
import AceEditor from 'react-ace'

import 'brace/mode/jsx'
import 'brace/theme/github'

interface State {
  isEditing: bool,
  editedCode?: string,
  feedback?: string
}

class EditableCodeTextAreaInner extends React.Component {

  render() {
    const { code, width, onChange, uniqueName } = this.props
    return <div>
      <AceEditor
        mode="jsx"
        theme="github"
        onChange={onChange}
        name={uniqueName}
        value={code}
        editorProps={{$blockScrolling: true}}
        tabSize={2}
        minLines={3}
        maxLines={10}
      />
    </div>
  }
}

const EditableCodeTextArea = (EditableCodeTextAreaInner)

class PortalInner extends React.Component {
  handleClickOutside = e => this.props.onClose()
  // shouldComponentUpdate() {
  //   return false
  // }
  render() {
    console.log('PortalInner, render')
    const { width, children } = this.props
    return (
      <div style={{
        padding: 10,
        display: 'block',
        background: 'lightblue',
        width
      }}>
        { children }
      </div>
    )
  }
}
const CodePortal = onClickOutside(PortalInner)

class EditableCodeViewInner extends React.Component {

  state: State = {
    isEditing: false,
    originalCode: ''
  }

  componentDidMount() {
    this.setState({ originalCode: this.props.code })
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return nextState.isEditing !== this.props.isEditing
  // }

  // handleClickOutside = e => {
  //   console.log('handleClickOutside')
  //   // this.setState({ isEditing: false })
  // }

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

  onClose = () => this.setState({ isEditing: false })

  render() {
    const { code, container, width, uniqueName, fieldName, onChange } = this.props
    const { isEditing, editedCode, feedback } = this.state

    if (isEditing) {

      return (
        <Portal container={() => container}>
          <CodePortal
            style={{ margin: 20 }}
            onClose={this.onClose}
            width={width}
            container={container}
          >
            <h3>{ fieldName }</h3>
            <EditableCodeTextArea
              uniqueName={uniqueName}
              width={width - 20}
              code={editedCode || code}
              close={() => this.setState({ isEditing: false })}
              onChange={value => {
                console.log('originalCode', this.state.originalCode)
                this.updateCode(value)
              }}
            />
            { editedCode && editedCode !== code &&
              <button
                onClick={() => {
                  const { originalCode, editedCode } = this.state
                  this.setState({
                    isEditing: false,
                    editedCode
                  })
                  onChange(originalCode)
                  this.updateCode(originalCode)
                }}
              >
                cancel
              </button>
            }
            { feedback &&
              <div style={{ background: 'orange' }}>
                <h3>Feedback / Errors</h3>
                <pre>
                  { feedback }
                </pre>
              </div>
            }
            <h3>Help</h3>
            <p>You can use the following variables:</p>
            <ul>
              <li><code>value</code>: The cell value, based on the path of the column.</li>
              <li><code>row</code>: The current row.</li>
              <li><code>out</code>:
                The output of the formatter, i.e. the formatted value. This can be
                a String, an object, or even a React component. The formatter must
                assign directly to it, e.g. <code>out = value</code>.
              </li>
            </ul>
          </CodePortal>
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

export const EditableCodeView = (EditableCodeViewInner)
