// Translate audited payload identifiers only; never rename the downloaded client.
const acorn = require('acorn');
const fs = require('node:fs');

function translate(source, bindings) {
  const identifiers = bindings.identifiers || {};
  const constants = bindings.constants || {};
  const changes = [];
  const tokens = [...acorn.tokenizer(source, {ecmaVersion: 'latest'})];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type.label === 'name' && Object.hasOwn(identifiers, token.value)) {
      const replacement = identifiers[token.value];
      if (!/^[$\p{ID_Start}][$\p{ID_Continue}\u200c\u200d]*$/u.test(replacement)) throw Error('Invalid binding: ' + token.value);
      changes.push([token.start, token.end, replacement]);
    } else if (token.type.label === 'name' && Object.hasOwn(constants, token.value)) {
      if (tokens[i - 1]?.type.label === '.') throw Error('Constant used as a property: ' + token.value);
      const value = constants[token.value];
      if (value !== null && !['number', 'string', 'boolean'].includes(typeof value)) throw Error('Non-scalar constant');
      changes.push([token.start, token.end, '(' + JSON.stringify(value) + ')']);
    } else if (token.type.label === 'string' && Object.hasOwn(identifiers, token.value)) {
      changes.push([token.start, token.end, JSON.stringify(identifiers[token.value])]);
    }
  }
  for (const [start, end, replacement] of changes.reverse()) source = source.slice(0, start) + replacement + source.slice(end);
  acorn.parse(source, {ecmaVersion: 'latest', allowReturnOutsideFunction: true});
  return source;
}

module.exports = {translate};
if (require.main === module) {
  try { process.stdout.write(translate(fs.readFileSync(0, 'utf8'), JSON.parse(fs.readFileSync(process.argv[2], 'utf8')))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
