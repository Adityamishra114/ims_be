import { MaterialsHistoryInterface } from "src/engineer-history/interface/engineerHistory.interface"

export interface UserInterface {
    seq: number
    username: String
    password: String
    address: String
    phoneNumber: String
    email: String
    storeName: String
    storeId: String
    assignedUnderIds: String[]
    // assignedTo: String
    // assignedToId: String
    categoryOfEng: String
    role: string
    status: String
    createdBy: String
    createdByRole: String
    createdById: String
    updatedBy: String
    updatedById: String
    updatedByRole: String
    materialsAsked: MaterialsHistoryInterface[]
    asking: Boolean
    workingHistory: String
}