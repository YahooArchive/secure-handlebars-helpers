/*
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

    if (!Handlebars || !Handlebars.registerHelper || !Handlebars.Utils.escapeExpression) {
        throw new ReferenceError('Handlebars is not defined');
    }

    Handlebars.registerHelper('y', Handlebars.Utils.escapeExpression);

    // don't escape SafeStrings, since they're already safe according to Handlebars
    // Reference: https://github.com/wycats/handlebars.js/blob/master/lib/handlebars/utils.js#L63-L82
    function safeStringCompatibleFilter (filterName) {
        return function (s) {
            // Unlike escapeExpression(), return s instead of s.toHTML() since downstream
            //  filters of the same chain has to be disabled too.
            //  Handlebars will invoke SafeString.toString() at last during data binding
            return (s && s.toHTML) ? s : privFilters[filterName](s);
        };
    }

    // expect privFilters are available
    for (; (name = filterNames[i]); i++) {
    	Handlebars.registerHelper(name, safeStringCompatibleFilter(name));
    }
})(Handlebars, ['yd', 'yc', 'yavd', 'yavs', 'yavu', 'yu', 'yuc', 'yubl', 'yufull', 'yceu', 'yced', 'yces', 'yceuu', 'yceud', 'yceus'], 0);