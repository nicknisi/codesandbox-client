import postcss from 'postcss';
import postcssModules from 'postcss-modules';
import { dispatch } from 'codesandbox-api';
import { StyleTranspiler } from '../style';
import { type LoaderContext } from '../../transpiled-module';

function classesToDefinition(classes): string {
  return Object.keys(classes).reduce((previous, className) => previous + `export const ${className}: string;\n`, '');
}

class CssModulesTranspiler extends StyleTranspiler {
  constructor() {
    super('css-modules-transpiler');
  }

  async doTranspilation(code: string, loaderContext: LoaderContext) {
    console.log('%cDO TRANSPILATION', 'font-weight:bold;font-size:3em;'); // eslint-disable-line no-console
    const { path } = loaderContext;
    const definition = await this.getDefinition(code);
    dispatch({ type: 'add-extra-lib', path, code: definition });
    return super.doTranspilation(code, loaderContext);
  }

  async getDefinition(css: string) {
    let mappedClasses;
    function getJSON(filename, json) {
      mappedClasses = json;
    }

    const processor = postcss([ postcssModules({ getJSON }) ]);
    await processor.process(css);

    if (mappedClasses) {
      return classesToDefinition(mappedClasses);
    }
    return '';
  }
}

export { CssModulesTranspiler };

const transpiler = new CssModulesTranspiler();

export default transpiler;
