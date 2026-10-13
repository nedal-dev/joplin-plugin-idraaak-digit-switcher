const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
module.exports = function loadTs(file, mocks = {}, globals = {}) {
  const absolute = path.resolve(__dirname, '..', file);
  const code = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports, ...globals,
    require: name => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name.startsWith('.')) return module.exports(path.relative(path.join(__dirname, '..'), path.resolve(path.dirname(absolute), name + '.ts')), mocks, globals);
      throw new Error('Unexpected dependency: ' + name);
    },
  }, { filename: absolute });
  return exports;
};
