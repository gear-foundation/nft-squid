module.exports = class Data1697013652782 {
    name = 'Data1697013652782'

    async up(db) {
        await db.query(`CREATE TABLE "nft_collection" ("id" character varying NOT NULL, "name" text NOT NULL, "description" text NOT NULL, CONSTRAINT "PK_ffe58aa05707db77c2f20ecdbc3" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "transfer" ("id" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "block_number" numeric NOT NULL, "from_id" character varying, "to_id" character varying, "nft_id" character varying, CONSTRAINT "PK_fd9ddbdd49a17afcbe014401295" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_76bdfed1a7eb27c6d8ecbb7349" ON "transfer" ("from_id") `)
        await db.query(`CREATE INDEX "IDX_0751309c66e97eac9ef1149362" ON "transfer" ("to_id") `)
        await db.query(`CREATE INDEX "IDX_52fc453ba5ff660f331db4b359" ON "transfer" ("nft_id") `)
        await db.query(`CREATE TABLE "nft" ("id" character varying NOT NULL, "token_id" text NOT NULL, "description" text NOT NULL, "name" text NOT NULL, "media_url" text NOT NULL, "attrib_url" jsonb NOT NULL, "minted_at" TIMESTAMP WITH TIME ZONE NOT NULL, "minted_at_block" numeric NOT NULL, "owner_id" character varying, "collection_id" character varying, "approved_account_id" character varying, CONSTRAINT "PK_8f46897c58e23b0e7bf6c8e56b0" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_83cfd3a290ed70c660f8c9dfe2" ON "nft" ("owner_id") `)
        await db.query(`CREATE INDEX "IDX_ffe58aa05707db77c2f20ecdbc" ON "nft" ("collection_id") `)
        await db.query(`CREATE INDEX "IDX_15cac0f65718ba471f34c36fdc" ON "nft" ("approved_account_id") `)
        await db.query(`CREATE TABLE "account" ("id" character varying NOT NULL, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`)
        await db.query(`ALTER TABLE "transfer" ADD CONSTRAINT "FK_76bdfed1a7eb27c6d8ecbb73496" FOREIGN KEY ("from_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "transfer" ADD CONSTRAINT "FK_0751309c66e97eac9ef11493623" FOREIGN KEY ("to_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "transfer" ADD CONSTRAINT "FK_52fc453ba5ff660f331db4b3591" FOREIGN KEY ("nft_id") REFERENCES "nft"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "nft" ADD CONSTRAINT "FK_83cfd3a290ed70c660f8c9dfe2c" FOREIGN KEY ("owner_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "nft" ADD CONSTRAINT "FK_ffe58aa05707db77c2f20ecdbc3" FOREIGN KEY ("collection_id") REFERENCES "nft_collection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "nft" ADD CONSTRAINT "FK_15cac0f65718ba471f34c36fdc5" FOREIGN KEY ("approved_account_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "nft_collection"`)
        await db.query(`DROP TABLE "transfer"`)
        await db.query(`DROP INDEX "public"."IDX_76bdfed1a7eb27c6d8ecbb7349"`)
        await db.query(`DROP INDEX "public"."IDX_0751309c66e97eac9ef1149362"`)
        await db.query(`DROP INDEX "public"."IDX_52fc453ba5ff660f331db4b359"`)
        await db.query(`DROP TABLE "nft"`)
        await db.query(`DROP INDEX "public"."IDX_83cfd3a290ed70c660f8c9dfe2"`)
        await db.query(`DROP INDEX "public"."IDX_ffe58aa05707db77c2f20ecdbc"`)
        await db.query(`DROP INDEX "public"."IDX_15cac0f65718ba471f34c36fdc"`)
        await db.query(`DROP TABLE "account"`)
        await db.query(`ALTER TABLE "transfer" DROP CONSTRAINT "FK_76bdfed1a7eb27c6d8ecbb73496"`)
        await db.query(`ALTER TABLE "transfer" DROP CONSTRAINT "FK_0751309c66e97eac9ef11493623"`)
        await db.query(`ALTER TABLE "transfer" DROP CONSTRAINT "FK_52fc453ba5ff660f331db4b3591"`)
        await db.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_83cfd3a290ed70c660f8c9dfe2c"`)
        await db.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_ffe58aa05707db77c2f20ecdbc3"`)
        await db.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_15cac0f65718ba471f34c36fdc5"`)
    }
}
