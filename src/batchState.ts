import { Store } from '@subsquid/typeorm-store';
import { Account, Nft, NftCollection, Transfer } from './model';
import { randomUUID } from 'crypto';
import { In } from 'typeorm';

export class BatchState {
  private nfts: Map<string, Nft>;
  private accounts: Map<string, Account>;
  private transfers: Map<string, Transfer>;
  private collections: Map<string, NftCollection>;
  private burntNfts: Map<string, Nft>;
  private store: Store;

  constructor() {
    this.nfts = new Map<string, Nft>();
    this.accounts = new Map<string, Account>();
    this.transfers = new Map<string, Transfer>();
    this.collections = new Map<string, NftCollection>();
    this.burntNfts = new Map<string, Nft>();
  }

  newBatch(store: Store) {
    this.store = store;
    this.accounts.clear();
    this.nfts.clear();
    this.transfers.clear();
    this.collections.clear();
    this.burntNfts.clear();
  }

  async save() {
    if (this.accounts.size > 0) {
      await this.store.save(Array.from(this.accounts.values()));
    }
    if (this.collections.size > 0) {
      await this.store.save(Array.from(this.collections.values()));
    }
    if (this.nfts.size > 0) {
      await this.store.save(Array.from(this.nfts.values()));
    }
    if (this.transfers.size > 0) {
      await this.store.save(Array.from(this.transfers.values()));
    }
    if (this.burntNfts.size > 0) {
      const transfers = await this.store.findBy(Transfer, { nft: { id: In(Array.from(this.burntNfts.keys())) } });
      await this.store.remove(transfers);
      await this.store.remove(Array.from(this.burntNfts.values()));
    }
  }

  async getAccount(address: string): Promise<Account> {
    if (this.accounts.has(address)) {
      return this.accounts.get(address);
    }
    let account = null;
    // await this.store.findOneBy(Account, { id: address });

    if (!account) {
      account = new Account({ id: address });
    }

    this.accounts.set(address, account);
    return account;
  }

  async getNft(id: string): Promise<Nft> {
    if (this.nfts.has(id)) {
      return this.nfts.get(id);
    }

    const nft = await this.store.findOneBy(Nft, { id });
    if (nft) {
      this.nfts.set(id, nft);
      return nft;
    }

    return null;
  }

  async getCollection(programId: string) {
    if (this.collections.has(programId)) {
      return this.collections.get(programId);
    }
    let collection = await this.store.findOneBy(NftCollection, { id: programId });
    if (!collection) {
      return null;
    }
    this.collections.set(programId, collection);
    return collection;
  }

  newCollection(programId: string, name: string, description: string) {
    const collection = new NftCollection({
      id: programId,
      name,
      description,
      nfts: [],
    });
    this.collections.set(programId, collection);
    return collection;
  }

  async mintNft(
    tokenId: string,
    collection: NftCollection,
    ownerAddress: string,
    description: string,
    name: string,
    mediaUrl: string,
    attribUrl: string[],
    blockNumber: bigint,
    timestamp: Date,
    mint = true,
  ) {
    const id = `${collection.id}-${tokenId}`;

    const owner = await this.getAccount(ownerAddress);
    let nft = mint
      ? new Nft({ id, collection, mintedAt: timestamp, mintedAtBlock: blockNumber, tokenId, transfers: [] })
      : await this.getNft(id);

    nft.owner = owner;
    nft.description = description;
    nft.name = name;
    nft.mediaUrl = mediaUrl;
    nft.attribUrl = attribUrl;

    this.nfts.set(`${collection.id}-${tokenId}`, nft);
  }

  async transferNft(
    tokenId: string,
    collection: NftCollection,
    from: string,
    to: string,
    timestamp: Date,
    blockNumber: bigint,
  ) {
    const id = `${collection.id}-${tokenId}`;
    const [fromAcc, toAcc, nft] = await Promise.all([this.getAccount(from), this.getAccount(to), this.getNft(id)]);

    nft.owner = toAcc;
    const transfer = new Transfer({
      id: randomUUID(),
      nft,
      from: fromAcc,
      to: toAcc,
      timestamp,
      blockNumber,
    });
    this.transfers.set(transfer.id, transfer);
  }

  async burnNft(tokenId: string, programId: string) {
    const id = `${programId}-${tokenId}`;
    const nft = await this.getNft(id);
    if (nft) {
      this.burntNfts.set(id, nft);
    }
  }

  async approveAccount(tokenId: string, programId: string, address: string) {
    const id = `${programId}-${tokenId}`;
    const nft = await this.getNft(id);
    if (nft) {
      const account = await this.getAccount(address);
      nft.approvedAccount = account;
    }
  }

  async revokeApprove(tokenId: string, programId: string) {
    const id = `${programId}-${tokenId}`;
    const nft = await this.getNft(id);
    if (nft) {
      nft.approvedAccount = null;
    }
  }
}
