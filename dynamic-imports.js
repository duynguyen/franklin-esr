const walk = require('estree-walker').walk
const MagicString = require('magic-string')
const path = require('path')

// Plugin to handle dynamic imports of custom components
// Replaces templates like `custom:${variable}` with a switch statement for imports for possible values of variable
// The values of variable are taken from the customer's /components folder
module.exports = function dynamicImports(components) {
  return {
    name: "dynamic-imports",

    transform(code, id) {
      if (!(id.endsWith('.js') || id.endsWith('.jsx'))) {
        return;
      }

      const parsed = this.parse(code);

      let editedCode;
      let importIndex = 0;

      walk(parsed, {
        enter: (node) => {
          // We expect an import expression with a template literal inside it: import(`custom:${ident}`)
          if (node.type !== 'ImportExpression' || node.source.type !== 'TemplateLiteral') {
            return;
          }

          // We expect the format `custom:${identifier}` - two quasis (strings "custom:" and "", and one expression
          const templateLiteralNode = node.source
          if (templateLiteralNode.expressions.length !== 1 || templateLiteralNode.quasis.length !== 2) {
            return
          }

          // We expect the start string to be "custom"
          if (templateLiteralNode.quasis[0].value.raw !== "custom:" && templateLiteralNode.quasis[1].value.raw !== "") {
            return
          }

          const importVariableNode = node.source.expressions[0]
          const importVariableName = code.substring(importVariableNode.start, importVariableNode.end)

          editedCode = editedCode || new MagicString(code)

          editedCode.prepend(`
function __customComponentRuntimeDynamicImport${importIndex}__(path) {
  switch(path) {
${components.map(({name, path}) => `    case '${name}': return import('${path}');`).join('\n')}
    default: return import('${path.join(__dirname, "components", "CustomComponentNotFound")}');
  } 
}
          `)
          editedCode.overwrite(node.start, node.end, `__customComponentRuntimeDynamicImport${importIndex}__(${importVariableName})`)

          importIndex += 1
        }
      })

      if (editedCode && importIndex !== 0) {
        return {
          code: editedCode.toString(),
          map: editedCode.generateMap({
            file: id,
            includeContent: true,
            hires: true
          })
        }
      }

    }
  }
}
