
interface ProductInterface {
    productId: String
    productName: String
    description: String
    brand: String
    category: String
    GST: number
    GSTValue: number
    sellingPrice: number
    discount: number
    discountedPrice: number
    sellingAt : number
    quantity: String
    createdAt: Date
}

export interface BucketInterface {
    userId: String
    username: String
    storeName: String
    products: ProductInterface[]
    totalItems: number
    subTotal: number
    extraDiscount: number
    orderTotal: number
}