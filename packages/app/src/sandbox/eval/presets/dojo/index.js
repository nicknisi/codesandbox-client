import Preset from '../';

import typescriptTranspiler from '../../transpilers/typescript';
import rawTranspiler from '../../transpilers/raw';

export default function initialize() {
  const preset = new Preset('dojo', ['ts', 'tsx', 'json', 'css']);

  preset.registerTranspiler(module => /\.tsx?$/.test(module.path), [
    { transpiler: typescriptTranspiler }
  ]);

  preset.registerTranspiler(() => true, [{ transpiler: rawTranspiler }]);

  return preset;
}
