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
    if (!Handlebars || !Handlebars.registerHelper) {
        throw new ReferenceError('Handlebars is not defined');
    }
    // expect privFilters are available
    for (; (name = filterNames[i]); i++) {
    	Handlebars.registerHelper(name, privFilters[name]);
    }
})(Handlebars, ['y', 'yd', 'yc', 'yavd', 'yavs', 'yavu', 'yu', 'yuc', 'yubl', 'yufull', 'yceu', 'yced', 'yces', 'yceuu', 'yceud', 'yceus'], 0);