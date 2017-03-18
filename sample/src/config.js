export default {
  things: {
    groups: [],
    predefinedGroups: [],
    columnSpecs: {
      firstName: {},
      lastName: {},
      'details.dob': {
        label: 'Birth date',
        format: v => v.toLocaleDateString()
      }
    }
  }
}
