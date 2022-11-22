import { semver } from '../deps.ts';
import { Storage } from '../types.ts';

type ComponentsList = Map<string, string[]>;

export default function componentsList(conf: { componentsDir: string }, cdn: Storage) {
  const filePath = (): string => `${conf.componentsDir}/components.json`;

  const componentsList = {
    getFromJson: (): Promise<ComponentsList> => cdn.getJson(filePath(), true),

    getFromDirectories: async (): Promise<ComponentsList> => {
      const componentsInfo: Record<string, string[]> = {};

      const getVersionsForComponent = async (componentName: string): Promise<string[]> => {
        const versions = await cdn.listSubDirectories(
          `${conf.storage.options.componentsDir}/${componentName}`
        );

        return versions.sort(semver.compare);
      };

      try {
        const components = await cdn.listSubDirectories(conf.storage.options.componentsDir);
        const limit = pLimit(cdn.maxConcurrentRequests);

        const versions = await Promise.all(
          components.map((component) => limit(() => getVersionsForComponent(component)))
        );

        components.forEach((component, i) => {
          componentsInfo[component] = versions[i];
        });

        return {
          lastEdit: Date.now(),
          components: componentsInfo,
        };
      } catch (err: any) {
        if (err.code === 'dir_not_found') {
          return {
            lastEdit: Date.now(),
            components: {},
          };
        }
        throw err;
      }
    },

    async refresh(): Promise<ComponentsList> {
      const components = await componentsList.getFromDirectories();
      await componentsList.save(components);

      return components;
    },

    save: (data: ComponentsList): Promise<unknown> =>
      cdn.putFileContent(JSON.stringify(data), filePath(), true),
  };

  return componentsList;
}
