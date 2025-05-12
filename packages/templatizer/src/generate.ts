
import { writeRenderedTemplates } from './generateFromCompiled';

import * as templates from './generated/module';

// Render templates with vars to new directory

writeRenderedTemplates(Object.values(templates), './output', {
  projectName: 'ZestDoc',
  author: 'Dan Lynch'
});
