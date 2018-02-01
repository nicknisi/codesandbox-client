import Preset from '../';

import typescriptTranspiler from '../../transpilers/typescript';
import rawTranspiler from '../../transpilers/raw';
import jsonTranspiler from '../../transpilers/json';
import stylesTranspiler from '../../transpilers/style';
import babelTranspiler from '../../transpilers/babel';

export default function initialize() {
  const preset = new Preset('@dojo/cli', [
    'web.ts',
    'ts',
    'json',
    'web.tsx',
    'tsx',
    'js'
  ]);

  preset.registerTranspiler(module => /\.tsx?$/.test(module.path), [
    { transpiler: typescriptTranspiler }
  ]);

  preset.registerTranspiler(module => /\.jsx?$/.test(module.path), [
    { transpiler: babelTranspiler },
  ]);

  preset.registerTranspiler(module => /\.json$/.test(module.path), [
    { transpiler: jsonTranspiler },
  ]);

  preset.registerTranspiler(module => /\.m\.css$/.test(module.path), [
    { transpiler: stylesTranspiler, options: { module: true } }
  ]);

  preset.registerTranspiler(module => /\.css$/.test(module.path), [
    { transpiler: stylesTranspiler }
  ]);

  preset.registerTranspiler(() => true, [{ transpiler: rawTranspiler }]);

  return preset;
}
