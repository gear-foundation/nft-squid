import { Enum, Text, Vec } from '@polkadot/types';
import { InnerTokenMeta } from './cb-nft';

export interface StorageStateReply extends Enum {
  isAllTokensRawData: boolean;
  asAllTokensRawData: Vec<InnerTokenMeta>;
  isIpfsFolderLink: boolean;
  asIpfsFolderLink: Text;
}
