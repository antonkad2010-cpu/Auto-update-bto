// Exact reviewed edits for one pinned client; unknown versions fail closed.
const fs = require('node:fs');
const crypto = require('node:crypto');
const acorn = require('acorn');

const digest = source => crypto.createHash('sha256').update(source).digest('hex');
function visit(node, callback) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { for (const child of node) visit(child, callback); return; }
  if (typeof node.type !== 'string') return;
  callback(node);
  for (const child of Object.values(node)) {
    if (Array.isArray(child) || child && typeof child === 'object' && typeof child.type === 'string') visit(child, callback);
  }
}
function removeReviewedChecks(source, spec) {
  const ast = acorn.parse(source, {ecmaVersion: 'latest'});
  const replacements = [];
  const found = new Map(spec.checks.map(check => [check.id, 0]));
  visit(ast, node => {
    for (const check of spec.checks) {
      let target;
      if (check.kind === 'variable-initializer' && node.type === 'VariableDeclarator' && node.id.name === check.name) target = node.init;
      if (check.kind === 'encoded-block' && node.type === 'BlockStatement' && node.body.some(statement =>
        statement.type === 'ExpressionStatement' && statement.expression.type === 'CallExpression' && statement.expression.callee.name === 'eval')) target = node;
      if (!target || digest(source.slice(target.start, target.end)) !== check.sha256) continue;
      found.set(check.id, found.get(check.id) + 1);
      let replacement;
      if (check.id === 'browser-api-integrity') replacement = 'function () {}';
      else if (check.id === 'known-menu-dom') replacement = '{function ' + check.name + '() {}}';
      else if (check.id === 'script-filename-check') replacement = '{}';
      else throw Error('Unknown reviewed check: ' + check.id);
      replacements.push({start: target.start, end: target.end, replacement, id: check.id});
    }
  });
  for (const [id, count] of found) if (count !== 1) throw Error(id + ': expected one exact reviewed check, found ' + count);
  const ordered = replacements.sort((a, b) => a.start - b.start);
  for (let i = 1; i < ordered.length; i++) if (ordered[i].start < ordered[i - 1].end) throw Error('Overlapping checks');
  let output = source;
  for (const change of [...ordered].reverse()) output = output.slice(0, change.start) + change.replacement + output.slice(change.end);
  acorn.parse(output, {ecmaVersion: 'latest'});
  return {output, removed: ordered.map(change => ({id: change.id, characters: change.end - change.start}))};
}
module.exports = {digest, removeReviewedChecks};

if (require.main === module) {
  try {
    const [basePath, inputPath, specPath, outputPath, reportPath] = process.argv.slice(2);
    if (![basePath, inputPath, specPath, outputPath, reportPath].every(Boolean)) throw Error('Usage: node client_check_variant.cjs BASE INPUT SPEC OUTPUT REPORT');
    const base = fs.readFileSync(basePath, 'utf8'), input = fs.readFileSync(inputPath, 'utf8');
    const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
    if (digest(base) !== spec.base_sha256) throw Error('Unreviewed upstream version');
    removeReviewedChecks(base, spec);
    const result = removeReviewedChecks(input, spec);
    const marker = 'nativeIntegrity:()=>Ꮷρ༧,';
    if (result.output.split(marker).length !== 2) throw Error('Diagnostic adapter is missing or ambiguous');
    result.output = result.output.replace(marker, marker + '\n  clientChecksRemoved:true,');
    const output = '// Reviewed variant: three client checks removed; server disconnect cause remains unverified.\n' + result.output;
    acorn.parse(output, {ecmaVersion: 'latest'});
    fs.writeFileSync(outputPath, output);
    fs.writeFileSync(reportPath, JSON.stringify({base_sha256: digest(base), input_sha256: digest(input), output_sha256: digest(output), removed: result.removed, build_kind: 'reviewed-client-check-variant', serverDisconnectFixed: 'unverified'}, null, 2) + '\n');
    console.log(JSON.stringify({removed: result.removed, output_sha256: digest(output)}));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
