import { Router, Status, isHttpError } from 'oak/mod.ts';
import { Repository } from './repository.ts';
import { run } from './component.ts';
import { getAvailableVersion } from './version-handler.ts';
import { StorageOptions } from '../types.ts';

export function create(options: StorageOptions, repository: Repository) {
  const router = new Router();

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
      const response = await run({
        componentName: componentName,
        componentVersion: version,
        storage: options,
        request: ctx.request,
      });

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
      const response = await run({
        componentName: ctx.params.componentName,
        componentVersion: ctx.params.componentVersion,
        storage: options,
        request: ctx.request,
      });

      ctx.response.body = response;
    } catch (err) {
      if (err instanceof Error && err.name === 'PermissionDenied') {
        ctx.throw(Status.FailedDependency, 'Dependency');
      } else {
        ctx.throw(Status.InternalServerError, 'Noes');
      }
    }
  });

  router.use(async (context, next) => {
    try {
      await next();
    } catch (err) {
      if (isHttpError(err)) {
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
