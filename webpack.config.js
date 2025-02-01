var path = require('path');

/* mini-svg-data-uri */
// converts SVGs into the most compact, compressible data: URI that SVG-supporting browsers tolerate
// https://github.com/tigt/mini-svg-data-uri
var svgToMiniDataURI = require('mini-svg-data-uri');

module.exports = {
  mode: "development", // "production" | "development" | "none"
  entry: "./src/index.js", // string | object | array
  output: {
    path: path.resolve(__dirname, "."), // string (default)
    filename: "uno_game.js", // string (default)
    //publicPath: "/assets/", // string
    uniqueName: "uno-game", // (defaults to package.json "name")
    // unique name for this build to avoid conflicts with other builds in the same HTML
  },
  module: {
    rules: [
      {
        test: /\.scss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },

      // Use url-loader to tranform images into base64 URIs
      {
        //test: /\.(png|svg|jpe?g|gif)$/i,
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'url-loader',
          },
        ],
      },

      // Use mini-svg-data-uri to compress
      {
        test: /\.svg$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              generator: (content) => svgToMiniDataURI(content.toString()),
            },
          },
        ],
      },
    ],
  },
};