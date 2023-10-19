import { Enum, Option, Struct, Text, Vec, u16, u32, u64 } from '@polkadot/types';
import { Hash } from '@polkadot/types/interfaces';
import { ITuple } from '@polkadot/types/types';

export interface InnerTokenMeta extends Struct {
  media: u32;
  owner: Hash;
  activities: Vec<ITuple<[Text, u16, u64]>>;
  link: Option<Text>;
}

export interface MasterNftEvent extends Enum {
  isMinted: boolean;
  asMinted: {
    tokenId: u32;
    meta: InnerTokenMeta;
  };
  isNftChanged: boolean;
  asNftChanged: {
    tokenId: u32;
    meta: InnerTokenMeta;
  };
  isApproved: boolean;
  asApproved: {
    approvedAccount: Hash;
    tokenId: u32;
  };
  isTransferred: boolean;
  asTransferred: {
    owner: Hash;
    recipient: Hash;
    tokenId: u32;
  };
  isBurnt: boolean;
  asBurnt: {
    tokenId: u32;
  };
  isActivityInfo: boolean;
  asActivityInfo: {
    account: Hash;
    activity: Text;
  };
  isApprovalRevoked: boolean;
  asApprovalRevoked: {
    tokenId: u32;
  };
}

export interface StateReply extends Enum {
  isStorageIds: boolean;
  asStorageIds: Vec<Hash>;
  isName: boolean;
  asName: Text;
  isDescription: boolean;
  asDescription: Text;
}
