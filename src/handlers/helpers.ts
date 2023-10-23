import { ProgramMetadata } from '@gear-js/api';
import { StateReply } from '../types';
import { HumanTypesRepr } from '@gear-js/api';
import { gearReadStateReq } from '../utils';

export async function getCollectionName(meta: ProgramMetadata, programId: string) {
  const payload = '0x07';
  const result = await gearReadStateReq(programId, payload);
  const data = meta.createType<StateReply>((meta.types.state as HumanTypesRepr).output, result);
  if (data.isName) {
    return data.asName.toString();
  }
  throw new Error('Invalid state');
}

export async function getCollectionDescription(meta: ProgramMetadata, programId: string) {
  const payload = '0x08';
  const result = await gearReadStateReq(programId, payload);
  const data = meta.createType<StateReply>((meta.types.state as HumanTypesRepr).output, result);
  if (data.isDescription) {
    return data.asDescription.toString();
  }
  throw new Error('Invalid state');
}
