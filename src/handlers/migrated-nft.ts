import { HexString, HumanTypesRepr, ProgramMetadata } from '@gear-js/api';
import { readFileSync } from 'fs';

import config from '../config';
import { StateReply, StorageStateReply } from '../types';
import { gearReadStateReq, getDate } from '../utils';
import { BatchState } from '../batchState';
import { getCollectionDescription, getCollectionName } from './helpers';

async function getStorages(meta: ProgramMetadata) {
  const payload = '0x01';
  const result = await gearReadStateReq(config.nfts.cb, payload);
  const data = meta.createType<StateReply>((meta.types.state as HumanTypesRepr).output, result);
  if (data.isStorageIds) {
    return data.asStorageIds.toJSON() as HexString[];
  }
}

const meta = ProgramMetadata.from(readFileSync('./assets/cb-nft.meta.txt', 'utf8'));
const nftMeta = ProgramMetadata.from(readFileSync('./assets/cb-storage.meta.txt', 'utf8'));
const blockNumber = BigInt(config.nfts.cbMigratedAtBlock);
const timestamp = new Date(config.nfts.cbMigratedTs);

export async function readMigratedNfts(state: BatchState) {
  const storages = await getStorages(meta);
  const description = await getCollectionDescription(meta, config.nfts.cb);
  const name = await getCollectionName(meta, config.nfts.cb);
  const collection = state.newCollection(config.nfts.cb, name, description);

  for (let i = 0; i < storages.length; i++) {
    console.log('Reading storage', i, 'of', storages.length);

    const result = await gearReadStateReq(storages[i], '0x02');

    const ipfsFolderLink = nftMeta
      .createType((nftMeta.types.state as HumanTypesRepr).output, await gearReadStateReq(storages[i], '0x06'))
      .toString();

    const data = nftMeta.createType<StorageStateReply>((nftMeta.types.state as HumanTypesRepr).output, result);
    if (data.isAllTokensRawData) {
      for (const { media, owner, activities } of data.asAllTokensRawData) {
        await state.mintNft(
          media.toString(),
          collection,
          owner.toHex(),
          activities.map(([name, times, ts]) => {
            const timesFormatted = name.toString() === 'NFT minted' ? ', ' : ` ${times.toString()} times, `;
            const date = getDate(ts.toString());
            const dateFormatted = name.toString() === 'NFT minted' ? `date: ${date}` : `last game date: ${date}`;
            return `${name}${timesFormatted}${dateFormatted}`;
          }),
          description,
          name + ' - ' + media.toString(),
          `${ipfsFolderLink}/${media.toString()}`,
          blockNumber,
          timestamp,
        );
      }
    }
  }

  await state.save();
}
