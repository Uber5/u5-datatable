const path = require('path')

module.exports = {
  entry: {
    app: path.join(__dirname, 'src')
  },
  output: {
    path: './dist',
    filename: 'bundle.js',
    publicPath: '/'
  },
  devServer: {
    inline: true,
    contentBase: __dirname,
    historyApiFallback: true
  },
  plugins: [],
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: [ 'style', 'css' ],
        // include: path.join(__dirname, 'src')
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets:['es2015', 'react', 'stage-2']
        }
      }
    ]
  },
  resolve: { fallback: path.join(__dirname, "..", "node_modules") },
  resolveLoader: { fallback: path.join(__dirname, "..", "node_modules") }
}
