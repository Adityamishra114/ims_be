
interface ProductInterface {
    productId: String
    productName: String
    description: String
    brand: String
    category: String
    GST: number
    GSTValue: number
    discount: number
    discountedPrice: number
    sellingPrice: number
    sellingAt: number
}

interface PurchasingHistoryInterface {
    
    invoiceNo: String
    invoiceId: String
    totalItems: number
    subTotal: number
    extraDiscount: number
    orderTotal: number
    storeName: String
    soldBy: String
    soldById: String
    soldByRole: String
    soldAt: Date
    products: ProductInterface[]
}


export interface CustomerInterface {
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
    totalPurchase: String
    totalPurchaseVal: String
    createdBy: String
    createdById: String
    createdByRole: String
    createdAt: Date
    updatedBy: String
    updatedById: String
    updatedByRole: String
    updatedAt: Date
}