// External
import kava from 'kava'
import { equal } from 'assert-helpers'
import { versions as processVersions } from 'process'

// Local
import { Edition, solicitEdition, Editions } from './index.js'
function fail() {
	throw Error('deliberate failure')
}

// Fixtures
interface Fixture {
	test: string
	error?: string
	loader?: Function
	expected?: string
	editions: null | Array<{}>
}
const fixtures: Fixture[] = [
	{
		test: 'missing editions',
		error: 'editions-autoloader-editions-missing',
		editions: null,
	},
	{
		test: 'missing editions',
		error: 'editions-autoloader-editions-missing',
		editions: [],
	},
	{
		test: 'missing all fields',
		error: 'editions-autoloader-invalid-edition',
		editions: [{}],
	},
	{
		test: 'missing engines',
		error: 'editions-autoloader-invalid-edition',
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
		error: 'editions-autoloader-invalid-edition',
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
		error: 'editions-autoloader-invalid-edition',
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
		error: 'editions-autoloader-invalid-edition',
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
		error: 'editions-autoloader-invalid-engines',
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
		test: 'skipped due to missing engines values',
		error: 'editions-autoloader-engine-mismatch',
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
		test: 'skipped due to engines.node = false',
		error: 'editions-autoloader-engine-unsupported',
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
		test: 'skipped due to unsupported node version',
		error: 'editions-autoloader-engine-incompatible',
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
		test: 'skipped due to deliberate failure',
		error: 'editions-autoloader-loader-failed',
		loader: fail,
		editions: [
			{
				description: 'deliberate failure edition',
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
		loader(this: Edition) {
			return this.description
		},
		expected: 'is ok',
		editions: [
			{
				description: 'is ok',
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
		loader(this: Edition) {
			return this.description
		},
		expected: `${process.versions.node} ok`,
		editions: [
			{
				description: 'is not ok',
				entry: 'value',
				directory: 'value',
				engines: {
					node: '0.6',
				},
			},
			{
				description: `${process.versions.node} ok`,
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
	suite('requireEditions', function (suite, test) {
		fixtures.forEach(function (fixture) {
			test(fixture.test, function (done) {
				try {
					const opts = {
						loader: fixture.loader,
						versions: processVersions,
					}
					const result = solicitEdition(
						fixture.editions as Editions,
						opts as any
					)
					equal(result, fixture.expected, 'result was as expected')
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
