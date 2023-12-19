
interface ProductInterface {
    productId: String
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

interface PurchasingHistoryInterface {
    
    purchaseOrderNo: String
    purchaseOrderId: String
    totalItems: number
    subTotal: number
    extraDiscount: number
    orderTotal: number
    storeName: String
    boughtBy: String
    boughtById: String
    boughtByRole: String
    boughtAt?: Date
    products: ProductInterface[]
}


export interface ManufacturerInterface {
    name: String
    email: String
    phone: String
    address: String
    city: String
    state: String
    country: String
    pincode: String
    GSTNo: String
    PANNo: String
    purchaseHistory: PurchasingHistoryInterface[]
    totalPurchase: number
    totalPurchaseVal: number
    createdBy: String
    createdById: String
    createdByRole: String
    createdAt: Date
    updatedBy: String
    updatedById: String
    updatedByRole: String
    updatedAt: Date
}