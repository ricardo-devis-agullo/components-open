import { oak } from '../deps.ts';
import { Repository } from './repository.ts';
import { run } from './component.ts';
import { getAvailableVersion } from './version_handler.ts';

const { Status } = oak;

interface ComponentResponse {
  type: string;
  version: string;
  requestVersion: string;
  name: string;
  renderMode: 'unrendered';
  href: string;
  data: any;
  template: {
    src: string;
    type: string;
    key: string;
  };
}

export function create(repository: Repository) {
  const router = new oak.Router();

  router.get('/registry', async (ctx) => {
    const components = await repository.getComponents();

    ctx.response.body = {
      href: ctx.request.url,
      components: Object.fromEntries(components.entries()),
    };
  });

  router.get('/registry/:componentName', async (ctx) => {
    const components = await repository.getComponents();
    const { componentName } = ctx.params;

    const versions = components.get(ctx.params.componentName);

    if (!versions) {
      return ctx.throw(Status.BadRequest, `Component ${componentName} does not exist`);
    }
    const version = getAvailableVersion(undefined, versions);

    if (!version) {
      return ctx.throw(Status.BadRequest, `Version ${version} does not exist`);
    }

    try {
      const componentData = await run({
        componentName: componentName,
        componentVersion: version,
        repository,
        request: ctx.request,
      });
      const response: ComponentResponse = {
        type: 'oc-component',
        version,
        requestVersion: '',
        name: componentName,
        renderMode: 'unrendered',
        href: ctx.request.url.href,
        data: componentData,
        template: {
          key: 'TEMPLATE_HASH',
          src: 'STORAGEURL/template.js',
          type: 'react',
        },
      };

      ctx.response.body = response;
    } catch (err) {
      if (err instanceof Error && err.name === 'PermissionDenied') {
        ctx.throw(Status.FailedDependency, 'Dependency');
      } else {
        console.log(err);
        ctx.throw(Status.InternalServerError, 'Noes');
      }
    }
  });

  router.get('/registry/:componentName/:componentVersion', async (ctx) => {
    try {
      const componentData = await run({
        componentName: ctx.params.componentName,
        componentVersion: ctx.params.componentVersion,
        repository,
        request: ctx.request,
      });
      const response: ComponentResponse = {
        type: 'oc-component',
        version: ctx.params.componentVersion,
        requestVersion: ctx.params.componentVersion,
        name: ctx.params.componentName,
        renderMode: 'unrendered',
        href: ctx.request.url.href,
        data: componentData,
        template: {
          key: 'TEMPLATE_HASH',
          src: 'STORAGEURL/template.js',
          type: 'react',
        },
      };

      ctx.response.body = response;
    } catch (err) {
      if (err instanceof Error && err.name === 'PermissionDenied') {
        ctx.throw(Status.FailedDependency, 'Dependency');
      } else {
        ctx.throw(Status.InternalServerError, 'Noes');
      }
    }
  });

  router.use(async function errorHandler(context, next) {
    try {
      await next();
    } catch (err) {
      if (oak.isHttpError(err)) {
        context.response.status = err.status;
        const { message, status, stack } = err;
        if (context.request.accepts('json')) {
          context.response.body = { message, status, stack };
          context.response.type = 'json';
        } else {
          context.response.body = `${status} ${message}\n\n${stack ?? ''}`;
          context.response.type = 'text/plain';
        }
      } else {
        console.log(err);
        throw err;
      }
    }
  });

  return router;
}
