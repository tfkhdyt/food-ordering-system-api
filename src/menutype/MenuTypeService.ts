import { createMenuType, findAllMenuTypes } from './MenuTypeRepository';
import { AddMenuTypeSchema } from './MenuTypeSchema';

export async function addMenuType(payload: AddMenuTypeSchema) {
  await createMenuType(payload);

  return { message: 'new menu type is created' };
}

export async function listMenuTypes() {
  const menus = await findAllMenuTypes();

  return { data: menus };
}
