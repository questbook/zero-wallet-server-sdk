const fs   = require('fs');

const yaml = require('js-yaml');



// Get document, or throw exception on error
try {
  const doc = yaml.load(fs.readFileSync('./example.yml', 'utf8'));
  console.log(doc['calling-birds']);
} catch (e) {
  console.log(e);
}