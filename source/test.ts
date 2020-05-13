/* eslint no-console:0 */

// Blacklist
process.env.EDITIONS_TAG_BLACKLIST = 'blacklist'

// External
import kava from 'kava'
import { equal } from 'assert-helpers'

// Local
import { Edition, requireEditions } from './index.js'
import { simplifyRange } from './util.js'
function pass() {
	return 'ok'
}
function fail() {
	throw Error('not ok')
}
class PassThrough {
	data: string
	constructor() {
		this.data = ''
	}
	write(data: any) {
		this.data += data.toString()
	}
}

// Fixtures
interface Fixture {
	test: string
	error?: string
	strict?: boolean
	require?: Function
	result?: any
	stderr?: string
	blacklist?: string[]
	editions: null | Array<Edition | {}>
}
const fixtures: Fixture[] = [
	{
		test: 'missing editions',
		error: 'no editions specified',
		editions: null,
	},
	{
		test: 'missing editions',
		error: 'no editions specified',
		editions: [],
	},
	{
		test: 'missing all fields',
		error: 'fields defined',
		editions: [{}],
	},
	{
		test: 'missing engines',
		error: 'fields defined',
		editions: [
			{
				description: 'value',
				directory: 'value',
				entry: 'value',
			},
		],
	},
	{
		test: 'missing entry',
		error: 'fields defined',
		editions: [
			{
				description: 'value',
				directory: 'value',
				engines: false,
			},
		],
	},
	{
		test: 'missing directory',
		error: 'fields defined',
		editions: [
			{
				description: 'value',
				entry: 'value',
				engines: false,
			},
		],
	},
	{
		test: 'missing description',
		error: 'fields defined',
		editions: [
			{
				description: 'value',
				entry: 'value',
				engines: false,
			},
		],
	},
	{
		test: 'skipped due to false engines',
		error: 'its engines field was false',
		editions: [
			{
				description: 'value',
				entry: 'value',
				directory: 'value',
				engines: false,
			},
		],
	},
	{
		test: 'skipped due to falsey engines.node',
		error: 'its .engines.node field was falsey',
		editions: [
			{
				description: 'value',
				entry: 'value',
				directory: 'value',
				engines: {},
			},
		],
	},
	{
		test: 'skipped due to falsey engines.node',
		error: 'its .engines.node field was falsey',
		editions: [
			{
				description: 'value',
				entry: 'value',
				directory: 'value',
				engines: {
					node: false,
				},
			},
		],
	},
	{
		test: 'skipped due to unsupported node version [strict=true]',
		error: 'current node version',
		strict: true,
		editions: [
			{
				description: 'value',
				entry: 'value',
				directory: 'value',
				engines: {
					node: '0.6',
				},
			},
		],
	},
	{
		test: 'skipped due to unsupported node version',
		error: 'it failed to load',
		require: fail,
		editions: [
			{
				description: 'value',
				entry: 'value',
				directory: 'value',
				engines: {
					node: '0.6',
				},
			},
		],
	},
	{
		test: 'skipped due to blacklisted tag',
		error: 'it contained a blacklisted tag',
		blacklist: ['blacklist'],
		editions: [
			{
				description: 'value',
				entry: 'value',
				directory: 'value',
				tags: ['blacklist'],
				engines: {
					node: '>=0.6',
				},
			},
		],
	},
	{
		test: 'skipped due to error',
		error: 'it failed to load',
		require: fail,
		editions: [
			{
				description: 'value',
				entry: 'value',
				directory: 'value',
				engines: {
					node: true,
				},
			},
		],
	},
	// pass test cases
	{
		test: 'loaded fine',
		require: pass,
		result: 'ok',
		editions: [
			{
				description: 'value',
				entry: 'value',
				directory: 'value',
				engines: {
					node: true,
				},
			},
		],
	},
	{
		test: 'loaded last edition',
		require: pass,
		result: 'ok',
		stderr: 'current node version',
		editions: [
			{
				description: 'value',
				entry: 'value',
				directory: 'value',
				engines: {
					node: '0.6',
				},
			},
			{
				description: 'value',
				entry: 'value',
				directory: 'value',
				engines: {
					node: process.versions.node,
				},
			},
		],
	},
]

// Test
kava.suite('editions', function (suite, test) {
	test('simplifyRange', function () {
		equal(simplifyRange('4 || 6'), '>=4')
		equal(simplifyRange('4'), '>=4')
		equal(simplifyRange('4.0.0'), '>=4.0.0')
		equal(simplifyRange('4.0.0-beta'), '>=4.0.0-beta')
		equal(simplifyRange('4.0.0-beta || 5.0.0-beta'), '>=4.0.0-beta')
	})
	suite('requireEditions', function (suite, test) {
		fixtures.forEach(function (fixture) {
			test(fixture.test, function (done) {
				try {
					const opts = {
						strict: fixture.strict,
						require: fixture.require,
						verbose: true,
						stderr: new PassThrough(),
					}
					const result = requireEditions(
						fixture.editions as Edition[],
						opts as any
					)
					equal(result, fixture.result, 'result was as expected')
					if (fixture.stderr) {
						const expected = opts.stderr.data.indexOf(fixture.stderr) !== -1
						if (!expected) {
							throw new Error('stderr was not as expected: ' + opts.stderr.data)
						}
					}
				} catch (err) {
					if (fixture.error) {
						const expected = err.stack.toString().indexOf(fixture.error) !== -1
						if (expected) {
							return done()
						}
					}
					return done(err)
				}
				return done()
			})
		})
	})
})
