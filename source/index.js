/* @flow */
/* eslint no-console:0 */
const supportedSyntaxes = {}
module.exports = function editionsLoader (cwd /* :string */, _require /* :function */) /* : void */ {
	const pathUtil = require('path')
	const packagePath = pathUtil.join(cwd, 'package.json')
	const {name, editions} = require(packagePath)
	// name:string, editions:array

	for ( let i = 0; i < editions.length; ++i ) {
		const {syntaxes, entry} = editions[i]
		// syntaxes:array, entry:string
		const editionPath = pathUtil.join(cwd, entry)
		const s = syntaxes.sort().join(', ').toLowerCase()

		if ( supportedSyntaxes[s] === false ) {
			continue
		}

		try {
			return (_require || require)(editionPath)
		}
		catch ( error ) {
			if ( process && process.env && process.env.DEBUG_EDITION_LOADER ) {
				console.log('DEBUG: ' + new Error(`The package ${name} failed to load the syntaxes ${s}:\n ${error.stack}`).stack)
			}
			// it may have worked before, but it didn't work now, so blacklist it
			supportedSyntaxes[s] = false
		}
	}

	throw new Error(`The package ${name} has no suitable edition for this environment`)
}
