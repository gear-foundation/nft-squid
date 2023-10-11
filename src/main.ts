import { TypeormDatabase } from '@subsquid/typeorm-store';
import { processor } from './processor';
import { UserMessageSentArgs } from './types';
import config from './config';
import { BatchState } from './batchState';
import { cbNftHandler } from './handlers/cb-nft';

const programs = [config.nfts.cb];

const state = new BatchState();

processor.run(new TypeormDatabase(), async (ctx) => {
  state.newBatch(ctx.store);

  for (const block of ctx.blocks) {
    const blockNumber = BigInt(block.header.height);
    const ts = new Date(block.header.timestamp);
    for (const item of block.items) {
      if (item.kind !== 'event') continue;
      if (item.event.name !== 'Gear.UserMessageSent') continue;

      const {
        message: { source, payload, details },
      } = item.event.args as UserMessageSentArgs;

      if (payload === '0x') continue;
      if (details && details.code.__kind !== 'Success') continue;

      if (source === config.nfts.cb) {
        await cbNftHandler(state, payload, source, blockNumber, ts);
      }
    }
  }

  await state.save();
});
