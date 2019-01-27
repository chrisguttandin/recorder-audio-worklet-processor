module.exports = {
    build: [
        'clean:build',
        'sh:build-es2018',
        'sh:build-es5'
    ],
    lint: [
        'eslint',
        // @todo Use grunt-lint again when it support the type-check option.
        'sh:lint'
    ],
    test: [
        'sh:test-integration',
        'sh:test-unit'
    ]
};
