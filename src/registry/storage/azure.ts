import { AzureStorage as AzureStorageClient } from 'https://deno.land/x/azure_storage_client@0.5.0/mod.ts';
import { parse } from 'https://deno.land/x/xml@2.0.4/mod.ts';
import { Storage } from '../../types.ts';

interface BlobList {
  Name: string;
  Properties: {
    'Creation-Time': string;
    'Last-Modified': string;
    Etag: number;
    'Content-Length': number;
    'Content-Type': string;
    'Content-Encoding': null;
    'Content-Language': null;
    'Content-CRC64': null;
    'Content-MD5': string;
    'Cache-Control': null;
    'Content-Disposition': null;
    BlobType: 'BlockBlob';
    LeaseStatus: 'unlocked';
    LeaseState: 'available';
    ServerEncrypted: true;
  };
  OrMetadata: null;
}

export interface AzureStorageOptions {
  sas: string;
  accountName: string;
  accountKey: string;
  containerName: string;
  componentsDir: string;
}

export function AzureStorage(options: AzureStorageOptions): Storage {
  const storage = new AzureStorageClient(
    `DefaultEndpointsProtocol=https;AccountName=${options.accountName};AccountKey=${options.accountKey};EndpointSuffix=core.windows.net`
  );

  const url = (path: string) =>
    `https://${options.accountName}.blob.core.windows.net/${options.containerName}/${options.componentsDir}/${path}${options.sas}`;

  return {
    async getList() {
      const list = await storage.container('regtest').list();
      const parsed = parse(await list.text());

      const blobs: BlobList[] = (parsed as any).EnumerationResults.Blobs.Blob;

      return blobs.map((x) => x.Name);
    },
    async getJson(path: string) {
      const res = await fetch(url(path));

      return res.json();
    },
    getFilePath(path: string) {
      return url(path);
    },
  };
}
