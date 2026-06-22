import type { SourceDescriptor } from './sourceTypes';

export interface StyleDescriptor {
  schemaVersion: 'name-forge.style.v1';
  label: string;
  summary: string;
  tags: string[];
}

export interface StylePackSourceDescriptor {
  source: SourceDescriptor;
  assetKind: 'style-pack';
  packId: string;
  packVersion: string;
  sourcePath: string;
  styleNotes: string;
  limitations: string[];
}
