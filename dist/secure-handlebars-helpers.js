(function(){var privFilters = function () {

    var LT     = /</g,
        QUOT   = /"/g,
        SQUOT  = /'/g,
        NULL   = /\x00/g,
        SPECIAL_ATTR_VALUE_UNQUOTED_CHARS = /(?:^(?:["'`]|\x00+$|$)|[\x09-\x0D >])/g,
        SPECIAL_HTML_CHARS = /[&<>"'`]/g, 
        SPECIAL_COMMENT_CHARS = /(?:\x00|^-*!?>|--!?>|--?!?$|\]>|\]$)/g;

    // CSS sensitive chars: ()"'/,!*@{}:;
    // By CSS: (Tab|NewLine|colon|semi|lpar|rpar|apos|sol|comma|excl|ast|midast);|(quot|QUOT)
    // By URI_PROTOCOL: (Tab|NewLine);
    var SENSITIVE_HTML_ENTITIES = /&(?:#([xX][0-9A-Fa-f]+|\d+);?|(Tab|NewLine|colon|semi|lpar|rpar|apos|sol|comma|excl|ast|midast|ensp|emsp|thinsp);|(nbsp|amp|AMP|lt|LT|gt|GT|quot|QUOT);?)/g,
        SENSITIVE_NAMED_REF_MAP = {Tab: '\t', NewLine: '\n', colon: ':', semi: ';', lpar: '(', rpar: ')', apos: '\'', sol: '/', comma: ',', excl: '!', ast: '*', midast: '*', ensp: '\u2002', emsp: '\u2003', thinsp: '\u2009', nbsp: '\xA0', amp: '&', lt: '<', gt: '>', quot: '"', QUOT: '"'};

    // TODO: CSS_DANGEROUS_FUNCTION_NAME = /(url\(|expression\()/ig;
    var CSS_UNQUOTED_CHARS = /[^%#+\-\w\.]/g,
        // \x7F and \x01-\x1F less \x09 are for Safari 5.0
        CSS_DOUBLE_QUOTED_CHARS = /[\x01-\x1F\x7F\\"]/g,
        CSS_SINGLE_QUOTED_CHARS = /[\x01-\x1F\x7F\\']/g,
        // this assumes encodeURI() and encodeURIComponent() has escaped 1-32, 41, 127 for IE8
        CSS_UNQUOTED_URL = /['\(\)]/g; // " \ treated by encodeURI()   

    // Given a full URI, need to support "[" ( IPv6address ) "]" in URI as per RFC3986
    // Reference: https://tools.ietf.org/html/rfc3986
    var URL_IPV6 = /\/\/%5[Bb]([A-Fa-f0-9:]+)%5[Dd]/;


    // Reference: http://shazzer.co.uk/database/All/characters-allowd-in-html-entities
    // Reference: http://shazzer.co.uk/vector/Characters-allowed-after-ampersand-in-named-character-references
    // Reference: http://shazzer.co.uk/database/All/Characters-before-javascript-uri
    // Reference: http://shazzer.co.uk/database/All/Characters-after-javascript-uri
    // Reference: https://html.spec.whatwg.org/multipage/syntax.html#consume-a-character-reference
    // Reference for named characters: https://html.spec.whatwg.org/multipage/entities.json
    var URI_BLACKLIST_PROTOCOLS = {'javascript':1, 'data':1, 'vbscript':1, 'mhtml':1},
        URI_PROTOCOL_COLON = /(?::|&#[xX]0*3[aA];?|&#0*58;?|&colon;)/,
        URI_PROTOCOL_WHITESPACES = /(?:^[\x00-\x20]+|[\t\n\r\x00]+)/g,
        URI_PROTOCOL_NAMED_REF_MAP = {Tab: '\t', NewLine: '\n'};

    var x, 
        strReplace = String.prototype.replace, 
        fromCodePoint = String.fromCodePoint || function(codePoint) {
            if (arguments.length === 0) {
                return '';
            }
            if (codePoint <= 0xFFFF) { // BMP code point
                return String.fromCharCode(codePoint);
            }

            // Astral code point; split in surrogate halves
            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            codePoint -= 0x10000;
            return String.fromCharCode((codePoint >> 10) + 0xD800, (codePoint % 0x400) + 0xDC00);
        };


    function getProtocol(s) {
        s = s.split(URI_PROTOCOL_COLON, 2);
        return (s.length === 2 && s[0]) ? s[0] : null;
    }

    function stringify(s, callback) {
        return typeof s === 'undefined' ? 'undefined'
             : s === null               ? 'null'
             : callback.apply(s.toString(), [].splice.call(arguments, 2));
    }


    function htmlDecode(s, namedRefMap, reNamedRef, callback) {
        namedRefMap = namedRefMap || SENSITIVE_NAMED_REF_MAP;
        reNamedRef = reNamedRef || SENSITIVE_HTML_ENTITIES;

        var decodedStr, args = [].splice.call(arguments, 4);

        return stringify(s, function() {
            decodedStr = this.replace(NULL, '\uFFFD').replace(reNamedRef, function(m, num, named, named1) {
                if (num) {
                    num = Number(num[0] <= '9' ? num : '0' + num);
                    // switch(num) {
                    //     case 0x80: return '\u20AC';  // EURO SIGN (€)
                    //     case 0x82: return '\u201A';  // SINGLE LOW-9 QUOTATION MARK (‚)
                    //     case 0x83: return '\u0192';  // LATIN SMALL LETTER F WITH HOOK (ƒ)
                    //     case 0x84: return '\u201E';  // DOUBLE LOW-9 QUOTATION MARK („)
                    //     case 0x85: return '\u2026';  // HORIZONTAL ELLIPSIS (…)
                    //     case 0x86: return '\u2020';  // DAGGER (†)
                    //     case 0x87: return '\u2021';  // DOUBLE DAGGER (‡)
                    //     case 0x88: return '\u02C6';  // MODIFIER LETTER CIRCUMFLEX ACCENT (ˆ)
                    //     case 0x89: return '\u2030';  // PER MILLE SIGN (‰)
                    //     case 0x8A: return '\u0160';  // LATIN CAPITAL LETTER S WITH CARON (Š)
                    //     case 0x8B: return '\u2039';  // SINGLE LEFT-POINTING ANGLE QUOTATION MARK (‹)
                    //     case 0x8C: return '\u0152';  // LATIN CAPITAL LIGATURE OE (Œ)
                    //     case 0x8E: return '\u017D';  // LATIN CAPITAL LETTER Z WITH CARON (Ž)
                    //     case 0x91: return '\u2018';  // LEFT SINGLE QUOTATION MARK (‘)
                    //     case 0x92: return '\u2019';  // RIGHT SINGLE QUOTATION MARK (’)
                    //     case 0x93: return '\u201C';  // LEFT DOUBLE QUOTATION MARK (“)
                    //     case 0x94: return '\u201D';  // RIGHT DOUBLE QUOTATION MARK (”)
                    //     case 0x95: return '\u2022';  // BULLET (•)
                    //     case 0x96: return '\u2013';  // EN DASH (–)
                    //     case 0x97: return '\u2014';  // EM DASH (—)
                    //     case 0x98: return '\u02DC';  // SMALL TILDE (˜)
                    //     case 0x99: return '\u2122';  // TRADE MARK SIGN (™)
                    //     case 0x9A: return '\u0161';  // LATIN SMALL LETTER S WITH CARON (š)
                    //     case 0x9B: return '\u203A';  // SINGLE RIGHT-POINTING ANGLE QUOTATION MARK (›)
                    //     case 0x9C: return '\u0153';  // LATIN SMALL LIGATURE OE (œ)
                    //     case 0x9E: return '\u017E';  // LATIN SMALL LETTER Z WITH CARON (ž)
                    //     case 0x9F: return '\u0178';  // LATIN CAPITAL LETTER Y WITH DIAERESIS (Ÿ)
                    // }
                    // // num >= 0xD800 && num <= 0xDFFF, and 0x0D is separately handled, as it doesn't fall into the range of x.pec()
                    // return (num >= 0xD800 && num <= 0xDFFF) || num === 0x0D ? '\uFFFD' : x.frCoPt(num);

                    return num === 0x80 ? '\u20AC'  // EURO SIGN (€)
                            : num === 0x82 ? '\u201A'  // SINGLE LOW-9 QUOTATION MARK (‚)
                            : num === 0x83 ? '\u0192'  // LATIN SMALL LETTER F WITH HOOK (ƒ)
                            : num === 0x84 ? '\u201E'  // DOUBLE LOW-9 QUOTATION MARK („)
                            : num === 0x85 ? '\u2026'  // HORIZONTAL ELLIPSIS (…)
                            : num === 0x86 ? '\u2020'  // DAGGER (†)
                            : num === 0x87 ? '\u2021'  // DOUBLE DAGGER (‡)
                            : num === 0x88 ? '\u02C6'  // MODIFIER LETTER CIRCUMFLEX ACCENT (ˆ)
                            : num === 0x89 ? '\u2030'  // PER MILLE SIGN (‰)
                            : num === 0x8A ? '\u0160'  // LATIN CAPITAL LETTER S WITH CARON (Š)
                            : num === 0x8B ? '\u2039'  // SINGLE LEFT-POINTING ANGLE QUOTATION MARK (‹)
                            : num === 0x8C ? '\u0152'  // LATIN CAPITAL LIGATURE OE (Œ)
                            : num === 0x8E ? '\u017D'  // LATIN CAPITAL LETTER Z WITH CARON (Ž)
                            : num === 0x91 ? '\u2018'  // LEFT SINGLE QUOTATION MARK (‘)
                            : num === 0x92 ? '\u2019'  // RIGHT SINGLE QUOTATION MARK (’)
                            : num === 0x93 ? '\u201C'  // LEFT DOUBLE QUOTATION MARK (“)
                            : num === 0x94 ? '\u201D'  // RIGHT DOUBLE QUOTATION MARK (”)
                            : num === 0x95 ? '\u2022'  // BULLET (•)
                            : num === 0x96 ? '\u2013'  // EN DASH (–)
                            : num === 0x97 ? '\u2014'  // EM DASH (—)
                            : num === 0x98 ? '\u02DC'  // SMALL TILDE (˜)
                            : num === 0x99 ? '\u2122'  // TRADE MARK SIGN (™)
                            : num === 0x9A ? '\u0161'  // LATIN SMALL LETTER S WITH CARON (š)
                            : num === 0x9B ? '\u203A'  // SINGLE RIGHT-POINTING ANGLE QUOTATION MARK (›)
                            : num === 0x9C ? '\u0153'  // LATIN SMALL LIGATURE OE (œ)
                            : num === 0x9E ? '\u017E'  // LATIN SMALL LETTER Z WITH CARON (ž)
                            : num === 0x9F ? '\u0178'  // LATIN CAPITAL LETTER Y WITH DIAERESIS (Ÿ)
                            : (num >= 0xD800 && num <= 0xDFFF) || num === 0x0D ? '\uFFFD'
                            : x.frCoPt(num);
                }
                return namedRefMap[named || named1] || m;
            });
            return callback ? callback.apply(decodedStr, args) : decodedStr;
        });
    }

    function cssEncode(chr) {
        // space after \\HEX is needed by spec
        return '\\' + chr.charCodeAt(0).toString(16).toLowerCase() + ' ';
    }
    function css(s, reSensitiveChars) {
        return htmlDecode(s, null, null, function() {
            return this.replace(reSensitiveChars, cssEncode);
        });
    }
    function cssUrl(s, reSensitiveChars) {
        return htmlDecode(s, null, null, function() {
            // encodeURI() will throw error for use of the CSS_UNSUPPORTED_CODE_POINT (i.e., [\uD800-\uDFFF])
            var s = x.yufull(this), protocol = getProtocol(s);
            // prefix ## for blacklisted protocols
            s = protocol && URI_BLACKLIST_PROTOCOLS[protocol.toLowerCase()] ? '##' + s : s;

            return reSensitiveChars ? s.replace(reSensitiveChars, cssEncode) : s;
        });
    }

    return (x = {
        // turn invalid codePoints and that of non-characters to \uFFFD, and then fromCodePoint()
        frCoPt: function(num) {
            return !isFinite(num) ||            // `NaN`, `+Infinity`, or `-Infinity`
                num <= 0 ||                     // NULL or not a valid Unicode code point
                num > 0x10FFFF ||               // not a valid Unicode code point
                // Math.floor(num) != num || 

                (num >= 0x01 && num <= 0x08) ||
                (num >= 0x0E && num <= 0x1F) ||
                (num >= 0x7F && num <= 0x9F) ||
                (num >= 0xFDD0 && num <= 0xFDEF) ||
                
                 num === 0x0B || 
                (num & 0xFFFF) === 0xFFFF || 
                (num & 0xFFFF) === 0xFFFE ? '\uFFFD' : fromCodePoint(num);
        },
        d: htmlDecode,
        /*
         * @param {string} s - An untrusted uri input
         * @returns {string} s - null if relative url, otherwise the protocol with whitespaces stripped and lower-cased
         */
        yup: function(s) {
            s = getProtocol(s.replace(NULL, ''));
            // URI_PROTOCOL_WHITESPACES is required for left trim and remove interim whitespaces
            return s ? htmlDecode(s, URI_PROTOCOL_NAMED_REF_MAP, null, function() {
                return this.replace(URI_PROTOCOL_WHITESPACES, '').toLowerCase();
            }): null;
        },

        /*
         * @param {string} s - An untrusted user input
         * @returns {string} s - The original user input with & < > " ' ` encoded respectively as &amp; &lt; &gt; &quot; &#39; and &#96;.
         *
         * @description
         * <p>This filter is a fallback to use the standard HTML escaping (i.e., encoding &<>"'`)
         * in contexts that are currently not handled by the automatic context-sensitive templating solution.</p>
         *
         * See workaround at https://github.com/yahoo/xss-filters#warnings
         */
        y: function(s) {
            return stringify(s, strReplace, SPECIAL_HTML_CHARS, function (m) {
                return m === '&' ? '&amp;'
                    :  m === '<' ? '&lt;'
                    :  m === '>' ? '&gt;'
                    :  m === '"' ? '&quot;'
                    :  m === "'" ? '&#39;'
                    :  /*m === '`'*/ '&#96;';       // in hex: 60
            });
        },

        // FOR DETAILS, refer to inHTMLData()
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#data-state
        yd: function (s) {
            return stringify(s, strReplace, LT, '&lt;');
        },

        // FOR DETAILS, refer to inHTMLComment()
        // All NULL characters in s are first replaced with \uFFFD.
        // If s contains -->, --!>, or starts with -*>, insert a space right before > to stop state breaking at <!--{{{yc s}}}-->
        // If s ends with --!, --, or -, append a space to stop collaborative state breaking at {{{yc s}}}>, {{{yc s}}}!>, {{{yc s}}}-!>, {{{yc s}}}->
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#comment-state
        // Reference: http://shazzer.co.uk/vector/Characters-that-close-a-HTML-comment-3
        // Reference: http://shazzer.co.uk/vector/Characters-that-close-a-HTML-comment
        // Reference: http://shazzer.co.uk/vector/Characters-that-close-a-HTML-comment-0021
        // If s contains ]> or ends with ], append a space after ] is verified in IE to stop IE conditional comments.
        // Reference: http://msdn.microsoft.com/en-us/library/ms537512%28v=vs.85%29.aspx
        // We do not care --\s>, which can possibly be intepreted as a valid close comment tag in very old browsers (e.g., firefox 3.6), as specified in the html4 spec
        // Reference: http://www.w3.org/TR/html401/intro/sgmltut.html#h-3.2.4
        yc: function (s) {
            return stringify(s, strReplace, SPECIAL_COMMENT_CHARS, function(m){
                return m === '\x00' ? '\uFFFD'
                    : m === '--!' || m === '--' || m === '-' || m === ']' ? m + ' '
                    :/*
                    :  m === ']>'   ? '] >'
                    :  m === '-->'  ? '-- >'
                    :  m === '--!>' ? '--! >'
                    : /-*!?>/.test(m) ? */ m.slice(0, -1) + ' >';
            });
        },

        // FOR DETAILS, refer to inDoubleQuotedAttr()
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(double-quoted)-state
        yavd: function (s) {
            return stringify(s, strReplace, QUOT, '&quot;');
        },

        // FOR DETAILS, refer to inSingleQuotedAttr()
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(single-quoted)-state
        yavs: function (s) {
            return stringify(s, strReplace, SQUOT, '&#39;');
        },

        // FOR DETAILS, refer to inUnQuotedAttr()
        // PART A.
        // if s contains any state breaking chars (\t, \n, \v, \f, \r, space, and >),
        // they are escaped and encoded into their equivalent HTML entity representations. 
        // Reference: http://shazzer.co.uk/database/All/Characters-which-break-attributes-without-quotes
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state
        //
        // PART B. 
        // if s starts with ', " or `, encode it resp. as &#39;, &quot;, or &#96; to 
        // enforce the attr value (unquoted) state
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#before-attribute-value-state
        // Reference: http://shazzer.co.uk/vector/Characters-allowed-attribute-quote
        // 
        // PART C.
        // Inject a \uFFFD character if an empty or all null string is encountered in 
        // unquoted attribute value state.
        // 
        // Rationale 1: our belief is that developers wouldn't expect an 
        //   empty string would result in ' name="passwd"' rendered as 
        //   attribute value, even though this is how HTML5 is specified.
        // Rationale 2: an empty or all null string (for IE) can 
        //   effectively alter its immediate subsequent state, we choose
        //   \uFFFD to end the unquoted attr 
        //   state, which therefore will not mess up later contexts.
        // Rationale 3: Since IE 6, it is verified that NULL chars are stripped.
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state
        // 
        // Example:
        // <input value={{{yavu s}}} name="passwd"/>
        yavu: function (s) {
            return stringify(s, strReplace, SPECIAL_ATTR_VALUE_UNQUOTED_CHARS, function (m) {
                return m === '\t'   ? '&#9;'  // in hex: 09
                    :  m === '\n'   ? '&#10;' // in hex: 0A
                    :  m === '\x0B' ? '&#11;' // in hex: 0B  for IE. IE<9 \v equals v, so use \x0B instead
                    :  m === '\f'   ? '&#12;' // in hex: 0C
                    :  m === '\r'   ? '&#13;' // in hex: 0D
                    :  m === ' '    ? '&#32;' // in hex: 20
                    :  m === '>'    ? '&gt;'
                    :  m === '"'    ? '&quot;'
                    :  m === "'"    ? '&#39;'
                    :  m === '`'    ? '&#96;'
                    : /*empty or all null*/ '\uFFFD';
            });
        },

        yu: encodeURI,
        yuc: encodeURIComponent,

        // Notice that yubl MUST BE APPLIED LAST, and will not be used independently (expected output from encodeURI/encodeURIComponent and yavd/yavs/yavu)
        // This is used to disable JS execution capabilities by prefixing x- to ^javascript:, ^vbscript: or ^data: that possibly could trigger script execution in URI attribute context
        yubl: function (s) {
            return URI_BLACKLIST_PROTOCOLS[x.yup(s)] ? 'x-' + s : s;
        },

        // This is NOT a security-critical filter.
        // Reference: https://tools.ietf.org/html/rfc3986
        yufull: function (s) {
            return x.yu(s)
                    .replace(URL_IPV6, function(m, p) {
                        return '//[' + p + ']';
                    });
        },



        // The design principle of the CSS filter MUST meet the following goal(s).
        // (1) The input cannot break out of the context (expr) and this is to fulfill the just sufficient encoding principle.
        // (2) The input cannot introduce CSS parsing error and this is to address the concern of UI redressing.
        //
        // term
        //   : unary_operator?
        //     [ NUMBER S* | PERCENTAGE S* | LENGTH S* | EMS S* | EXS S* | ANGLE S* |
        //     TIME S* | FREQ S* ]
        //   | STRING S* | IDENT S* | URI S* | hexcolor | function
        // 
        // Reference:
        // * http://www.w3.org/TR/CSS21/grammar.html 
        // * http://www.w3.org/TR/css-syntax-3/
        // 
        // PART 1. The first rule is to filter out the html encoded string, however this rule can be removed as rule (3) IF '&' is being encoded.
        // PART 2. The second rule remove unsupported code point [\uD800-\uDFFF], it is safe to be empty string.
        // PART 3. The third rule is CSS escaping and depends on 
        // 
        // NOTE: delimitar in CSS - \ _ : ; ( ) " ' / , % # ! * @ . { }
        //
        // PART 4. The forth rule is to blacklist the dangerous function in CSS, however this rule can be removed as rule (3) will encode '()' to '\\3b \\28 ' in UNQUOTED filter,
        // while there is no need to encode it in STRING filter.


        // CSS_UNQUOTED_CHARS = /([^%#\-+_a-z0-9\.])/ig,
        // we allow NUMBER, PERCENTAGE, LENGTH, EMS, EXS, ANGLE, TIME, FREQ, IDENT and hexcolor in UNQUOTED filter without escaping chars [%#\-+_a-z0-9\.].
        yceu: function(s) {
            return css(s, CSS_UNQUOTED_CHARS);
        },

        // string1 = \"([^\n\r\f\\"]|\\{nl}|\\[^\n\r\f0-9a-f]|\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?)*\"
        // CSS_DOUBLE_QUOTED_CHARS = /([\u0000\n\r\f\v\\"])/ig,
        // we allow STRING in QUOTED filter and only escape [\u0000\n\r\f\v\\"] only. (\v is added for IE)
        yced: function(s) {
            return css(s, CSS_DOUBLE_QUOTED_CHARS);
        },

        // string2 = \'([^\n\r\f\\']|\\{nl}|\\[^\n\r\f0-9a-f]|\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?)*\'
        // CSS_SINGLE_QUOTED_CHARS = /([\u0000\n\r\f\v\\'])/ig,
        // we allow STRING in QUOTED filter and only escape [\u0000\n\r\f\v\\'] only. (\v is added for IE)
        yces: function(s) {
            return css(s, CSS_SINGLE_QUOTED_CHARS);
        },


        // for url({{{yceuu url}}}
        // unquoted_url = ([!#$%&*-~]|\\{h}{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])* (CSS 2.1 definition)
        // unquoted_url = ([^"'()\\ \t\n\r\f\v\u0000\u0008\u000b\u000e-\u001f\u007f]|\\{h}{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])* (CSS 3.0 definition)
        // The state machine in CSS 3.0 is more well defined - http://www.w3.org/TR/css-syntax-3/#consume-a-url-token0
        // CSS_UNQUOTED_URL = /(["'\(\)\\ \t\n\r\f\v\u0000\u0008\u000b\u007f\u000e-\u001f])/ig; (\v is added for IE)
        // CSS_UNQUOTED_URL = /(["'\(\)])/ig; (optimized version by chaining with yufull)
        yceuu: function(s) {
            return cssUrl(s, CSS_UNQUOTED_URL);
        },

        // for url("{{{yceud url}}}
        // CSS_DOUBLE_QUOTED_URL = CSS_DOUBLE_QUOTED_CHARS;
        // CSS_DOUBLE_QUOTED_URL has nothing else to escape (optimized version by chaining with yufull)
        yceud: function(s) { 
            return cssUrl(s);
        },

        // for url('{{{yceus url}}}
        // CSS_SINGLE_QUOTED_URL = CSS_SINGLE_QUOTED_CHARS;
        // CSS_SINGLE_QUOTED_URL = /'/g; (optimized version by chaining with yufull)
        yceus: function(s) { 
            return cssUrl(s, SQUOT);
        }
    });
}();/*
Copyright (c) 2015, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.

Authors: Nera Liu <neraliu@yahoo-inc.com>
         Adonis Fung <adon@yahoo-inc.com>
         Albert Yu <albertyu@yahoo-inc.com>
*/
/* jshint node: true, undef: true, unused: true */
/* global Handlebars, privFilters */

(function(Handlebars, filterNames, i, name){
    if (!Handlebars || !Handlebars.registerHelper) {
        throw new ReferenceError('Handlebars is not defined');
    }
    // expect privFilters are available
    for (; (name = filterNames[i]); i++) {
    	Handlebars.registerHelper(name, privFilters[name]);
    }
})(Handlebars, ['y', 'yd', 'yc', 'yavd', 'yavs', 'yavu', 'yu', 'yuc', 'yubl', 'yufull', 'yceu', 'yced', 'yces', 'yceuu', 'yceud', 'yceus'], 0);})()