/* @flow */
/* eslint no-console:0 */
require('babel-polyfill')  // node 0.10 compat
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
	test('load custom entry failure as no directory', function () {
		try {
			requirePackage(cwd, require, 'anything.js')
		}
		catch (error) {
			equal(
				error.message,
				'The package [editions-test-fixture] has no directory property on its editions which is required when using custom entry point: anything.js',
				'error message was as expected'
			)
			return
		}
		throw new Error('custom entry require did not fail when it should have')
	})

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
