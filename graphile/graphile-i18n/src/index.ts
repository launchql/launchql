import LangPlugin from './plugin';

export { LangPlugin, type LangPluginOptions } from './plugin';
export {
  additionalGraphQLContextFromRequest,
  makeLanguageDataLoaderForTable,
  type I18nGraphQLContext,
  type I18nRequestLike,
  type LanguageDataLoaderFactory
} from './middleware';
export { env } from './env';

export default LangPlugin;
