
import React from 'react'
import * as Babel from 'babel-standalone'
import * as R from 'ramda'

import { ColumnsConfigurator } from './columns-configurator'
import Tabs from '../tabs'

const transpile = source => {
  try {
    const transformed = Babel.transform(source, {
      plugins: [],
      presets: [ 'es2015', 'stage-2', 'react' ],
    })
    const { code, ast } = transformed
    return eval(`
      context => (function(context) {
        const { React, value, row } = context
        let { out } = context
        ${code}
        context.out = out
      })(context)
    `)
  } catch (e) {
    return context => context.out = <a href="#" onClick={() => alert(e.toString())}>Error</a>
  }
}

export default ({
  columns,
  moreConfig, // TODO, groups? sorting? filters?
  onSave
}) => Configurable => props => {

  class Config extends React.Component {

    state = {
      columns: this.props.columns || columns,
      showConfig: false
    }

    render() {
      const { columns, showConfig } = this.state
      const columnsEvaluated = R.map(
        R.pipe(
          R.when(
            R.propSatisfies(R.isNil, 'formatter'),
            R.set(R.lensProp('formatter'), 'out = value')
          ),
          R.over(R.lensProp('formatter'), f => transpile(f))
        )
      )(columns)

      // console.log('columnsEvaluated', columnsEvaluated)

      return <div>
        <div>
          <button onClick={() => this.setState({ showConfig: !showConfig })}>
            {showConfig ? 'Hide configuration' : 'Configure' }
          </button>
          { showConfig && onSave &&
            <button onClick={() => onSave({
              columns
            })}>Save</button>
          }
        </div>
        { showConfig &&
          <Tabs style={{ background: 'lightgreen' }} initialIndex={0} tabs={[
            {
              title: 'Columns',
              component: (<ColumnsConfigurator
                columns={columns}
                onChange={newColumns => this.setState({ columns: newColumns })}
                onAddColumn={newColumn => {
                  this.setState({
                    columns: R.append(newColumn, columns)
                  })
                }}
                onRemoveColumn={ix => this.setState({
                  columns: R.remove(ix, 1, columns)
                })}
                onMoveColumn={(ix, delta) => {
                  const newIx = Math.min(columns.length-1, Math.max(0, ix + delta))
                  this.setState({
                    columns: R.pipe(
                      R.update(newIx, columns[ix]),
                      R.update(ix, columns[newIx])
                    )(columns)
                  })
                }}
              />)
            },
            { title: 'Data', component: <p>about data</p> },
            { title: 'More?', component: <p>about more?</p> },
          ]} />
        }

        <Configurable
          configuration={{
            columns: columnsEvaluated
          }}
        />
      </div>
    }
  }

  return <Config {...props} />
}
