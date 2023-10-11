import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, OneToMany as OneToMany_} from "typeorm"
import * as marshal from "./marshal"
import {Account} from "./account.model"
import {NftCollection} from "./nftCollection.model"
import {Transfer} from "./transfer.model"

@Entity_()
export class Nft {
    constructor(props?: Partial<Nft>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("text", {nullable: false})
    tokenId!: string

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    owner!: Account

    @Index_()
    @ManyToOne_(() => NftCollection, {nullable: true})
    collection!: NftCollection

    @Column_("text", {nullable: false})
    description!: string

    @Column_("text", {nullable: false})
    name!: string

    @Column_("text", {nullable: false})
    mediaUrl!: string

    @Column_("jsonb", {nullable: false})
    attribUrl!: unknown

    @OneToMany_(() => Transfer, e => e.nft)
    transfers!: Transfer[]

    @Column_("timestamp with time zone", {nullable: false})
    mintedAt!: Date

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    mintedAtBlock!: bigint

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    approvedAccount!: Account | undefined | null
}
