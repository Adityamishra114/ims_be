
interface ProductInterface {
    productName: String
    description: String
    brand: String
    category: String
    Rate_Unit: number
    quantity: number
    totalValue: number
    discount: number
    discountedPrice: number
    GST: number
    GSTValue: number
    costPrice: number
}

export interface PurchaseOrderInterface {

    seq: number
    purchaseOrderNo: String
    manufacturer : String
    manufacturerId : String
    storeId: String
    storeName: String
    products: ProductInterface[]
    totalItems: number
    subTotal: number
    extraDiscount: number
    orderTotal: number
    status: String
    createdBy: String
    createdById: String
    createdByRole: String
    createdAt: Date
    updatedBy: String
    updatedById: String
    updatedByRole: String
    updatedAt: Date
    boughtBy: String
    boughtById: String
    boughtByRole: String
    boughtAt: Date
}
