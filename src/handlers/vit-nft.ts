import { HexString, HumanTypesRepr, ProgramMetadata } from '@gear-js/api';
import config from '../config';
import { StateReply, VitNftStateReply } from '../types';
import { gearReadStateBatchReq, gearReadStateReq, getDate } from '../utils';
import { readFileSync } from 'fs';
import { BatchState } from '../batchState';
import { getCollectionDescription, getCollectionName } from './helpers';

async function getStorages(meta: ProgramMetadata) {
  const payload = '0x01';
  const result = await gearReadStateReq(config.nfts.vit, payload);
  const data = meta.createType<StateReply>((meta.types.state as HumanTypesRepr).output, result);
  if (data.isStorageIds) {
    return data.asStorageIds.toJSON() as HexString[];
  }
}

const meta = ProgramMetadata.from(readFileSync('./assets/cb-nft.meta.txt', 'utf8'));
const nftMeta = ProgramMetadata.from(readFileSync('./assets/vit-nft.meta.txt', 'utf8'));
const blockNumber = BigInt(config.nfts.vitMigratedAtBlock);
const timestamp = new Date(config.nfts.vitMigratedTS);

export async function readMigratedNfts(state: BatchState) {
  const storages = await getStorages(meta);
  const description = await getCollectionDescription(meta, config.nfts.vit);
  const name = await getCollectionName(meta, config.nfts.vit);
  const collection = state.newCollection(config.nfts.vit, name, description);
  for (let i = 0; i < storages.length; i += 5) {
    const result = await gearReadStateBatchReq(storages.slice(i, i + 5), '0x02');

    for (const value of result) {
      const data = nftMeta.createType<VitNftStateReply>((nftMeta.types.state as HumanTypesRepr).output, value);
      if (data.isAllTokensRawData) {
        for (const { media, owner, link, activities } of data.asAllTokensRawData) {
          await state.mintNft(
            media.toString(),
            collection,
            owner.toHex(),
            description,
            name + ' - ' + media.toString(),
            link.toString(),
            activities.map(([name, times, ts]) => {
              const timesFormatted = name.toString() === 'NFT minted' ? ', ' : ` ${times.toString()} times, `;
              const date = getDate(ts.toString());
              const dateFormatted = name.toString() === 'NFT minted' ? `date: ${date}` : `last game date: ${date}`;
              return `${name}${timesFormatted}${dateFormatted}`;
            }),
            blockNumber,
            timestamp,
          );
        }
      }
    }
  }

  await state.save();
}
