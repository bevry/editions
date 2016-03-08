<!-- TITLE/ -->

<h1>editions</h1>

<!-- /TITLE -->


<!-- BADGES/ -->

<span class="badge-travisci"><a href="http://travis-ci.org/bevry/editions" title="Check this project's build status on TravisCI"><img src="https://img.shields.io/travis/bevry/editions/master.svg" alt="Travis CI Build Status" /></a></span>
<span class="badge-npmversion"><a href="https://npmjs.org/package/editions" title="View this project on NPM"><img src="https://img.shields.io/npm/v/editions.svg" alt="NPM version" /></a></span>
<span class="badge-npmdownloads"><a href="https://npmjs.org/package/editions" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/editions.svg" alt="NPM downloads" /></a></span>
<span class="badge-daviddm"><a href="https://david-dm.org/bevry/editions" title="View the status of this project's dependencies on DavidDM"><img src="https://img.shields.io/david/bevry/editions.svg" alt="Dependency Status" /></a></span>
<span class="badge-daviddmdev"><a href="https://david-dm.org/bevry/editions#info=devDependencies" title="View the status of this project's development dependencies on DavidDM"><img src="https://img.shields.io/david/dev/bevry/editions.svg" alt="Dev Dependency Status" /></a></span>
<br class="badge-separator" />
<span class="badge-slackin"><a href="https://slack.bevry.me" title="Join this project's slack community"><img src="https://slack.bevry.me/badge.svg" alt="Slack community badge" /></a></span>
<span class="badge-patreon"><a href="http://patreon.com/bevry" title="Donate to this project using Patreon"><img src="https://img.shields.io/badge/patreon-donate-yellow.svg" alt="Patreon donate button" /></a></span>
<span class="badge-gratipay"><a href="https://www.gratipay.com/bevry" title="Donate weekly to this project using Gratipay"><img src="https://img.shields.io/badge/gratipay-donate-yellow.svg" alt="Gratipay donate button" /></a></span>
<span class="badge-flattr"><a href="https://flattr.com/profile/balupton" title="Donate to this project using Flattr"><img src="https://img.shields.io/badge/flattr-donate-yellow.svg" alt="Flattr donate button" /></a></span>
<span class="badge-paypal"><a href="https://bevry.me/paypal" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>
<span class="badge-bitcoin"><a href="https://bevry.me/bitcoin" title="Donate once-off to this project using Bitcoin"><img src="https://img.shields.io/badge/bitcoin-donate-yellow.svg" alt="Bitcoin donate button" /></a></span>
<span class="badge-wishlist"><a href="https://bevry.me/wishlist" title="Buy an item on our wishlist for us"><img src="https://img.shields.io/badge/wishlist-donate-yellow.svg" alt="Wishlist browse button" /></a></span>

<!-- /BADGES -->


<!-- DESCRIPTION/ -->

Publish multiple editions for your JavaScript packages consistently and easily (e.g. source edition, esnext edition, es2015 edition)

<!-- /DESCRIPTION -->


<!-- INSTALL/ -->

<h2>Install</h2>

<a href="https://npmjs.com" title="npm is a package manager for javascript"><h3>NPM</h3></a><ul>
<li>Install: <code>npm install --save editions</code></li>
<li>Use: <code>require('editions')</code></li></ul>

<a href="http://browserify.org" title="Browserify lets you require('modules') in the browser by bundling up all of your dependencies"><h3>Browserify</h3></a><ul>
<li>Install: <code>npm install --save editions</code></li>
<li>Use: <code>require('editions')</code></li>
<li>CDN URL: <code>//wzrd.in/bundle/editions@1.0.0</code></li></ul>

<a href="http://enderjs.com" title="Ender is a full featured package manager for your browser"><h3>Ender</h3></a><ul>
<li>Install: <code>ender add editions</code></li>
<li>Use: <code>require('editions')</code></li></ul>

<!-- /INSTALL -->


## Usage

### Implementation

Inside the same directory as your `package.json` file, create a `index.js` file that contains:

``` javascript
module.exports = require('editions').requirePackage(__dirname, require)
```

Inside your `package.json` file, add the following, however make it based on your own editions and [syntaxes](https://github.com/bevry/editions/wiki/Syntaxes):

``` json
{
  "editions": [
    {
      "syntaxes": ["esnext", "require", "arrows", "const", "let", "destructuring", "flow type comments"],
      "entry": "source/index.js"
    }, {
      "syntaxes": ["es2015", "require"],
      "entry": "es2015/index.js"
    }
  ],
  "main": "index.js"
}
```

The `editions` property defines our editions. The order of editions are in descending order of preference. In other words, the first edition is indicated as most preferable so is attempted to load first, if its syntaxes are not unsupported, then it will try to load, if it cannot be loaded, then that syntax combination is marked as unsupported, and the next edition is attempted, and the next, and the next, until either one is used sucessfully, or none can be used, in which case an error is thrown which is expected as that situation means the current environment could not run any of our package's editions.

The first edition should always be the edition that is closest to your source code, and the last edition should always be the edition that is most widely compatible.

Setting the environment variable `DEBUG_BEVRY_EDITIONS` to `true` will output debug information when an edition fails to load.


### Browsers

If you are writing a package that could be used on both the client and the server, then you probably also want to include these too:

``` json
{
  "jsnext:main": "source/index.js",
  "browser": "es2015/index.js",
  "jspm": {
    "main": "source/index.js"
  }
}
```

- `jsnext:main` is used for [rollup](http://rollupjs.org), and should point to your non-custom esnext edition
- `browser` is used for [browserify](http://browserify.org), and should point to your es2015 edition
- `jspm` is used for [jspm](http://jspm.io), and should point to your non-custom esnext edition


### Combinations

Here are some example configurations for your edition inspiration:

- your source is an esnext edition, and compiles down to an es2015 edition, like [this package](https://github.com/bevry/editions)
  - `jsnext:main` and `jspm.main` point to the source edition's entry point
  - `browser` points to the es2015 edition's entry point
- your source is an esnext + jsx edition, and compiles down to a esnext edition (no jsx), as well as an es2015 edition
  - `jsnext:main` and `jspm.main` point to the esnext edition's entry point
  - `browser` points to the es2015 edition's entry point
- your source is a coffeescript edition, and compiles down to an es5 edition
  - `jsnext:main`, `jspm.main` and `browser` point to the es5 edition's entry point


### Suggestions

If you haven't setup your build/compilation tooling yet, we can suggest [bevry/base](https://github.com/bevry/base) for getting up and running.

[Our Wiki also contains extra resources, guides and examples.](https://github.com/bevry/editions/wiki)


<!-- HISTORY/ -->

<h2>History</h2>

<a href="https://github.com/bevry/editions/releases">Discover the release history by heading on over to the releases page.</a>

<!-- /HISTORY -->


<!-- CONTRIBUTE/ -->

<h2>Contribute</h2>

<a href="https://github.com/bevry/editions/blob/master/CONTRIBUTING.md#files">Discover how you can contribute by heading on over to the <code>CONTRIBUTING.md</code> file.</a>

<!-- /CONTRIBUTE -->


<!-- BACKERS/ -->

<h2>Backers</h2>

<h3>Maintainers</h3>

These amazing people are maintaining this project:

<ul><li><a href="https://balupton.com">Benjamin Lupton</a> — <a href="https://github.com/bevry/editions/commits?author=balupton" title="View the GitHub contributions of Benjamin Lupton on repository bevry/editions">view contributions</a></li></ul>

<h3>Sponsors</h3>

No sponsors yet! Will you be the first?

<span class="badge-patreon"><a href="http://patreon.com/bevry" title="Donate to this project using Patreon"><img src="https://img.shields.io/badge/patreon-donate-yellow.svg" alt="Patreon donate button" /></a></span>
<span class="badge-gratipay"><a href="https://www.gratipay.com/bevry" title="Donate weekly to this project using Gratipay"><img src="https://img.shields.io/badge/gratipay-donate-yellow.svg" alt="Gratipay donate button" /></a></span>
<span class="badge-flattr"><a href="https://flattr.com/profile/balupton" title="Donate to this project using Flattr"><img src="https://img.shields.io/badge/flattr-donate-yellow.svg" alt="Flattr donate button" /></a></span>
<span class="badge-paypal"><a href="https://bevry.me/paypal" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>
<span class="badge-bitcoin"><a href="https://bevry.me/bitcoin" title="Donate once-off to this project using Bitcoin"><img src="https://img.shields.io/badge/bitcoin-donate-yellow.svg" alt="Bitcoin donate button" /></a></span>
<span class="badge-wishlist"><a href="https://bevry.me/wishlist" title="Buy an item on our wishlist for us"><img src="https://img.shields.io/badge/wishlist-donate-yellow.svg" alt="Wishlist browse button" /></a></span>

<h3>Contributors</h3>

These amazing people have contributed code to this project:

<ul><li><a href="https://balupton.com">Benjamin Lupton</a> — <a href="https://github.com/bevry/editions/commits?author=balupton" title="View the GitHub contributions of Benjamin Lupton on repository bevry/editions">view contributions</a></li></ul>

<a href="https://github.com/bevry/editions/blob/master/CONTRIBUTING.md#files">Discover how you can contribute by heading on over to the <code>CONTRIBUTING.md</code> file.</a>

<!-- /BACKERS -->


<!-- LICENSE/ -->

<h2>License</h2>

Unless stated otherwise all works are:

<ul><li>Copyright &copy; 2016+ <a href="http://bevry.me">Bevry Pty Ltd</a></li></ul>

and licensed under:

<ul><li><a href="http://spdx.org/licenses/MIT.html">MIT License</a></li></ul>

<!-- /LICENSE -->
