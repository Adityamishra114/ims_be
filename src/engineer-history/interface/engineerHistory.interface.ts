

export interface MaterialsHistoryInterface {
    name: String
    quantity: String
    unit: String
}

interface ProductsInterface {
    productId: String
    productsName:String
    description: String
    brand: String
    category: String
    assignedBy: String
    assignedById: String
    assignedByRole: String
    task: String
    phase: String
    assignedAt: number
    dueDate: number
    closedAt: number
    duration: number
    completed: String
    status: String
    remark: String
    materialsUsed: MaterialsHistoryInterface[]
}

export interface WorkingHistoryInterface {
    materialsAssigned?: MaterialsHistoryInterface[],
    materialsUsed?: MaterialsHistoryInterface[],
    materialsAvailable?: MaterialsHistoryInterface[],
    totalProducts?: number
    successProducts?: number
    failedProducts?: number
    updatedBy?: String
    updatedById?: String
    updatedByRole?: String
    updatedAt?: Date
    date?: String
    products?: ProductsInterface[]
}

export interface EngineerHistoryInterface {
    workingHistory: WorkingHistoryInterface[] 
}