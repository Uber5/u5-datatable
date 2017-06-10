import * as R from 'ramda'

import { GROUPS_CHANGED, SELECTION_CHANGED } from './actions'

const createReducer = (init, handlers) =>
  (state = init, action) =>
    R.propOr(R.identity, R.prop('type', action), handlers)(state, action)

export default (config: { /* TODO: no config required atm */}) => createReducer(config, {
  [GROUPS_CHANGED]: (state, action) => {
    return R.merge(state, {
      tables: {
        [action.table]: R.merge((state.tables || {})[action.table], {
          groups: action.values.groups,
          label: action.values.label
        })
      }
    })
  },
  [SELECTION_CHANGED]: (state, action) => {
    const { table, select, unselect } = action
    const prevTableState = (state.tables || {})[table] || {}
    const selected = action.clearAll ? [] : R.pipe(
      R.filter(e => !R.contains(e, unselect)),
      R.concat(select),
      R.uniq
    )(prevTableState.selected || [])
    return R.merge(state, {
      tables: {
        [table]: R.merge(
          prevTableState,
          {
            selected
          }
        )
      }
    })
  }
})
