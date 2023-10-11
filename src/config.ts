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
  },
  archive: {
    uri: getEnv('ARCHIVE_URI'),
  },
};
