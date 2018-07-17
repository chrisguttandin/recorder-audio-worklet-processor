const { env } = require('process');

module.exports = (config) => {

    config.set({

        basePath: '../../',

        browserNoActivityTimeout: 420000,

        client: {
            mochaWebWorker: {
                evaluate: {
                    // This is basically a part of the functionality which karma-sinon-chai would provide in a Window.
                    beforeRun : `(function(self) {
                        self.should = null;
                        self.should = self.chai.should();
                        self.expect = self.chai.expect;
                        self.assert = self.chai.assert;
                    })(self);`
                },
                pattern: [
                    '**/chai/**',
                    '**/leche/**',
                    '**/lolex/**',
                    '**/sinon/**',
                    '**/sinon-chai/**',
                    'test/expectation/safari/**/*.js'
                ]
            }
        },

        concurrency: 1,

        files: [
            {
                included: false,
                pattern: 'test/expectation/safari/**/*.js',
                served: true,
                watched: true
            }
        ],

        frameworks: [
            'mocha-webworker',
            'sinon-chai'
        ],

        mime: {
            'text/x-typescript': [ 'ts', 'tsx' ]
        },

        preprocessors: {
            'test/expectation/safari/**/*.js': 'webpack'
        },

        webpack: {
            mode: 'development',
            module: {
                rules: [ {
                    test: /\.ts?$/,
                    use: {
                        loader: 'ts-loader'
                    }
                } ]
            },
            resolve: {
                extensions: [ '.js', '.ts' ]
            }
        },

        webpackMiddleware: {
            noInfo: true
        }

    });

    if (env.TRAVIS) {

        config.set({

            browsers: [
                'SafariSauceLabs'
            ],

            captureTimeout: 120000,

            customLaunchers: {
                SafariSauceLabs: {
                    base: 'SauceLabs',
                    browserName: 'safari',
                    platform: 'OS X 10.12'
                }
            },

            tunnelIdentifier: env.TRAVIS_JOB_NUMBER

        });

    } else {

        config.set({

            browsers: [
                'Safari'
            ]

        });

    }

};
