import { join, absolute } from '@codesandbox/common/lib/utils/path';
import Preset from '..';

import typescriptTranspiler from '../../transpilers/typescript';
import rawTranspiler from '../../transpilers/raw';
import jsonTranspiler from '../../transpilers/json';
import stylesTranspiler from '../../transpilers/style';
import dojoStylesTranspiler from './transpilers/style';
import babelTranspiler from '../../transpilers/babel';
// import { Module } from '../../entities/module';
import TranspiledModule from '../../transpiled-module';

async function evaluateConfig(manager) {
  const { dojo } = manager.configurations;
  if (dojo && dojo.parsed && dojo.parsed['build-app']) {
    const config = dojo.parsed['build-app'];
    const {
      locale: defaultLocale = 'en',
      supportedLocales = [],
      cldrPaths = [],
    } = config;
    const locales = [defaultLocale, ...supportedLocales];

    const code = `
      (() => {
      const { deepAssign } = require('@dojo/framework/core/util');
      const i18n = require('@dojo/framework/i18n/i18n');
      const loadCldrData = require('@dojo/framework/i18n/cldr/load').default;
      const systemLocale = i18n.systemLocale;

      const userLocale = systemLocale.replace(/^([a-z]{2}).*/i, '$1');
      const locales = ${JSON.stringify(locales)};
      const cldrPaths = ${JSON.stringify(cldrPaths)};
      const cldrData = cldrPaths
        .map(url => locales.map(locale => url.replace('{locale}', locale)))
        .reduce((left, right) => left.concat(right), [])
        .map(mid => require(mid))
        .reduce((cldrData, source) => deepAssign(cldrData, source), Object.create(null));
      loadCldrData(JSON.stringify(cldrData));
      })();
    `;

    const module = { code, path: 'build-app.js' };
    const tModule = new TranspiledModule(module);
    await tModule.transpile(manager);
    tModule.setIsEntry(true);
    tModule.evaluate(manager);
  }
}

export default function initialize() {
  const preset = new Preset(
    '@dojo/cli-create-app',
    ['ts', 'tsx', 'js', 'json'],
    {},
    {
      setup: async manager => {
        const stylesPath = absolute(join('src', 'main.css'));
        await evaluateConfig(manager);
        try {
          const tModule = await manager.resolveTranspiledModuleAsync(
            stylesPath,
            null
          );
          await tModule.transpile(manager);
          tModule.setIsEntry(true);
          tModule.evaluate(manager);
        } catch (e) {
          if (e.type === 'module-not-found') {
            // Do nothing
          } else {
            throw e;
          }
        }
      },
    }
  );

  preset.registerTranspiler(module => /\.tsx?$/.test(module.path), [
    { transpiler: typescriptTranspiler },
  ]);

  preset.registerTranspiler(module => /\.jsx?$/.test(module.path), [
    {
      transpiler: babelTranspiler,
      options: {
        isV7: true,
        config: {
          parserOpts: {
            plugins: ['objectRestSpread'],
          },
        },
      },
    },
  ]);

  preset.registerTranspiler(module => /\.json$/.test(module.path), [
    { transpiler: jsonTranspiler },
  ]);

  preset.registerTranspiler(module => /\.m\.css$/.test(module.path), [
    { transpiler: dojoStylesTranspiler },
  ]);

  preset.registerTranspiler(module => /\.css$/.test(module.path), [
    { transpiler: stylesTranspiler },
  ]);

  preset.registerTranspiler(() => true, [{ transpiler: rawTranspiler }]);

  return preset;
}
