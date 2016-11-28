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
	      loader: 'babel',
	      query: {
	        presets: ['es2015', 'metal-jsx']
	      }
	    }
	  ]
	},
	resolve: {
		// We want webpack to use the ES6 version of metal.js source files, so that
		// the source maps can work when debugging the playground code.
		packageMains: ['jsnext:main', 'main']
	},
	devtool: 'source-map'
};
