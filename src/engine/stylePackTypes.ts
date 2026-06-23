import type { AssetDescriptor, SourceDescriptor } from './sourceTypes';

export interface StyleDescriptor {
  schemaVersion: 'name-forge.style.v1';
  label: string;
  summary: string;
  tags: string[];
}

export interface StylePackSourceDescriptor {
  source: SourceDescriptor;
  asset: AssetDescriptor;
  assetKind: 'style-pack';
  packId: string;
  packVersion: string;
  sourcePath: string;
  styleNotes: string;
  limitations: string[];
}
