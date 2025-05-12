import { writeRenderedTemplates } from '../src/templatize/generateFromCompiled';
import moduleTemplate from '../src/generated/module';
import workspaceTemplate from '../src/generated/workspace';
const vars = {
    PACKAGE_IDENTIFIER: 'my-package',
    ACCESS: 'public',
    MODULEDESC: 'module description',
    MODULENAME: 'my-module',
    REPONAME: 'repository-name',
    USEREMAIL: 'my@email.com',
    USERFULLNAME: 'Dan Lynch',
    USERNAME: 'pyramation'
};
writeRenderedTemplates(moduleTemplate, './output-module', vars);
writeRenderedTemplates(workspaceTemplate, './output-workspace', vars);
