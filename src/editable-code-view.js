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
  feedback?: string,
  originalCode?: string,
  showHelp?: bool
}

class CodeEditor extends React.Component {

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

class ClickAwayWrapperInner extends React.Component {
  handleClickOutside = e => this.props.onClose()
  render() {
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
const ClickAwayWrapper = onClickOutside(ClickAwayWrapperInner)

import debounce from 'throttle-debounce/debounce'

class EditableCodeViewInner extends React.Component {

  state: State = {
    isEditing: false
  }

  componentDidMount() {
    this.setState({ originalCode: this.props.code })
  }

  updateCode = debounce(500, (newCode: string) => {
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
  })

  onClose = () => this.setState({ isEditing: false })

  render() {
    const { code, container, width, uniqueName, fieldName, onChange } = this.props
    const { isEditing, editedCode, feedback, showHelp } = this.state

    if (isEditing) {

      return (
        <Portal container={() => container}>
          <ClickAwayWrapper
            style={{ margin: 20 }}
            onClose={this.onClose}
            width={width}
            container={container}
          >
            <h3>{ fieldName }</h3>
            <CodeEditor
              uniqueName={uniqueName}
              width={width - 20}
              code={editedCode || code}
              close={() => this.setState({ isEditing: false })}
              onChange={value => this.updateCode(value)}
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
            { !showHelp &&
              <button onClick={() => this.setState({ showHelp: true })}>Help</button>
            }
            { showHelp &&
              <div>
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
              </div>
            }
          </ClickAwayWrapper>
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
