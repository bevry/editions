# History

## v1.2.0 2016 October 10
- Skip syntaxes that require preprocessors
- Skip `import` syntax, as the `module` field inside `package.json` skips the autoloader if supported
- Skip `esnext` syntax on v8 engines <= 4 as esnext is unsupported in those environments

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
