module.exports = {
  roots: ["<rootDir>/test"],
  testMatch: ["**/*-spec.ts"],
  transform: {
    "(firemodel|universal-fire|@forest-fire|lodash-es).+\\.js$": "babel-jest",
    "^.+\\.tsx?$": "ts-jest",
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!(firemodel|universal-fire|@forest-fire|lodash-es)).+\\.js$"],
  moduleNameMapper: {
    "^firemodel$": "<rootDir>/node_modules/firemodel/dist/es/index.js",
    "^universal-fire$": "<rootDir>/node_modules/universal-fire/dist/es/index.js",
    "^lodash-es$": "<rootDir>/node_modules/lodash/index.js",
    // '^@forest-fire/firestore-client$': '<rootDir>/node_modules/@forest-fire/firestore-client/dist/es/index.js',
    // '^@forest-fire/real-time-client$': '<rootDir>/node_modules/@forest-fire/real-time-client/dist/es/index.js',
  },
};
