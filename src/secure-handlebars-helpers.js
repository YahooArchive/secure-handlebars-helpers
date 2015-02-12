/*
Copyright (c) 2015, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.

Authors: Nera Liu <neraliu@yahoo-inc.com>
         Adonis Fung <adon@yahoo-inc.com>
         Albert Yu <albertyu@yahoo-inc.com>
*/
/* jshint undef: true, unused: true */
/* global Handlebars, require */
(function () {
    "use strict";
    if (!Handlebars || !Handlebars.registerHelper) {
        throw new ReferenceError("secure-handlebars: Handlebars is not defined");
    }

    var privateFilters = require('xss-filters/src/private-xss-filters');
    [
        'y',
        'yd', 'yc', 
        'yavd', 'yavs', 'yavu',
        'yu', 'yuc',
        'yubl', 'yufull'
    ].forEach(function(filterName){
        Handlebars.registerHelper(filterName, privateFilters[filterName]);
    });

})();