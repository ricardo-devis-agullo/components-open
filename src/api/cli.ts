import { Command } from 'https://deno.land/x/cliffy@v0.25.4/command/mod.ts';
import { init } from './commands/init.ts';
import { Local } from './domain/local.ts';
import { logger } from './logger.ts';

const dependencies = {
  local: Local(),
  logger,
};

export async function runCli() {
  await new Command()
    .name('components-open')
    .version('0.1.0')
    .description('OpenComponents impl')
    .command('init', 'Init a component')
    .arguments('<componentPath>')
    .action(async (_options, componentPath) => {
      await init(dependencies)({ componentPath });
    })
    .command('package', 'Package a component')
    .arguments('<componentPath>')
    .action(async (_options, componentPath) => {})
    .parse(Deno.args);
}
