import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Model } from 'mongoose';
import { UserInterface } from './interface/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from "bcrypt"
import { StoreService } from 'src/store/store.service';
import { userFields } from 'src/headers';
import { Parser } from 'json2csv';
import { ProductService } from 'src/product/product.service';
import { BucketService } from 'src/bucket/bucket.service';
import { EngineerHistoryService } from 'src/engineer-history/engineer-history.service';

@Injectable()
export class UserService {

  constructor(
    @Inject(forwardRef(() => StoreService)) private readonly storeService: StoreService,
    @Inject(forwardRef(() => ProductService)) private readonly productService: ProductService,
    @Inject(forwardRef(() => EngineerHistoryService)) private readonly engineerHistoryService: EngineerHistoryService,
    @InjectModel('User') private readonly userModel: Model<UserInterface>,
    
  ) {}
  
  // Find user while authenticating token
  // Used in middleware service
  async findOneAuth (id: String) {
    try {
      const user = await this.userModel.findOne({_id: id})
      if (!user) throw new HttpException('User logged out', 555)
      return user
    } catch (error) {
      throw error
    }
  }

  // Find user while logging in 
  // Used in auth service
  async findUsername(username, password){
    try {

      // If correct userName
      const user = await this.userModel.findOne({username})
      if (!user) throw new HttpException('Invalid credential', HttpStatus.UNAUTHORIZED)
    
      // If correct password
      const isMatched = await bcrypt.compare(password, user.password)
      if (!isMatched) throw new HttpException('Invalid credential', HttpStatus.UNAUTHORIZED)

      return user

    } catch (error) {
      throw error
    }
  }

  // Find user based on username
  // used in product
  async findName(name){
    try {
      const user = await this.userModel.findOne({
        username: name
      })
      if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND)
      return user
    } catch (error) {
      throw error
    }
  }

  // Change storename 
  // used in store
  async changeStoreName(storeName, updatedName){
    try {
      await this.userModel.updateMany(
        {storeName},
        {storeName: updatedName}
      )
  
      return 'Users have been updated'
    } catch (error) {
      throw error
    }
  }

  // Set sequence
  async squence(){
    try {
      const users = await this.userModel.find()
      if (users.length === 0){
        return 0
      }
      return users[users.length - 1].seq
    } catch (error) {
      throw error
    }
  }

  // Create user
  async create(req, createUserDto: CreateUserDto) {
    try {
      
      // if allowed to create 
      let roles = process.env.roles.split(',')
      let allowed = roles.indexOf(createUserDto.role) < roles.indexOf(req.user.role) 
      if (!allowed) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
      
      // if subAdmin is creating -> only for storeName equals to his
      if (req.user.role === 'subadmin' && createUserDto.storeName !== req.user.storeName) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)

      // if engineer then categoryOfEng is required
      if (createUserDto.role === 'engineer' && !createUserDto.categoryOfEng) throw new HttpException('Category of engineer is required', HttpStatus.BAD_REQUEST)

      // If user already exists
      const userExists = await this.userModel.findOne({username: createUserDto.username})
      if (userExists) throw new HttpException('Username is taken already', HttpStatus.CONFLICT)

      // create seq
      const seq = await this.squence()
      if (seq){
        createUserDto.seq = seq + 1
      }

      // createdBy
      createUserDto.createdBy = req.user.username
      createUserDto.createdByRole = req.user.role
      createUserDto.createdById = req.user._id

      // create user
      const user = new this.userModel(createUserDto)
      const store = await this.storeService.findName(createUserDto.storeName)

      // Add subAdmins to store if user is subAdmins
      if (createUserDto.role === 'subadmin'){
        store.subAdmins.push(user.username) 
        store.subAdminsIds.push(user._id.toString()) 
      }else{
        // Add engineers to store if user is engineer
        // if store subadmin doesn't exist - error
        if (store.subAdmins.length === 0) throw new HttpException('Assign subadmin to store', HttpStatus.FORBIDDEN)
        store.engineers.push(user.username)
        store.engineersIds.push(user._id.toString())
      }
      await store.save()

      // assign user to assignedUnderIds of all of his seniors
      let seniors
      if (user.role === "subadmin"){
        seniors = await this.userModel.find({
          role: "admin"
        })
      }else{
        seniors = await this.userModel.find({
          $or: [
            {role: "admin"},
            {$and: [{role: "subadmin"}, {storeName: user.storeName}]}
          ] 
        })
      }
      
      await Promise.all(seniors.map(async senior => {
        senior.assignedUnderIds.push(user._id.toString())
        await senior.save()
      }))

      //  if engineer - link workingHistory
      if (user.role === "engineer"){
        const historyId = await this.engineerHistoryService.create()
        user.workingHistory = historyId.toString()
      }

      // Save user
      await user.save()
      return user

    } catch (error) {
      throw error
    }
  }

  // Get all users based on page
  async findAll(req, page, filter) {
    try {

      // check allowed to access page
      if (page === "subadmin" && req.user.role !== "admin") throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)

      // If valid filter
      if (filter && filter.key !== "username") throw new HttpException('Invalid entry', HttpStatus.BAD_REQUEST)
      let query = {
        _id: {$in: req.user.assignedUnderIds}, 
        role: page
      }
      if (filter){
        query[filter.key] = {"$regex": filter.value, "$options": "i"}
      }

      const users = await this.userModel.find(query, {password:0, __v:0}).sort({createdAt: -1})
      return users

    } catch (error) {
      throw error
    }
  }

  // Get single user
  async findOne(req, id: String) {
    try {
      const user = await this.userModel.findOne({
        _id: id
      }, {password:0, __v:0})
      if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND)
      
      if (!req.user.assignedUnderIds.includes(id)) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
      return user

    } catch (error) {
      throw error
    }
  }
  
  // Find engineer
  async findEngineer(req, id){
    try {

      const engineer = await this.userModel.findOne(
        {_id: id, role: 'engineer'}
      )
      if (!engineer) throw new HttpException('User not found', HttpStatus.NOT_FOUND)
      if (!req.user.assignedUnderIds.includes(id)) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
      return engineer

    } catch (error) {
      throw error
    }
  }

  // Get history of single user
  async findHistory(req, id: String, date){
    try {

      // Find engineer
      const engineer = await this.findEngineer(req, id)
        
      // Pass workingHistory id to get history of engineer of given date
      return await this.engineerHistoryService.findOne(engineer.workingHistory, date)
    
    } catch (error) {
      throw error
    }
  }
  
  // Get single product's materials used
  async materialUsed(req, id: String, date, productId){
    try {

      // Find engineer
      const engineer = await this.findEngineer(req, id)
       
      // Pass workingHistory id to get materials used for given product assigned in given date
      return await this.engineerHistoryService.materialUsed(engineer.workingHistory, date, productId)
    
    } catch (error) {
      throw error
    }
  }

  // Update single user
  async update(req, id: String, updateUserDto: UpdateUserDto) {
    try {

      // Find user
      const user = await this.userModel.findOne({_id:id})
      if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND)
      if (!req.user.assignedUnderIds.includes(id)) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)

      // If compulsory fields are being updated to empty
      const compulsory = ["username", "password", "categoryOfEng"]
      for (let i = 0; i < compulsory.length; i++) {
        const field = compulsory[i];
        if (field in updateUserDto && updateUserDto[field] === ""){
          throw new HttpException('Invalid Entry', HttpStatus.BAD_REQUEST)
        }
      }

      if (updateUserDto.username){

        // If username is taken already
        if (user.username !== updateUserDto.username){
          const userExists = await this.userModel.findOne({username: updateUserDto.username})
          if (userExists) throw new HttpException('Username is taken already', HttpStatus.CONFLICT)
        }

        // Change assignedTo of products corresponding to user.username 
        await this.productService.changeAssignedTo(user.username, updateUserDto.username)

        if (user.role === "subadmin"){
          // Change store subAdmin 
          await this.storeService.changeSubAdmin(user.username, updateUserDto.username)

        }else if (user.role === "engineer"){
          // Change store engineer
          await this.storeService.changeEngineer(user.username, updateUserDto.username)
        }
      }

      // updated by
      updateUserDto.updatedBy = req.user.username
      updateUserDto.updatedByRole = req.user.role
      updateUserDto.updatedById = req.user._id
      updateUserDto.updatedAt = new Date()
      

      await this.userModel.findByIdAndUpdate(id, updateUserDto, {new:true})
      
      return

    } catch (error) { 
      throw error
    }
  }

  // Get all subadmins and admins
  async allUsers(req){
    try {
      const users = await this.userModel.find({
        $or: [{role: "subadmin"}, {role: "admin"}]
      }, { username:1, _id:0 })
      return users

    } catch (error) {
      throw error
    }
  }

  // Get all engineers
  async allEngineers(req){
    try {
      const engineers = await this.userModel.find({
        _id: {$in: req.user.assignedUnderIds},
        role: "engineer"
      }, { username:1})
      return engineers

    } catch (error) {
      throw error
    }
  }

  // Get materials asked by single user
  async materials(id){
    try {
      const engineer = await this.userModel.findOne({_id:id}, {materialsAsked:1, _id:0})
      return engineer.materialsAsked
    } catch (error) {
      throw error
    }
  }

  async exportData(req, page, filter, res){
    try {
      const users = await this.findAll(req, page, filter)
      const fields = userFields

      const parser = new Parser({
        fields
      })

      const json = []
      let userObj = {}
      users.forEach(user => {
        for (let index = 0; index < fields.length; index++) {
          userObj[fields[index]] = user[fields[index]] || null          
        }
        json.push({...userObj})
      })

      const csv = parser.parse(json)
      res.header('Content-Type', 'text/csv')
      res.attachment('user.csv')
      return res.send(csv)

    } catch (error) {
      throw error
    }
  }

}

