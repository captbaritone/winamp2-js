module.exports = {
  displayName: "test",
  rootDir: "../",
  testRegex: "\\.test\\.(js|ts|tsx)$",
  globals: {
    SENTRY_DSN: null
  },
  moduleFileExtensions: ["js", "tsx", "ts"],
  moduleNameMapper: {
    "\\.css$": "<rootDir>/src/js/__mocks__/styleMock.js",
    "\\.wsz$": "<rootDir>/src/js/__mocks__/fileMock.js",
    "\\.mp3$": "<rootDir>/src/js/__mocks__/fileMock.js"
  },
  transform: {
    "^.+\\.(js|ts|tsx)$": "babel-jest"
  }
};
