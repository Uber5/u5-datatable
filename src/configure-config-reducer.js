//@flow
import * as R from 'ramda'

import { createReducer } from '../../lib/redux-utils'
import { GROUPS_CHANGED } from './actions'

export default (config: {
  tables: any
}) => createReducer(config, {
  [GROUPS_CHANGED]: (state, action) => {
    return R.merge(state, {
      tables: {
        [action.table]: R.merge(state.tables[action.table], {
          groups: action.values.groups,
          label: action.values.label
        })
      }
    })
  }
})
