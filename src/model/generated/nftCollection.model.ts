import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToMany as OneToMany_} from "typeorm"
import {Nft} from "./nft.model"

@Entity_()
export class NftCollection {
    constructor(props?: Partial<NftCollection>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("text", {nullable: false})
    name!: string

    @Column_("text", {nullable: false})
    description!: string

    @OneToMany_(() => Nft, e => e.collection)
    nfts!: Nft[]
}
