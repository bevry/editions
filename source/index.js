/* eslint no-console:0 */
'use strict'

/**
 * @typedef {Object} Edition
 * @property {string} description
 * @property {string} directory
 * @property {string} entry
 * @property {Array<string>} syntaxes
 * @property {false|Object.<string, string|boolean>} engines
 * @public
 */

/**
 * @typedef {Object} Options
 * @property {Function} require - the require method of the calling module, used to ensure require paths remain correct
 * @property {string} [packagePath] - if provided, this is used for debugging
 * @property {boolean} [verbose] - if provided, any error loading an edition will be logged. By default, errors are only logged if all editions failed. If not provided, process.env.EDITIONS_VERBOSE is used.
 * @property {string} [cwd] - if provided, this will be the cwd for entries
 * @property {string} [entry] - if provided, should be a relative path to the entry point of the edition
 * @property {string} [package] - if provided, should be the name of the package that we are loading the editions for
 * @property {stream.Writable} [stderr] - if not provided, will use process.stderr instead. It is the stream that verbose errors are logged to.
 * @public
 */

// Imports
const pathUtil = require('path')
const semver = require('semver')
const Errlop = require('errlop')

// Helpers
function stringify (value) {
	return typeof value === 'string' ? value : JSON.stringify(value)
}

// Environment fetching
const BLACKLIST = process.env.EDITIONS_SYNTAX_BLACKLIST && process.env.EDITIONS_SYNTAX_BLACKLIST.split(/[, ]+/g)
const NODE_VERSION = process.versions.node
const VERBOSE = process.env.EDITIONS_VERBOSE === true || process.env.EDITIONS_VERBOSE === 'yes' || process.env.EDITIONS_VERBOSE === 'true' || false

// Cache of which syntax combinations are supported or unsupported
// Object.<string, Error>
const blacklist = {}

// Check the environment configuration for a syntax blacklist
if (BLACKLIST) {
	for (let i = 0; i < BLACKLIST.length; ++i) {
		const syntax = BLACKLIST[i].trim().toLowerCase()
		blacklist[syntax] = new Errlop(`The EDITIONS_SYNTAX_BLACKLIST environment variable blacklisted the syntax [${syntax}]`)
	}
}

// Blacklist the syntax 'esnext' if our node version is below 0.12
if (semver.satisfies(NODE_VERSION, '<0.12')) {
	blacklist.esnext = new Error('The esnext syntax is skipped on early node versions as attempting to use esnext features will output debugging information on these node versions')
}

/**
 * Attempt to load a specific edition
 * @param {Edition} edition
 * @param {Options} opts
 * @returns {*} the result of the loaded edition
 * @throws {Error} an error if the edition failed to load
 * @public
 */
function requireEdition (edition, opts) {
	// Verify the edition is valid
	if (!edition.description || !edition.directory || !edition.entry || edition.engines == null) {
		const editionInvalidError = new Errlop(`Each edition must have its [description, directory, entry, engines] fields defined, yet all it had was [${Object.keys(edition).join(', ')}]`)
		editionInvalidError.level = 'fatal'
		throw editionInvalidError
	}

	// Verify engine support
	if (edition.engines === false) {
		throw new Errlop(`Skipping edition [${edition.description}] because its engines field was false`)
	}
	if (!edition.engines.node) {
		throw new Errlop(`Skipping edition [${edition.description}] because its .engines.node field was falsey`)
	}
	if (edition.engines.node !== true && semver.satisfies(NODE_VERSION, edition.engines.node) === false) {
		throw new Errlop(`Skipping edition [${edition.description}] because our current node version [${NODE_VERSION}] is not supported by its [${stringify(edition.engines.node)}]`)
	}

	// Verify syntax support
	// Convert syntaxes into a sorted lowercase string
	const syntaxes = (edition.syntaxes && edition.syntaxes.map((i) => i.toLowerCase()).sort()) || []
	for (let index = 0; index < syntaxes.length; index++) {
		const syntax = syntaxes[index]
		const blacklisted = blacklist[syntax]
		if (blacklisted) {
			throw new Errlop(`Skipping edition [${edition.description}] because it contained a blacklisted syntax [${syntax}]`, blacklisted)
		}
	}

	// Load the edition
	const entry = pathUtil.resolve(opts.cwd || '', edition.directory, opts.entry || edition.entry)
	try {
		return opts.require(entry)
	}
	catch (loadError) {
		// Note the error with more details
		throw new Errlop(`Skipped edition [${edition.description}] at entry [${entry}] because it failed to load`, loadError)
	}
}

/**
 * Cycles through a list of editions, returning the first suitable edition that it was able to load
 * @param {Array<Edition>} editions
 * @param {Options} opts
 * @returns {*} the result of the loaded edition
 * @throws {Error} an error if a suitable edition was unable to be resolved
 * @public
 */
function requireEditions (editions, opts) {
	// Check
	if (!editions || editions.length === 0) {
		if (opts.packagePath) {
			throw new Errlop(`There were no editions specified for package [${opts.packagePath}]`)
		}
		else {
			throw new Errlop('There were no editions specified')
		}
	}

	// Note the last error message
	let result, editionsError = null, loaded = false

	// Cycle through the editions
	for (let i = 0; i < editions.length; ++i) {
		const edition = editions[i]
		try {
			result = requireEdition(edition, opts)
			loaded = true
			break
		}
		catch (editionError) {
			if (editionError.level === 'fatal') {
				editionsError = editionError
				break
			}
			else if (editionsError) {
				editionsError = new Errlop(editionsError, editionError)
			}
			else {
				editionsError = editionError
			}
		}
	}

	if (loaded) {
		const verbose = opts.verbose == null ? VERBOSE : opts.verbose
		if (editionsError && verbose) {
			const stderr = opts.stderr || process.stderr
			stderr.write(editionsError.stack + '\n')
		}
		return result
	}
	else if (editionsError) {
		if (opts.packagePath) {
			throw new Errlop(`There were no suitable editions for package [${opts.packagePath}]`, editionsError)
		}
		else {
			throw new Errlop('There were no suitable editions', editionsError)
		}
	}
}

/**
 * Cycle through the editions for a package and require the correct one
 * @param {Options.cwd} cwd
 * @param {Options.require} require
 * @param {Options.entry} [entry]
 * @returns {*} the result of the loaded edition
 * @throws {Error} an error if a suitable edition was unable to be resolved
 * @public
 */
function requirePackage (cwd, require, entry) {
	// Load the package.json file to fetch `name` for debugging and `editions` for loading
	const packagePath = pathUtil.resolve(cwd, 'package.json')
	const { editions } = require(packagePath)
	const opts = { packagePath, cwd, require, entry }
	return requireEditions(editions, opts)
}

// Exports
module.exports = { requireEdition, requireEditions, requirePackage }
