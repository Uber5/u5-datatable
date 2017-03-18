//@flow
import * as R from 'ramda'

import { GROUPS_CHANGED } from './actions'

const createReducer = (init, handlers) =>
  (state = init, action) =>
    R.propOr(R.identity, R.prop('type', action), handlers)(state, action)

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
