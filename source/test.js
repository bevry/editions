/* @flow */
/* eslint no-console:0 */
const {requirePackage} = require('./index')
const {suite} = require('joe')
const {equal} = require('assert-helpers')
const {resolve, dirname} = require('path')
const cwd = resolve(__dirname, '..')

// Test
suite('editions', function (suite, test) {
	test('load custom entry failure as no directory', function () {
		try {
			requirePackage(cwd, require, 'test-hello.js')
		}
		catch (error) {
			equal(
				error.message,
				'The package editions has no directory property on its editions which is required when using custom entry point: test-hello.js',
				'error message was as expected'
			)
			return
		}
		throw new Error('custom entry require did not fail when it should have')
	})

	suite('load custom entry', function (suite, test) {
		// Update editions with directory property
		require(resolve(cwd, 'package.json')).editions.forEach(function (edition) {
			edition.directory = dirname(edition.entry)
		})

		// Continue with tests
		const result = requirePackage(cwd, require, 'test-hello.js')
		const compiled = require(resolve(cwd, 'es2015', 'test-hello.js'))

		test('did it load the correct one based on environment', function () {
			let source = null
			try {
				source = require(resolve(cwd, 'source', 'test-hello.js'))
			}
			catch (error) {
				console.log('source was unable to load, so make sure fallback was result')
				equal(result, compiled, 'compiled was result')
				return
			}
			console.log('source was loaded, so make sure source was result')
			equal(result, source, 'source was result')
		})
	})

	// this is after custom entry, as the failure with destructors would blacklist the custom entry
	suite('load default entry', function (suite, test) {
		const result = requirePackage(cwd, require)
		const compiled = require(resolve(cwd, 'es2015', 'index.js'))

		test('did it load the correct one based on environment', function () {
			let source = null
			try {
				source = require(resolve(cwd, 'source', 'index.js'))
			}
			catch (error) {
				console.log('source was unable to load, so make sure fallback was result')
				equal(result, compiled, 'compiled was result')
				return
			}
			console.log('source was loaded, so make sure source was result')
			equal(result, source, 'source was result')
		})
	})

})
