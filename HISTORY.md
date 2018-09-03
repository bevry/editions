# History

## v2.0.2 2018 September 3
- Fixed `Error: Cannot find module 'editions'` on Windows (caused by edition directories containing `:` which is unsupported on Windows)
    - Regression in v2.0.0
    - Closes
        - [ungit issue #1130](https://github.com/FredrikNoren/ungit/issues/1130)
        - [getmac issue #39](https://github.com/bevry/getmac/issues/39)
        - [docpad issue #1088](https://github.com/docpad/docpad/issues/1088)
        - [bevry thread #240](https://discuss.bevry.me/t/error-cannot-find-module-editions/240)

## v2.0.1 2018 August 24
- Fixed potential `Error: Cannot find module 'editions'` (causes by `main` pointing to a legacy location
    - Regression in v2.0.0
- Added an edition for browsers

## v2.0.0 2018 July 27
- Edition entries must now make use of the fields: `description`, `directory`, `entry`, and the new `engines` field (which follows the [`package.json:engines` spec](https://docs.npmjs.com/files/package.json#engines)).
- In version 1, if an edition failed to load, its syntax combination would be blacklisted. This functionality has been removed. The `engines` field is a better replacement. The `syntaxes` field remains optional, as it is still useful for user configured blacklisting and ecosystem tooling.
- Errors reported by the autoloader have improved readability thanks to [Errlop](https://github.com/bevry/errlop)
- Updated base files

## v1.3.4 2018 January 31
- Updated base files

## v1.3.3 2016 November 4
- Properly add node 0.8 support

## v1.3.2 2016 November 4
- Added node 0.8 support

## v1.3.1 2016 October 11
- Fixed failure to load editions that had the edition directory within the edition entry
  - Thanks to [Jordan Harband](https://github.com/ljharb) for [issue #20](https://github.com/bevry/editions/issues/20)

## v1.3.0 2016 October 11
- Added support for `EDITIONS_SYNTAX_BLACKLIST` environment variable
  - Thanks to [Damon Maria](https://github.com/damonmaria) for [issue #10](https://github.com/bevry/editions/issues/10)
- Dropped need for `DEBUG_BEVRY_EDITIONS` as failures will not output all the necessary debugging information

## v1.2.1 2016 October 10
- Change `esnext` skip from v8 engines < 4 to node engines < 0.12

## v1.2.0 2016 October 10
- Skip syntaxes that require preprocessors
- Skip `import` syntax, as the `module` field inside `package.json` skips the autoloader if supported
- Skip `esnext` syntax on v8 engines < 4

## v1.1.2 2016 June 16
- Parent errors are now displayed in a more sensible way

## v1.1.1 2016 March 20
- Errors and debug messages are now more useful
  - Closes https://github.com/bevry/editions/issues/5

## v1.1.0 2016 March 20
- Added support for custom entry point overrides
- Debugging goes to `console.error` (stderr) rather than `console.log` (stdout)
  - Closes https://github.com/bevry/editions/issues/2
- Added tests
  - Closes https://github.com/bevry/editions/issues/4

## v1.0.1 2016 March 9
- Initial release
