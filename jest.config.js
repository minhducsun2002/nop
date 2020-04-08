module.exports = {
    "roots": [
        "<rootDir>/tests",
        // "<rootDir>/src"
    ],
    "testMatch": [
        "**/*.test.(ts|tsx)",
        "**/tests/*.(ts|tsx)"
    ],
    "transform": {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    verbose: true
}