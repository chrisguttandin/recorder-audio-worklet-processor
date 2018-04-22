module.exports = {
    'continuous': {
        configFile: 'config/karma/config.js'
    },
    'test-expectation-safari': {
        configFile: 'config/karma/config-expectation-safari.js',
        singleRun: true
    },
    'test-integration': {
        configFile: 'config/karma/config-integration.js',
        singleRun: true
    },
    'test-unit': {
        configFile: 'config/karma/config-unit.js',
        singleRun: true
    }
};
