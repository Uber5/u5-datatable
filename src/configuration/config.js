
import React from 'react'
import * as R from 'ramda'

import { ColumnsConfigurator } from './columns-configurator'

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
            R.set(R.lensProp('formatter'), 'v => v')
          ),
          R.over(R.lensProp('formatter'), f => eval(f))
        )
      )(columns)

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
