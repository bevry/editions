/* @flow */
/* eslint no-console:0 */
'use strict'

process.env.DEBUG_BEVRY_EDITIONS = 'YES'
const {requirePackage} = require('./index')
const {suite} = require('joe')
const {equal} = require('assert-helpers')
const {resolve, dirname} = require('path')

// Fixtures
const cwd = resolve(__dirname, '..', 'test-fixture')
const compiled = (require(resolve(cwd, 'es5', 'index.js')) || '').toString()
let source = null
try {
	source = (require(resolve(cwd, 'esnext', 'index.js')) || '').toString()
}
catch (error) {
	source = error
}

// Test
suite('editions', function (suite, test) {
	// this is after custom entry, as the failure with destructors would blacklist the custom entry
	suite('load default entry', function (suite, test) {
		const result = (requirePackage(cwd, require) || '').toString()
		test('did it load the correct one based on environment', function () {
			if ( source instanceof Error ) {
				console.log('source was unable to load, so make sure fallback was result', source)
				equal(result, compiled, 'compiled was result')
			}
			else {
				console.log('source was loaded, so make sure source was result')
				equal(result, source, 'source was result')
			}
		})
	})

	suite('load custom entry', function (suite, test) {
		// Update editions with directory property
		require(resolve(cwd, 'package.json')).editions.forEach(function (edition) {
			edition.directory = dirname(edition.entry)
		})

		// Continue with tests
		const result = (requirePackage(cwd, require, 'index.js') || '').toString()
		test('did it load the correct one based on environment', function () {
			if ( source instanceof Error ) {
				console.log('source was unable to load, so make sure fallback was result', source)
				equal(result, compiled, 'compiled was result')
			}
			else {
				console.log('source was loaded, so make sure source was result')
				equal(result, source, 'source was result')
			}
		})
	})
})
