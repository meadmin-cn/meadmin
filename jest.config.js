const { pathsToModuleNameMapper } = require('ts-jest');
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
const { compilerOptions } = require('./tsconfig');

const { defaults } = require('jest-config');
module.exports = {
    'moduleFileExtensions': [
        ...defaults.moduleFileExtensions,
    ],
    'rootDir': '.',
    'testEnvironment': 'node',
    'testRegex': '.*\\.spec\\.ts$',
    'transform': {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    "coverageDirectory": "../coverage",
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths , { prefix: '<rootDir>/' } ),
    globals: {
        "ts-jest": {
            "tsConfig": "./tsconfig.json"
        }
    }
};