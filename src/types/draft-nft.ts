import { Enum, Text, u128 } from '@polkadot/types';
import { Hash } from '@polkadot/types/interfaces';

export interface DraftNftEvent extends Enum {
  isMinted: boolean;
  asMinted: {
    owner: Hash;
    tokenId: u128;
    mediaUrl: Text;
    attribUrl: Text;
  };
  isTransferred: boolean;
  asTransferred: {
    owner: Hash;
    recipient: Hash;
    tokenId: u128;
  };
  isBurnt: boolean;
  asBurnt: {
    tokenId: u128;
  };
  isApproved: boolean;
  asApproved: {
    account: Hash;
    tokenId: u128;
  };
  isApprovalRevoked: boolean;
  asApprovalRevoked: {
    tokenId: u128;
  };
}

export interface DragtNftStateReply extends Enum {
  isName: boolean;
  asName: Text;
  isDescription: boolean;
  asDescription: Text;
}
