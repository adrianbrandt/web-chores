import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1"
    },
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/'
    ],

    testMatch: [
        "**/__tests__/**/*.ts?(x)",
        "**/?(*.)+(spec|test).ts?(x)",
        "src/tests/**/*.ts?(x)"
    ],

    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/generated/**",
        "!src/tests/**",
        "!src/**/*.d.ts"
    ]
};

export default config;