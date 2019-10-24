import { ConfigurationFile } from '../types';

const config: ConfigurationFile = {
  title: '.dojorc',
  type: 'dojo',
  description:
    'The configuration used for @dojo/cli-build-app, the cli to run dojo projects.',
  moreInfoUrl: 'https://github.com/dojo/cli-build-app#configuration',
  getDefaultCode: () => JSON.stringify({}),
};

export default config;
