/*
Copyright (c) 2015, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.

Authors: Nera Liu <neraliu@yahoo-inc.com>
         Adonis Fung <adon@yahoo-inc.com>
         Albert Yu <albertyu@yahoo-inc.com>
*/

var filter = Handlebars.helpers;

var filterNames = [
	'y', 
	'yd', 'yc', 
	'yavd', 'yavs', 'yavu',
	'yu', 'yuc',
	'yubl', 'yufull'
];

console.log('Integration test with Handlebars v' + Handlebars.VERSION);

describe("Handlebars inclusion tests", function() {
    it('Handlebars.registerHelper exists', function() {
    	expect(Handlebars).to.be.ok();
        expect(Handlebars.registerHelper).to.be.ok();
    });
});

describe("secure handlebars helpers: existence tests", function() {
	
	filterNames.forEach(function(name){
		it('filter ' + name + ' exists', function() {
			expect(filter[name]).to.be.ok();
		});
	});
});

describe("secure handlebars helpers: error tests", function() {


    it('filters handling of undefined input', function() {
        
        expect(filter.yd()).to.eql('undefined');
        expect(filter.yc()).to.eql('undefined');
        
        expect(filter.yavd()).to.eql('undefined');
        expect(filter.yavs()).to.eql('undefined');
        expect(filter.yavu()).to.eql('undefined');
        
        expect(filter.yu()).to.eql('undefined');
        expect(filter.yuc()).to.eql('undefined');
        expect(filter.yufull()).to.eql('undefined');
        // yubl will not be independently used
        // expect(filter.yubl()).to.eql('undefined');


    	expect(filter.y()).to.eql('undefined');
    });

});


/* the functional test is tested against in the contextparse-filters */
describe("secure handlebars helpers: compilation tests", function() {
    var compilation_test = function(html, json) {
        var template = Handlebars.compile(html);
        var output = template(json);
        return output;
    };

    it('filter yd test', function() {
        var html = "<title>{{{yd title}}}</title>";
        var json = {title: "my foo< title"};
        var output = compilation_test(html, json);
        expect(output).to.eql("<title>my foo&lt; title</title>");
    });

    it('filter yc test', function() {
        var html = "<!--{{{yc comment0}}}{{{yc comment1}}}{{{yc comment2}}}{{{yc comment3}}}{{{yc comment4}}}-->";
        var json = {comment0: '[if IE]>', 
        			comment1: "--> --!> --!", 
        			comment2: "--", 
        			comment3: '-',
        			comment4: ']'};
        var output = compilation_test(html, json);
        expect(output).to.eql("<!--[if IE] >-- > --! > --! -- - ] -->");
    });

    it('filter yavu test', function() {
        var html = "<input name={{{yavu name}}} value={{{yavu value}}} id={{{yavu id}}} />";
        var json = {name: "\"\t\n\f >", value: "", id: "'"};
        var output = compilation_test(html, json);
        expect(output).to.eql("<input name=&quot;&#9;&#10;&#12;&#32;&gt; value=\u0000 id=&#39; />");
    });

    it('filter yavs test', function() {
        var html = "<div id='{{{yavs name}}}'></div>";
        var json = {name: "divid"};
        var output = compilation_test(html, json);
        expect(output).to.eql("<div id='divid'></div>");
    });

    it('filter yavd test', function() {
        var html = '<div id="{{{yavd name}}}"></div>';
        var json = {name: "divid"};
        var output = compilation_test(html, json);
        expect(output).to.eql('<div id="divid"></div>');
    });

    it('chained filter - yubl yavd yufull test', function() {
    	var html = '<a href="{{{yubl (yavd (yufull url))}}}">link</a>';
        var json = {url: "javascript :alert(0);"};
        var output = compilation_test(html, json);
        expect(output).to.eql('<a href="javascript%20:alert(0);">link</a>');

        var html = '<a href="{{{yubl (yavd (yufull url))}}}">link</a>';
        var json = {url: "javascript:alert(0);"};
        var output = compilation_test(html, json);
        expect(output).to.eql('<a href="x-javascript:alert(0);">link</a>');

        var html = '<a href="{{{yubl (yavd (yufull url))}}}">Yahoo</a>';
        var json = {url: "http://www.yahoo.com"};
        var output = compilation_test(html, json);
        expect(output).to.eql('<a href="http://www.yahoo.com">Yahoo</a>');

        var html = '<a href="{{{yubl (yavd (yufull url))}}}">Somewhere</a>';
        var json = {url: "http://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]"};
        var output = compilation_test(html, json);
        expect(output).to.eql('<a href="http://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]">Somewhere</a>');
    });

    it('chained filter - yubl yavs yufull test', function() {
        var html = "<a href='{{{yubl (yavs (yufull url))}}}'>link</a>";
        var json = {url: "javascript:alert(0);"};
        var output = compilation_test(html, json);
        expect(output).to.eql("<a href='x-javascript:alert(0);'>link</a>");

        var html = "<a href='{{{yubl (yavs (yufull url))}}}'>Yahoo</a>";
        var json = {url: "http://www.yahoo.com"};
        var output = compilation_test(html, json);
        expect(output).to.eql("<a href='http://www.yahoo.com'>Yahoo</a>");
    });

    it('chained filter - yubl yavu yufull test', function() {
        var html = '<a href={{{yubl (yavu (yufull url))}}}>link</a>';
        var json = {url: "javascript:alert(0);"};
        var output = compilation_test(html, json);
        expect(output).to.eql('<a href=x-javascript:alert(0);>link</a>');

        var html = '<a href={{{yubl (yavu (yufull url))}}}>Yahoo</a>';
        var json = {url: "http://www.yahoo.com"};
        var output = compilation_test(html, json);
        expect(output).to.eql('<a href=http://www.yahoo.com>Yahoo</a>');
    });


    it('chained filter - yubl yavd yu test', function() {
        var html = '<a href="/{{{yubl (yavd (yu p))}}}">link</a>';
        var json = {p: "path"};
        var output = compilation_test(html, json);
        expect(output).to.eql('<a href="/path">link</a>');
    });

    it('chained filter - yavd yuc test', function() {
        var html = '<a href="http://www.yahoo.com?q={{{yavd (yuc v)}}}">link</a>';
        var json = {v: "value"};
        var output = compilation_test(html, json);
        expect(output).to.eql('<a href="http://www.yahoo.com?q=value">link</a>');
    });



    it('filter y test', function() {
        var html = '<script>{{{y script}}}</script>';
        var json = {script: "&<>'\"&<>'\""};
        var output = compilation_test(html, json);
        expect(output).to.eql('<script>&amp;&lt;&gt;&#39;&quot;&amp;&lt;&gt;&#39;&quot;</script>');
    });


});
