/* eslint-disable no-console -- we are testing */

// External
import kava from 'kava'
import { equal } from 'assert'
import { versions as processVersions } from 'process'

// Local
import {
	Edition,
	solicitEdition,
	Editions,
	SolicitOptions,
	Loader,
	Versions,
} from './index.js'
import { excludes } from './util.js'

// Fixtures
/** Test fixture interface for defining test cases for edition loading */
interface Fixture {
	/** Description of the test case */
	test: string
	/** Expected error code if the test should fail */
	error?: string
	/** Optional custom loader function for the test */
	loader: Loader
	/** Expected result value if the test should succeed */
	expected?: string
	/** The editions array to test against */
	editions: null | {}[]
}

/**
 * A test loader function that successfully loads and returns the edition description.
 * @returns The description of the edition
 */
function successLoader(this: Edition) {
	console.info('the custom success loader received', this)
	return this.description
}

/**
 * A test loader function that deliberately fails to test error handling.
 * @throws {Error} Always throws an error with the message "desired loader failure"
 */
function failureLoader(this: Edition) {
	console.info('the custom failure loader received', this)
	throw Error('desired loader failure')
}

/**
 * A test loader function that deliberately fails to indicate that the tests should not have gotten this far.
 * @throws {Error} Always throws an error with the message "unexpected loader failure"
 */
function unexpectedLoader(this: Edition) {
	console.info('the custom unexpected loader received', this)
	throw Error('unexpected loader failure')
}

/**
 * Checks if a haystack string contains a needle string.
 * @param haystack - The string to search in
 * @param needle - The string to search for
 * @returns True if the haystack contains the needle, false otherwise
 */
function includes(haystack: string, needle: string): boolean {
	return haystack.indexOf(needle) !== -1
}

const fixtures: Fixture[] = [
	// pass test cases
	{
		test: 'loaded fine',
		loader: successLoader,
		expected: 'is ok',
		editions: [
			{
				description: 'is ok',
				entry: 'test-entry-value',
				directory: 'test-directory-value',
				engines: {
					node: true,
				},
			},
		],
	},
	{
		test: 'loaded last edition',
		loader: successLoader,
		expected: `${process.versions.node} ok`,
		editions: [
			{
				description: 'is not ok',
				entry: 'test-entry-value',
				directory: 'test-directory-value',
				engines: {
					node: '0.6',
				},
			},
			{
				description: `${process.versions.node} ok`,
				entry: 'test-entry-value',
				directory: 'test-directory-value',
				engines: {
					node: process.versions.node,
				},
			},
		],
	},
	// failure test cases
	{
		test: 'missing editions',
		loader: unexpectedLoader,
		error: 'editions-autoloader-editions-missing',
		editions: null,
	},
	{
		test: 'missing editions',
		loader: unexpectedLoader,
		error: 'editions-autoloader-editions-missing',
		editions: [],
	},
	{
		test: 'missing all fields',
		loader: unexpectedLoader,
		error: 'editions-autoloader-invalid-edition',
		editions: [{}],
	},
	{
		test: 'missing engines',
		loader: unexpectedLoader,
		error: 'editions-autoloader-invalid-edition',
		editions: [
			{
				description: 'test-description-value',
				directory: 'test-directory-value',
				entry: 'test-entry-value',
			},
		],
	},
	{
		test: 'missing entry',
		loader: unexpectedLoader,
		error: 'editions-autoloader-invalid-edition',
		editions: [
			{
				description: 'test-description-value',
				directory: 'test-directory-value',
				engines: false,
			},
		],
	},
	{
		test: 'missing directory',
		loader: unexpectedLoader,
		error: 'editions-autoloader-invalid-edition',
		editions: [
			{
				description: 'test-description-value',
				entry: 'test-entry-value',
				engines: false,
			},
		],
	},
	{
		test: 'missing description',
		loader: unexpectedLoader,
		error: 'editions-autoloader-invalid-edition',
		editions: [
			{
				description: 'test-description-value',
				entry: 'test-entry-value',
				engines: false,
			},
		],
	},
	{
		test: 'skipped due to false engines',
		loader: unexpectedLoader,
		error: 'editions-autoloader-invalid-engines',
		editions: [
			{
				description: 'test-description-value',
				entry: 'test-entry-value',
				directory: 'test-directory-value',
				engines: false,
			},
		],
	},
	{
		test: 'skipped due to missing engines values',
		loader: unexpectedLoader,
		error: 'editions-autoloader-engine-mismatch',
		editions: [
			{
				description: 'test-description-value',
				entry: 'test-entry-value',
				directory: 'test-directory-value',
				engines: {},
			},
		],
	},
	{
		test: 'skipped due to engines.node = false',
		loader: unexpectedLoader,
		error: 'editions-autoloader-engine-unsupported',
		editions: [
			{
				description: 'test-description-value',
				entry: 'test-entry-value',
				directory: 'test-directory-value',
				engines: {
					node: false,
				},
			},
		],
	},
	{
		test: 'skipped due to deliberate failure',
		error: 'editions-autoloader-loader-failed',
		loader: failureLoader,
		editions: [
			{
				description: 'deliberate failure edition',
				entry: 'test-entry-value',
				directory: 'test-directory-value',
				engines: {
					node: true,
				},
			},
		],
	},
	{
		test: 'skipped due to loading failure after broadening',
		loader: failureLoader,
		error: 'editions-autoloader-attempt-broadened',
		editions: [
			{
				description: 'test-description-value',
				entry: 'test-entry-value',
				directory: 'test-directory-value',
				engines: {
					node: '0.6',
				},
			},
		],
	},
	// another pass test case
	{
		test: 'loaded an unsupported node version that could be broadened',
		loader: successLoader,
		expected: `${process.versions.node} ok`,
		editions: [
			{
				description: `${process.versions.node} ok`,
				entry: 'test-entry-value',
				directory: 'test-directory-value',
				engines: {
					node: '0.6',
				},
			},
		],
	},
]

// Test
kava.suite('editions', function (suite) {
	suite('requireEditions', function (suite, test) {
		fixtures.forEach(function (fixture) {
			test(fixture.test, function (done) {
				try {
					const opts: SolicitOptions = {
						loader: fixture.loader,
						versions: processVersions as Versions,
					}
					const result = solicitEdition(fixture.editions as Editions, opts)
					equal(
						result,
						fixture.expected,
						`result [${result}] was as expected [${fixture.expected}]`
					)
				} catch (error: unknown) {
					const stack: string = (error as Error)?.stack || ''
					if (
						excludes(stack, 'unexpected loader failure') &&
						fixture.error &&
						includes(stack, fixture.error)
					) {
						done()
						return
					}
					done(error as Error)
					return
				}
				done()
			})
		})
	})
})
