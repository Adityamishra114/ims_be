

export interface TestingDetailsInterface {
    assignedTo: String
    assignedToId: String
    assignedBy: String
    assignedById: String
    assignedByRole: String
    task: String
    status: String
    remark: String
    phase: String
    assignedAt: number
    dueDate: number
    completed: String
    closedAt: number
    duration: number
}
  
export interface ProductTestingInterface {
  prodId: String
  UOM: String
  testingDetails: TestingDetailsInterface[]
  closedBy: String
  closedById: String
  closedByRole: String
  closedAt: Date
  movedBackBy: String
  movedBackById: String
  movedBackByRole: String
  movedBackAt: Date
  bucketId: String
  bucket: String
  date: String
}

