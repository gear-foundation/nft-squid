import { ProgramMetadata } from '@gear-js/api';
import { BatchState } from '../batchState';
import { readFileSync } from 'fs';
import { MasterNftEvent } from '../types';
import { getDate } from '../utils';
import config from '../config';
import { getCollectionDescription, getCollectionName } from './helpers';

const meta = ProgramMetadata.from(readFileSync('./assets/cb-nft.meta.txt', 'utf8'));

export async function cbNftHandler(
  state: BatchState,
  payload: string,
  source: string,
  blockNumber: bigint,
  ts: Date,
  linkIsFull = false,
) {
  const data = meta.createType<MasterNftEvent>(meta.types.others.output, payload);
  if (data.isMinted || data.isNftChanged) {
    const action = data.isMinted ? data.asMinted : data.asNftChanged;
    const tokenId = action.tokenId.toString();
    const { media, owner, activities, link } = action.meta;
    let collection = await state.getCollection(source);
    if (!collection) {
      const [collectionName, collectionDesc] = await Promise.all([
        getCollectionName(meta, config.nfts.cb),
        getCollectionDescription(meta, config.nfts.cb),
      ]);
      collection = state.newCollection(source, collectionName, collectionDesc);
    }

    await state.mintNft(
      tokenId,
      collection,
      owner.toHex(),
      collection.description,
      collection.name + ' - ' + media.toString(),
      linkIsFull ? link.toString() : `${link.toString()}/${tokenId}.png`,
      activities.map(([name, times, ts]) => {
        const timesFormatted = name.toString() === 'NFT minted' ? ', ' : ` ${times.toString()} times, `;
        const date = getDate(ts.toString());
        const dateFormatted = name.toString() === 'NFT minted' ? `date: ${date}` : `last game date: ${date}`;
        return `${name}${timesFormatted}${dateFormatted}`;
      }),
      blockNumber,
      ts,
      data.isMinted,
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
