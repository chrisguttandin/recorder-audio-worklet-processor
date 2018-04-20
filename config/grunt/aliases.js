module.exports = {
    build: [
        'clean:build',
        'sh:build-es2015',
        'sh:build-es5',
        'sh:build-esm',
        'webpack'
    ],
    continuous: [
        // @todo This is broken now.
        'karma:continuous'
    ],
    lint: [
        'eslint',
        // @todo Use grunt-lint again when it support the type-check option.
        'sh:lint'
    ],
    // @todo Enable expectation tests for Safari again when SauceLabs supports Safari 11.1.
    test: (process.env.TRAVIS)
        ? [ 'karma:test-integration', 'karma:test-unit' ]
        : [ 'karma:test-integration', 'karma:test-unit', 'karma:test-expectation-safari' ]
};
