

export interface StoreInterface {
    seq: number,
    storeName: String
    shopLocation: String
    subAdmins: String[]
    subAdminsIds: String[]
    engineers: String[]
    engineersIds: String[]
    productIds: String[]
    GSTNo: String
    PANNo: String
    createdAt: Date,
    createdBy: String
    createdById: String
    updatedAt: Date
    updatedBy: String
    updatedById: String
}
