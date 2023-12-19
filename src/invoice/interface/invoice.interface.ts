
export interface InvoiceInterface{
    seq: number
    invoiceNo: String
    customerId : String
    productIds: String[]
    storeId: String
    storeName: String
    totalItems: number
    subTotal: number
    extraDiscount: number
    orderTotal: number
    soldBy: String
    soldById: String
    soldByRole: String
    createdAt: Date
    permitted: Boolean
}

