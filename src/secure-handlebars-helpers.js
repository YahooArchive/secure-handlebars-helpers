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

if (!Handlebars || !Handlebars.registerHelper) {
    throw new ReferenceError('secure-handlebars: Handlebars is not defined');
}

// expect privFilters are available

[
    'y',
    'yd', 'yc', 
    'yavd', 'yavs', 'yavu',
    'yu', 'yuc',
    'yubl', 'yufull'
].forEach(function(filterName){
    Handlebars.registerHelper(filterName, privFilters[filterName]);
});