import { SubstrateBatchProcessor } from '@subsquid/substrate-processor';
import { lookupArchive } from '@subsquid/archive-registry';

import config from './config';

export const indexedNfts = [config.nfts.cb, config.nfts.vit, config.nfts.draft];

if (config.nfts.old !== '') {
  indexedNfts.push(...config.nfts.old.split(','));
}

export const processor = new SubstrateBatchProcessor()
  .setGateway(lookupArchive(config.squid.archive, { release: 'ArrowSquid' }))
  .setRpcEndpoint({
    url: config.squid.node,
    rateLimit: config.squid.rateLimit,
  })
  .setFields({ event: { args: true }, block: { timestamp: true } })
  .addGearUserMessageSent({ programId: indexedNfts })
  .setBlockRange({ from: config.squid.fromBlock });
