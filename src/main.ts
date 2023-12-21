import { TypeormDatabase } from '@subsquid/typeorm-store';
import { processor } from './processor';
import { UserMessageSentArgs } from './types';
import config from './config';
import { BatchState } from './batchState';
import { cbNftHandler } from './handlers/cb-nft';
import { readMigratedNfts } from './handlers/migrated-nft';
import { draftNftHandler } from './handlers/draft-nft';

const programs = [config.nfts.cb, config.nfts.vit];
const simpleNfts = [config.nfts.draft];

if (config.nfts.old !== '') {
  simpleNfts.push(...config.nfts.old.split(','));
}

let isMigratedNftsSaved = !config.nfts.readMigratedNfts;

const state = new BatchState();

processor.run(new TypeormDatabase(), async (ctx) => {
  state.newBatch(ctx.store);

  if (!isMigratedNftsSaved) {
    await readMigratedNfts(state);
    isMigratedNftsSaved = true;
    state.newBatch(ctx.store);
  }

  for (const block of ctx.blocks) {
    const blockNumber = BigInt(block.header.height);
    const ts = new Date((block.header as any).timestamp);

    for (const event of block.events) {
      if (event.name !== 'Gear.UserMessageSent') continue;

      const {
        message: { source, payload, details },
      } = event.args as UserMessageSentArgs;

      if (payload === '0x') continue;
      if (details && details.code.__kind !== 'Success') continue;

      if (programs.includes(source)) {
        await cbNftHandler(state, payload, source, blockNumber, ts);
      } else if (simpleNfts.includes(source)) {
        await draftNftHandler(state, payload, source, blockNumber, ts);
      }
    }
  }

  await state.save();
});
