secure-handlebars-helpers
=========================
[![npm version][npm-badge]][npm]
[![dependency status][dep-badge]][dep-status]
[![Build Status](https://travis-ci.org/yahoo/secure-handlebars-helpers.svg?branch=master)](https://travis-ci.org/yahoo/secure-handlebars-helpers)

This handy *client-side* script registers the required [XSS output filtering functions](https://www.npmjs.com/package/xss-filters) as handlebars' helpers, and is designed ONLY for templates that already have the context-sensitive filter markup (e.g., `<title>{{{yd title}}}</title>`) automatically inserted using [secure-handlebars](https://www.npmjs.com/package/secure-handlebars).

## Quick Start

### Client-side (browser)
Download the latest version at [dist/secure-handlebars-helpers.min.js](./dist/secure-handlebars-helpers.min.js), and embed it **after** the handlebars script file.

```html
<script type="text/javascript" src="dist/handlebars.js"></script>
<script type="text/javascript" src="dist/secure-handlebars-helpers.min.js"></script>

<script type="text/javascript">
var compiledTemplate = Handlebars.compile("<title>{{{yd title}}}</title>");
// html is assigned <title>&lt;script>alert('xss')&lt;/script></title>
var html = compiledTemplate({
    title: "<script>alert('xss')</script>"
});
</script>
```
Note: Read more about the underlying output filtering principle at [xss-filters](https://github.com/yahoo/xss-filters).

## Contribute
To contribute, you will make changes in [`src/`](./src) and [`tests/`](./tests), followed by the following commands:
- ```$ npm run-script build``` to build the standalone JavaScript for client-side use
- ```$ npm test``` to run the tests

## License
This software is free to use under the Yahoo BSD license. 
See the [LICENSE file](./LICENSE) for license text and copyright information.



[npm]: https://www.npmjs.org/package/secure-handlebars-helpers
[npm-badge]: https://img.shields.io/npm/v/secure-handlebars-helpers.svg?style=flat-square
[dep-status]: https://david-dm.org/yahoo/secure-handlebars-helpers
[dep-badge]: https://img.shields.io/david/yahoo/secure-handlebars-helpers.svg?style=flat-square
