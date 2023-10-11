import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToMany as OneToMany_} from "typeorm"
import {Nft} from "./nft.model"

@Entity_()
export class Account {
    constructor(props?: Partial<Account>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @OneToMany_(() => Nft, e => e.owner)
    nfts!: Nft[]

    @OneToMany_(() => Nft, e => e.approvedAccount)
    approvedNfts!: Nft[]
}
