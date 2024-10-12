const { addPath } = require('app-module-path');
const path = require('path');

const modules = [
  '',
  'local_modules',
];

modules.forEach((modulePath) => {
  addPath(path.join(process.cwd(), modulePath));
});

require('@babel/register')({
  extensions: ['.js', '.ts', '.tsx'],
});
