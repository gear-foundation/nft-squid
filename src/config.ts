import assert from 'assert';
import { config } from 'dotenv';

function getEnv(name: string, default_?: string): string {
  const env = process.env[name] || default_;
  assert.notStrictEqual(env, undefined, `Environment variable ${name} is not defined`);
  return env as string;
}

config();

export default {
  nfts: {
    cb: getEnv('NFT_CB'),
    vit: getEnv('NFT_VIT'),
    draft: getEnv('NFT_DRAFT'),
    vitMigratedAtBlock: getEnv('VIT_MIGRATED_AT_BLOCK'),
    vitMigratedTS: Number(getEnv('VIT_MIGRATED_TS')),
    readMigrateNfts: Boolean(getEnv('READ_MIGRATED_NFTS', '')),
  },
  archive: {
    uri: getEnv('ARCHIVE_URI'),
    fromBlock: Number(getEnv('INDEX_FROM_BLOCK', '0')),
  },
  node: {
    address: getEnv('NODE_ADDRESS'),
  },
};
