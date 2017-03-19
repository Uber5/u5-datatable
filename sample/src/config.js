export default {
  people: {
    groups: [],
    predefinedGroups: [],
    columnSpecs: {
      firstName: {},
      lastName: {},
      'details.dob': {
        label: 'Birth date',
        format: v => v.toLocaleDateString()
      }
    },
    aggregationSpecs: {
      count: {
        f: rows => rows.length,
        label: '#'
      }
    }
  }
}
