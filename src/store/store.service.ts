import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StoreInterface } from './interface/store.interface';
import { UserService } from 'src/user/user.service';
import { ProductService } from 'src/product/product.service';
import { MaterialsService } from 'src/materials/materials.service';
import { CatPhaseService } from 'src/cat-phase/cat-phase.service';
import { InvoiceService } from 'src/invoice/invoice.service';
import { PurchaseOrderService } from 'src/purchase-order/purchase-order.service';
import { CustomerService } from 'src/customer/customer.service';
import { ManufacturerService } from 'src/manufacturer/manufacturer.service';

@Injectable()
export class StoreService {
  constructor(@Inject(forwardRef(() => UserService)) private readonly userService: UserService,
   @InjectModel('Store') private readonly storeModel: Model<StoreInterface>,
   @Inject(forwardRef(() => ProductService)) private readonly productService: ProductService,
   @Inject(forwardRef(() => CatPhaseService)) private readonly categoryService: CatPhaseService,
   @Inject(forwardRef(() => MaterialsService)) private readonly materialsService: MaterialsService,
   @Inject(forwardRef(() => InvoiceService)) private readonly invoiceService: InvoiceService,
   @Inject(forwardRef(() => PurchaseOrderService)) private readonly purchaseOrderService: PurchaseOrderService,
   @Inject(forwardRef(() => CustomerService)) private readonly customerService: CustomerService,
   @Inject(forwardRef(() => ManufacturerService)) private readonly manufacturerService: ManufacturerService
   ){}

  // used in dashboard
  async dashboard(req){
    try {

      // get all the stores
      let query = {}
      if (req.user.role !== 'admin'){
        query["storeName"] = req.user.storeName
      }
      let stores = await this.storeModel.find(query, {storeName:1, productIds:1, _id:0})
      
      // rearrange data
      let storeNames = []
      let products = []
      for (let i = 0; i < stores.length; i++) {
        const store = stores[i];
        storeNames.push(store.storeName)
        products.push(store.productIds.length)
      }
      let storesUpdated = {
        storeNames,
        products
      }
      return storesUpdated
      
    } catch (error) {
      throw error
    }
  }

  // used in product
  async removeProduct(store1, productId){
    try {
      const prevStore = await this.storeModel.findOne({storeName: store1})

      // remove productId
      prevStore.productIds = prevStore.productIds.filter(id => id !== productId)

      await prevStore.save()
      return

    } catch (error) {
      throw error
    }
  }

  // used in product
  async addProduct(store, productId){
    try {
      const newStore = await this.storeModel.findOne({storeName: store})

      // add productId
      newStore.productIds.push(productId)

      await newStore.save()
      return

    } catch (error) {
      throw error
    }
  }
   
  // Find store by storeName
  // Used in user, product
  async findName(name: String){
    try {
      const store = await this.storeModel.findOne({
        storeName: name
      })
      if (!store) throw new HttpException('Store not found', HttpStatus.NOT_FOUND)

      return store
    } catch (error) {
      throw error
    }
  }
 
  // Changes in subAdmins 
  // Used in user
  async changeSubAdmin(subAdmin, newSubAdmin){
    try {
      const store = await this.storeModel.findOne({
        subAdmins: subAdmin
      })
      if (!store) return
      store.subAdmins = store.subAdmins.filter(subadmin => subadmin !== subAdmin)
      store.subAdmins.push(newSubAdmin)
      await store.save()
      return store
    } catch (error) {
      throw error
    }
  }

  // Changes in engineers 
  // used in user
  async changeEngineer(username, newUsername){
    try {
      const store = await this.storeModel.findOne({
        engineers: username
      })
      if (!store) return
      store.engineers = store.engineers.filter(eng => eng !== username)
      store.engineers.push(newUsername)
      await store.save()
      return store
    } catch (error) {
      throw error
    }
  } 

  // Stores list to be used in CSV import in product
  async allValidStores(){
    try {
      const stores = await this.storeModel.find({},{storeName:1, _id:0})
      const validStores = []
      stores.map(store => {
        validStores.push(store.storeName)
      })
      return validStores
    } catch (error) {
      throw error
    }
  }

  // Set sequence for new store
  async squence(){
    try {
      const stores = await this.storeModel.find()
      if (stores.length === 0){
        return 0
      }
      return stores[stores.length - 1].seq
    } catch (error) {
      throw error
    }
  }

  // Create store
  async create(req, createStoreDto) {
    try {

      // If storeName already exists
      const storeExists = await this.storeModel.findOne({storeName: createStoreDto.storeName})
      if (storeExists) throw new HttpException('Store exists already', HttpStatus.BAD_REQUEST)

      // Create seq
      const seq = await this.squence()
      if (seq){
        createStoreDto.seq = seq + 1
      }

      // Set created by info
      createStoreDto.createdBy = req.user.username
      createStoreDto.createdById = req.user._id
      createStoreDto.createdAt = new Date()

      // Create new store
      const store = new this.storeModel(createStoreDto)
      await store.save()
      return

    } catch (error) {
      throw error
    }
  }

  // Get all stores
  async findAll(filter) {
    try {
      let query = {}

      // Only storeName based filter
      if (filter && filter.key !== "storeName") throw new HttpException('Invalid entry', HttpStatus.BAD_REQUEST)
      if (filter){
        query[filter.key] = {"$regex": filter.value, "$options": "i"}
      }
      
      const stores = await this.storeModel.find(query,{__v:0}).sort({createdAt: -1})     
      return stores
    } catch (error) {
      throw error
    }
  }

  async findOne(id){
    try {
      const store = await this.storeModel.find({_id:id},{__v:0})
      return store
    } catch (error) {
      throw error
    }
  }

  // Update store
  async update(req, id: String, updateStoreDto: UpdateStoreDto) {
    try {

      const store = await this.storeModel.findOne({_id: id})
      if (!store) throw new HttpException('Store not found', HttpStatus.NOT_FOUND)

      // If store name is changed
      if (updateStoreDto.storeName){

        // changes in products 
        await this.productService.changeStoreName(store.storeName, updateStoreDto.storeName)

        // chnages in user
        await this.userService.changeStoreName(store.storeName, updateStoreDto.storeName)
        
        // changes in material
        await this.materialsService.changeStoreName(store.storeName, updateStoreDto.storeName)
      
        // changes in category 
        await this.categoryService.changeStoreName(store.storeName, updateStoreDto.storeName)

        // changes in invoice
        await this.invoiceService.changeStoreName(store.storeName, updateStoreDto.storeName)
        
        // changes in purchase order
        await this.purchaseOrderService.changeStoreName(store.storeName, updateStoreDto.storeName)
        
        // changes in customer
        await this.customerService.changeStoreName(store.storeName, updateStoreDto.storeName)
        
        // changes in manufacturer
        await this.manufacturerService.changeStoreName(store.storeName, updateStoreDto.storeName)

      }
      
      updateStoreDto.updatedBy = req.user.username
      updateStoreDto.updatedById = req.user._id
      updateStoreDto.updatedAt = new Date()
      await this.storeModel.findByIdAndUpdate(id, updateStoreDto, {new: true})
      return

    } catch (error) {
      throw error
    }
  }

  async allStores(req){
    try {
      let stores

      // If logged in user is admin - show all the stores
      // else - show the store he/she is assignedTo 
      if (req.user.role === "admin"){
        stores = await this.storeModel.find({}, {storeName:1, _id:0})
      }else{
        stores = await this.storeModel.find({
          storeName: req.user.storeName
        }, {storeName:1, _id:0})
      }
      return stores
    } catch (error) {
      throw error
    }
  }

}
