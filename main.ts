// import { parse } from 'https://deno.land/std@0.202.0/flags/mod.ts';
import { Hono } from 'https://deno.land/x/hono@v3.7.0/mod.ts';
import { ComponentRenderer } from './get-component.ts';
import { Repository } from './repository.ts';

export function Registry() {
  const port = 3000;
  const app = new Hono();
  const repository = Repository();
  const getComponent = ComponentRenderer(repository);

  app.get('/:component/:version', async (c) => {
    try {
      const result = await getComponent(
        c.req.param('component'),
        c.req.param('version')
      );

      return c.json(result);
    } catch (err) {
      return new Response(err.message, {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  });

  Deno.serve({ port }, app.fetch);
}

if (import.meta.main) {
  Registry();
}
