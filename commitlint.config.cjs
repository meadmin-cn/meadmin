const releaseItConfig = require('./.release-it.json');

const enmus = {};
releaseItConfig.plugins['@release-it/conventional-changelog'].preset.types.forEach((item) => {
  enmus[item.type] = {
    description: item.section,
    title: item.type,
  };
});
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-empty': [2, 'never'], // type 不为空
    'type-enum': [2, 'always', releaseItConfig.plugins['@release-it/conventional-changelog'].preset.types.map((item) => item.type)],
  },
  prompt: {
    questions: {
      type: {
        enum: enmus,
      },
    },
  },
};
