export type SourceChannel = 'built-in' | 'user-authored' | 'local-file' | 'package' | 'remote-http' | 'remote-api';
export type AssetKind =
  | 'style-pack'
  | 'phonotactics'
  | 'listed-variants'
  | 'variant-rules'
  | 'role-profiles'
  | 'pronunciation-lexicon'
  | 'ipa-rules'
  | 'name-list';
export type CachePolicy = 'none' | 'session' | 'persistent' | 'external';
export type SourceValidationSeverity = 'error' | 'warning';

export interface SourceDescriptor {
  id: string;
  label: string;
  channel: SourceChannel;
  version: string;
  assetKinds: AssetKind[];
  license: string;
  locale?: string;
  enabledByDefault: boolean;
  priority: number;
  cachePolicy: CachePolicy;
  sourceNotes: string;
  trustNotes: string;
}

export interface SourceValidationIssue {
  severity: SourceValidationSeverity;
  path: string;
  message: string;
}

export interface StylePackValidationResult {
  packId: string;
  valid: boolean;
  issues: SourceValidationIssue[];
}
