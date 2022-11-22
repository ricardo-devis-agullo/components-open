import { semver } from '../deps.ts';

function maxVersion(list: string[]) {
  return semver.sort(list).pop();
}

export function getAvailableVersion(
  requestedVersion: string | undefined,
  availableVersions: string[]
): string | undefined {
  if (typeof requestedVersion === 'undefined') {
    requestedVersion = '';
  }

  const version = semver.maxSatisfying(availableVersions, requestedVersion) || undefined;
  const max = maxVersion(availableVersions);
  const isLatest = requestedVersion === '';

  return version || (isLatest && max) || undefined;
}

export function validateNewVersion(requestedVersion: string, availableVersions: string[]): boolean {
  return !availableVersions.includes(requestedVersion);
}
