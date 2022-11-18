import { AzureStorage } from 'https://deno.land/x/azure_storage_client@0.5.0/mod.ts';
import { parse } from 'https://deno.land/x/xml/mod.ts';

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

export function Storage(opts: { accountName: string; accountKey: string; sas: string }) {
  const storage = new AzureStorage(
    `DefaultEndpointsProtocol=https;AccountName=${opts.accountName};AccountKey=${opts.accountKey};EndpointSuffix=core.windows.net`
  );

  return {
    async getList() {
      const list = await storage.container('regtest').list();
      const parsed = parse(await list.text());

      const blobs: BlobList[] = (parsed as any).EnumerationResults.Blobs.Blob;

      return blobs;
    },
  };
}

export type Storage = ReturnType<typeof Storage>;
