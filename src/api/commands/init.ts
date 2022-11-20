import { green } from 'std/fmt/colors.ts';
import { join, basename } from 'std/path/mod.ts';
import type { Local } from '../domain/local.ts';
import { Logger } from '../logger.ts';

const initSuccess = (componentName: string, componentPath: string): string => {
  return `${green(`Success! Created ${componentName} at ${componentPath}`)}

From here you can run several commands

${green('oc --help')}
To see a detailed list of all the commands available

We suggest that you begin by typing:

${green('oc dev . 3030')}

If you have questions, issues or feedback about OpenComponents, please, raise an issue on GitHub:
${green('https://github.com/opencomponents/oc/blob/master/src/cli/commands.ts')}

Happy coding
`;
};

export const init =
  ({ local, logger }: { local: Local; logger: Logger }) =>
  async (opts: { componentPath: string }): Promise<string> => {
    const componentPath = join(Deno.cwd(), opts.componentPath);
    const componentName = basename(componentPath);

    try {
      await local.init({
        componentName,
        componentPath,
        logger,
      });

      logger.log(initSuccess(componentName, componentPath));

      return componentName;
    } catch (err) {
      let errMsg = String(err);

      if (err === 'name not valid') {
        errMsg = "The component's name contains invalid characters. Allowed are alphanumeric, _, -";
      }

      logger.err(`An error happened when initialising the component: ${errMsg}`);
      throw err;
    }
  };
