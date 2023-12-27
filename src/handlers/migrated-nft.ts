import { HexString, HumanTypesRepr, ProgramMetadata } from '@gear-js/api';
import { readFileSync } from 'fs';

import config from '../config';
import { StateReply, StorageStateReply } from '../types';
import { gearReadStateBatchReq, gearReadStateReq, getDate } from '../utils';
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

  const batchSize = 5;
  for (let i = 0; i < storages.length; i += batchSize) {
    console.log(`Reading storage ${i + 1} - ${i + batchSize} of ${storages.length}`);

    const [tokens, links] = await Promise.all([
      gearReadStateBatchReq(storages.slice(i, i + batchSize), '0x02'),
      gearReadStateBatchReq(storages.slice(i, i + batchSize), '0x06'),
    ]);

    for (let j = 0; j < batchSize; j++) {
      const data = nftMeta.createType<StorageStateReply>((nftMeta.types.state as HumanTypesRepr).output, tokens[j]);
      const link = nftMeta.createType<StorageStateReply>((nftMeta.types.state as HumanTypesRepr).output, links[j]);

      const mediaLink = link.asIpfsFolderLink;

      if (data.isAllTokensRawData) {
        for (const { media, owner, activities, tokenId } of data.asAllTokensRawData) {
          await state.mintNft(
            tokenId.toString(),
            collection,
            owner.toHex(),
            activities.map(([name, times, ts]) => {
              const timesFormatted = name.toString() === 'NFT minted' ? ', ' : ` ${times.toString()} times, `;
              const date = getDate(ts.toString());
              const dateFormatted = name.toString() === 'NFT minted' ? `date: ${date}` : `last game date: ${date}`;
              return `${name}${timesFormatted}${dateFormatted}`;
            }),
            description,
            name + ' - ' + tokenId.toString(),
            `${mediaLink}/${media.toString()}.png`,
            blockNumber,
            timestamp,
          );
        }
      }
    }
  }
  await state.save();
}
