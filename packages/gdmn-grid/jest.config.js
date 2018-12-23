module.exports = {
    'roots': [
        '<rootDir>/test'
    ],
    'transform': {
        '^.+\\.tsx?$': 'ts-jest'
    },
    'testRegex': '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    'testEnvironment': 'node',
    'moduleFileExtensions': [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
        'node'
    ],
    'reporters': ['default', 'jest-junit']
};
