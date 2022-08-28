import ts from "npm:typescript@~4.7.4";

const source = "let x: string = 'string'";
const result = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
});

console.log(JSON.stringify(result));
