// TODO: not using this any more
import React from 'react'
import { Map, Marker, Popup, TileLayer, FeatureGroup } from 'react-leaflet'
import L from 'leaflet'

const mapStyle = {
  height: '100vh',
  width: '100vw'
}

class RowsMap extends React.Component {

  constructor(props) {
    super(props)
  }

  // componentWillReceiveProps(newProps) {
  //   console.log('new props, featureGroup', this.featureGroup)
  // }

  render() {
    const { rows, config } = this.props

    const markers = rows.map(row => config.map.buildMarker(row)).filter(m => m)
    const bounds = L.bounds(markers.map(m => m.props.position))

    console.log('markers.length', markers.length)
    console.log('RowsMap, bounds', bounds)

    const group = <FeatureGroup>
      { markers }
    </FeatureGroup>

    return (
      <Map style={mapStyle} boundsOptions={{ maxZoom: 18 }} bounds={[
        [
          bounds.min && bounds.min.x || -35,
          bounds.min && bounds.min.y || 18
        ], [
          bounds.max && bounds.max.x || -28,
          bounds.max && bounds.max.y || 28
        ]
      ]}>
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        { group }
      </Map>
    )
  }

}

export default ({ rows, config }) => <RowsMap {...{ rows, config }} />
