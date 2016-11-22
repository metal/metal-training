module.exports = {
	entry: './playground/main.js',
	output: {
			libraryTarget: 'this',
      path: './playground/build',
      filename: 'bundle.js'
  },
	module: {
	  loaders: [
	    {
	      test: /\.js?$/,
				exclude: /node_modules/,
	      loader: 'babel',
	      query: {
	        presets: ['es2015', 'metal-jsx']
	      }
	    }
	  ]
	},
	devtool: 'source-map'
};
