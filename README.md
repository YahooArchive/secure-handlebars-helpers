secure-handlebars-helpers
=========================

This handy *client-side* script registers the required secure XSS output filters as handlebars' helpers, and is designed ONLY for  
- templates processed with context-sensitive filters automatically inserted (e.g., `<title>{{{yd title}}}</title>`) using [context-parser-handlebars](https://www.npmjs.com/package/context-parser-handlebars).

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

### How to build
```
npm install
grunt
```

### How to test
```
grunt test
```

## License
This software is free to use under the Yahoo BSD license. 
See the [LICENSE file](./LICENSE) for license text and copyright information.