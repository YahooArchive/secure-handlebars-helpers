/*
Copyright (c) 2015, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['src/*.js'],
      options: {
        scripturl: true,
        camelcase: true,
        unused: true
      }
    },
    browserify: {
      client: {
        src: [ 'src/<%= pkg.name %>.js' ],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/**\n'
              + ' * <%= pkg.name %> - v<%= pkg.version %>\n'
              + ' * Yahoo! Inc. Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.\n'
              + ' */\n'
      },
      build: {
        files: [{
          'dist/<%= pkg.name %>.min.js': 'dist/<%= pkg.name %>.js',
          'dist/<%= pkg.name %>.min.<%= pkg.version %>.js': 'dist/<%= pkg.name %>.js'
        }]
      }
    },
    bower: {
      forTests: {
        options: {
          targetDir: 'tests/bower_components',
          cleanup: true
        }
      }
    },
    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      integrateHB1: {
        options: {
          files: [
            'tests/bower_components/expect/index.js',
            'tests/bower_components/handlebars-1.3/handlebars.js',
            'dist/secure-handlebars-helpers.min.js',
            'tests/integration/spec/*.js'
          ],
          junitReporter: {
              outputFile: './artifacts/test/node-test-results(hbv1).xml'
          }
        }
      },
      integrateHB2: {
        options: {
          files: [
            'tests/bower_components/expect/index.js',
            'tests/bower_components/handlebars-2.0/handlebars.js',
            'dist/secure-handlebars-helpers.min.js',
            'tests/integration/spec/*.js'
          ],
          junitReporter: {
              outputFile: './artifacts/test/node-test-results(hbv2).xml'
          }
        }
      },
      integrateHB3: {
        options: {
          files: [
            'tests/bower_components/expect/index.js',
            'tests/bower_components/handlebars-3.0/handlebars.js',
            'dist/secure-handlebars-helpers.min.js',
            'tests/integration/spec/*.js'
          ],

          reporters: ['coverage', 'junit', 'progress'],

          // Test coverage
          preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            'dist/secure-handlebars-helpers.min.js': 'coverage'
          },

          // optionally, configure the reporter
          coverageReporter: {
            reporters: [
              { type: 'lcov', dir: './artifacts/', subdir: 'coverage' },
              { type: 'json', dir: './artifacts/', subdir: 'coverage' }
              //{ type: 'text' }
            ]
          },

          junitReporter: {
            outputFile: './artifacts/test/node-test-results.xml'
          }

        }
      }
    },
    clean: {
      all: ['artifacts', 'coverage', 'node_modules', 'tests/bower_components']
    }
  });

  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('build', ['browserify', 'uglify']);
  grunt.registerTask('test', ['jshint', 'bower', 'karma']);

  grunt.registerTask('default', ['build', 'test']);

};
