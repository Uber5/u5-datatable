
import React from 'react'
import * as Babel from 'babel-standalone'
import * as R from 'ramda'

import { ColumnsConfigurator } from './columns-configurator'

const transpile = source => {
  try {
    const transformed = Babel.transform(source, {
      plugins: [],
      presets: [ 'es2015', 'stage-2', 'react' ],
    })
    const { code, ast } = transformed
    return eval(`
      context => (function(context) {
        const { React, value } = context
        let { out } = context
        ${code}
        context.out = out
      })(context)
    `)
  } catch (e) {
    console.log('transpile error (DO NOT LOG...)', e)
    return () => <a href="#" onClick={() => alert(e.toString())}>Error</a>
  }
}

export default ({
  columns,
  moreConfig // TODO, groups? sorting? filters?
}) => Configurable => props => {

  class Config extends React.Component {

    state = {
      columns
    }

    render() {
      const { columns } = this.state
      const columnsEvaluated = R.map(
        R.pipe(
          R.when(
            R.propSatisfies(R.isNil, 'formatter'),
            R.set(R.lensProp('formatter'), 'out = value')
          ),
          R.over(R.lensProp('formatter'), f => transpile(f))
        )
      )(columns)

      console.log('columnsEvaluated', columnsEvaluated)
      
      return <div>
        <ColumnsConfigurator
          columns={columns}
          onChange={newColumns => this.setState({ columns: newColumns })}
        />
        <Configurable
          configuration={{
            columns: columnsEvaluated
          }}
          {...props}
        />
      </div>
    }
  }

  return <Config />
}
