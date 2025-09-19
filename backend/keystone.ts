import { config, list } from '@keystone-6/core';
import { text, password } from '@keystone-6/core/fields';
import { createAuth } from '@keystone-6/auth';
import { statelessSessions } from '@keystone-6/core/session';
import 'dotenv/config';


const sessionSecret = process.env.SESSION_SECRET || 'secret123';

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
  },
});

const session = statelessSessions({
  secret: sessionSecret,
  maxAge: 60 * 60 * 24 * 30
});

export default withAuth(
  config({
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./keystone.db', // fallback jika env tidak ada
    },
    lists: {
      User: list({
        access: {
          operation: {
            query: () => true,
            create: () => true,
            update: () => true,
            delete: () => true,
          },
        },
        fields: {
          name: text({ validation: { isRequired: true } }),
          email: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
          password: password(),
        },
      }),
      Post: list({
        access: {
          operation: {
            query: () => true,
            create: () => true,
            update: () => true,
            delete: () => true,
          },
        },
        fields: {
          title: text({ validation: { isRequired: true } }),
          content: text(),
        },
      }),
    },
    session,
  })
);
