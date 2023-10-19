import { Enum, Vec } from '@polkadot/types';
import { InnerTokenMeta } from './cb-nft';

export interface VitNftStateReply extends Enum {
  isAllTokensRawData: boolean;
  asAllTokensRawData: Vec<InnerTokenMeta>;
}
