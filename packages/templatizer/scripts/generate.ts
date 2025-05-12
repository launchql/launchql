
import { writeRenderedTemplates } from '../src/templatize/generateFromCompiled';

import templates from '../src/generated/module';

writeRenderedTemplates(templates, './output-module', {
  PACKAGE_IDENTIFIER: 'my-package',
  ACCESS: 'public',
  MODULEDESC: 'module description',
  MODULENAME: 'my-module',
  REPONAME: 'repository-name',
  USEREMAIL: 'my@email.com',
  USERFULLNAME: 'Dan Lynch',
  USERNAME: 'pyramation'
});

writeRenderedTemplates(templates, './output-workspace', {
  MODULEDESC: 'module description',
  MODULENAME: 'my-module',
  USEREMAIL: 'my@gmail.com',
  USERFULLNAME: 'Dan Lynch',
  USERNAME: 'pyramation'
});
