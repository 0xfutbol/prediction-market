import { register } from '@babel/register';
import { addPath } from 'app-module-path';
import path from 'path';

const modules = [
  '',
  'local_modules',
];

modules.forEach((modulePath) => {
  addPath(path.join(process.cwd(), modulePath));
});

register({
  extensions: ['.js', '.ts', '.tsx'],
});
