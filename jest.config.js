const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testTimeout: 120000,
  workerThreads: true,
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
};