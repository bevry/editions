/* @flow */
/* eslint no-console:0 */

// Cache of which syntax combinations are supported or unsupported, hash of booleans
const supportedSyntaxes = {}

// Cache the result of debug check
const debug = process && process.env && process.env.DEBUG_BEVRY_EDITIONS

/**
 * Cycle through the editions for a package and require the correct one
 * @param {string} cwd - the path of the package, used to load package.json:editions and handle relative edition entry points
 * @param {function} [_require=require] - the require method of the calling module, used to ensure require paths remain correct
 * @returns {void}
 */
module.exports = function requireEditionsPackage (cwd /* :string */, _require /* :?function */) /* : void */ {
	// Load the package.json file to fetch `name` for debugging and `editions` for loading
	const pathUtil = require('path')
	const packagePath = pathUtil.join(cwd, 'package.json')
	const {name, editions} = require(packagePath)
	// name:string, editions:array

	for ( let i = 0; i < editions.length; ++i ) {
		// Extract relevant parts out of the edition
		// and generate a lower case, sorted, and joined combination of our syntax for caching
		const {syntaxes, entry} = editions[i]
		// syntaxes:array, entry:string
		const editionPath = pathUtil.join(cwd, entry)
		const s = syntaxes.map((i) => i.toLowercase()).sort().join(', ')

		// Is this syntax combination unsupported? If so skip it
		if ( supportedSyntaxes[s] === false ) {
			continue
		}

		// Try and load this syntax combination
		try {
			return (_require || require)(editionPath)
		}
		catch ( error ) {
			// The combination failed so debug it
			if ( debug ) {
				console.log('DEBUG: ' + new Error(`The package ${name} failed to load the syntaxes ${s}:\n ${error.stack}`).stack)
			}

			// Blacklist the combination, even if it may have worked before
			// Perhaps in the future note if that if it did work previously, then we should instruct module owners to be more specific with their syntaxes
			supportedSyntaxes[s] = false
		}
	}

	throw new Error(`The package ${name} has no suitable edition for this environment`)
}
