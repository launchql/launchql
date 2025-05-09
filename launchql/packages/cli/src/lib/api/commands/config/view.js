import { getCurrentContext } from '../../env';
export default async (ctx, args) => {
  const context = await getCurrentContext();
  console.log(context);
};
