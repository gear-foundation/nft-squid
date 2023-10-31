import { ProgramMetadata } from '@gear-js/api';
import { BatchState } from '../batchState';
import { readFileSync } from 'fs';
import { DraftNftEvent } from '../types';
import { getCollectionDescription, getCollectionName } from './helpers';

const meta = ProgramMetadata.from(readFileSync('./assets/draft-nft.meta.txt', 'utf8'));

export async function draftNftHandler(
  state: BatchState,
  payload: string,
  source: string,
  blockNumber: bigint,
  ts: Date,
) {
  const data = meta.createType<DraftNftEvent>(meta.types.handle.output, payload);
  if (data.isMinted) {
    const { owner, mediaUrl, tokenId, attribUrl } = data.asMinted;
    let collection = await state.getCollection(source);
    if (!collection) {
      const [collectionName, collectionDesc] = await Promise.all([
        getCollectionName(meta, source, '0x00'),
        getCollectionDescription(meta, source, '0x01'),
      ]);
      collection = state.newCollection(source, collectionName, collectionDesc);
    }

    await state.mintNft(
      tokenId.toString(),
      collection,
      owner.toHex(),
      [attribUrl.toString()],
      collection.description,
      collection.name + ' - ' + tokenId.toString(),
      mediaUrl.toString(),
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
    const { account, tokenId } = data.asApproved;
    await state.approveAccount(tokenId.toString(), source, account.toHex());
  } else if (data.isApprovalRevoked) {
    const { tokenId } = data.asApprovalRevoked;
    await state.revokeApprove(tokenId.toString(), source);
  }
}
