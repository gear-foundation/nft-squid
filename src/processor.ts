import { lookupArchive } from '@subsquid/archive-registry';
import {
  BatchContext,
  BatchProcessorCallItem,
  BatchProcessorEventItem,
  BatchProcessorItem,
  SubstrateBatchProcessor,
} from '@subsquid/substrate-processor';
import config from './config';

export const processor = new SubstrateBatchProcessor()
  .setDataSource({
    archive: config.archive.uri,
  })
  .addEvent('Gear.UserMessageSent', {
    data: {
      event: {
        args: true,
      },
    },
  } as const)
  .setBlockRange({ from: 513000 });

export type Item = BatchProcessorItem<typeof processor>;
export type EventItem = BatchProcessorEventItem<typeof processor>;
export type CallItem = BatchProcessorCallItem<typeof processor>;
export type ProcessorContext<Store> = BatchContext<Store, Item>;
