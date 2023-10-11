import { ProgramMetadata } from '@gear-js/api';
import { BatchState } from '../batchState';
import { readFileSync } from 'fs';
import { MasterNftEvent, StateReply } from '../types';
import { getDate } from '../utils';
import { HumanTypesRepr } from '@gear-js/api';
import config from '../config';
import { gearReadStateReq } from '../utils';

async function getCollectionName(meta: ProgramMetadata) {
  const payload = '0x07';
  const result = await gearReadStateReq(config.nfts.cb, payload);
  const data = meta.createType<StateReply>((meta.types.state as HumanTypesRepr).output, result);
  if (data.isName) {
    return data.asName.toString();
  }
  throw new Error('Invalid state');
}

async function getCollectionDescription(meta: ProgramMetadata) {
  const payload = '0x08';
  const result = await gearReadStateReq(config.nfts.cb, payload);
  const data = meta.createType<StateReply>((meta.types.state as HumanTypesRepr).output, result);
  if (data.isDescription) {
    return data.asDescription.toString();
  }
  throw new Error('Invalid state');
}

const meta = ProgramMetadata.from(readFileSync('./assets/cb-nft.meta.txt', 'utf8'));

export async function cbNftHandler(state: BatchState, payload: string, source: string, blockNumber: bigint, ts: Date) {
  const data = meta.createType<MasterNftEvent>(meta.types.others.output, payload);
  if (data.isMinted || data.isNftChanged) {
    const action = data.isMinted ? data.asMinted : data.asNftChanged;
    const tokenId = action.tokenId.toString();
    const { media, owner, activities, link } = action.meta;
    let collection = await state.getCollection(source);
    if (!collection) {
      const [collectionName, collectionDesc] = await Promise.all([
        getCollectionName(meta),
        getCollectionDescription(meta),
      ]);
      collection = state.newCollection(source, collectionName, collectionDesc);
    }
    await state.mintNft(
      tokenId,
      collection,
      owner.toHex(),
      collection.description,
      collection.name + ' - ' + media.toString(),
      `${link.toString()}/${tokenId}.png`,
      activities.map(([name, times, ts]) => {
        const timesFormatted = name.toString() === 'NFT minted' ? ', ' : ` ${times.toString()} times, `;
        const date = getDate(ts.toString());
        const dateFormatted = name.toString() === 'NFT minted' ? `date: ${date}` : `last game date: ${date}`;
        return `${name}${timesFormatted}${dateFormatted}`;
      }),
      blockNumber,
      ts,
    );
  } else if (data.isTransferred) {
    const { tokenId, owner, recipient } = data.asTransferred;
    const collection = await state.getCollection(source);
    await state.transferNft(tokenId.toString(), collection, owner.toHex(), recipient.toHex(), ts, blockNumber);
  } else if (data.isBurnt) {
    const { tokenId } = data.asBurnt;
    await state.burnNft(tokenId.toString(), source);
  } else if (data.isApproved) {
    const { approvedAccount, tokenId } = data.asApproved;
    await state.approveAccount(tokenId.toString(), source, approvedAccount.toHex());
  } else if (data.isApprovalRevoked) {
    const { tokenId } = data.asApprovalRevoked;
    await state.revokeApprove(tokenId.toString(), source);
  }
}
