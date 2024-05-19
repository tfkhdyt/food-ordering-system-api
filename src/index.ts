import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';

import customer from './customer/CustomerController';
import { env } from './env';
import menuType from './menu_type/MenuTypeController';
import siteInformation from './site/SiteController';
import user from './user/UserController';

const app = new Hono();

app
  .onError((err, c) => {
    console.error('Error:', err);
    if (err.cause) {
      console.error(err.cause);
    }

    if (err instanceof HTTPException) {
      let errMsg;

      if (err.status === 400 || err.status === 500) {
        errMsg = err.message ? `${err.message}: ${err.cause}` : 'error';
      } else {
        errMsg = err.message || 'error';
      }

      return c.json({ message: errMsg }, { status: err.status });
    }

    return c.json(
      { message: err.message || 'internal server error' },
      { status: 500 },
    );
  })
  .use(logger())
  .route('/auth/users', user)
  .route('/auth/customers', customer)
  .route('/site-informations', siteInformation)
  .route('/menu-types', menuType);

export default {
  port: env.PORT ?? 8080,
  fetch: app.fetch,
};
