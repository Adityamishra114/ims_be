import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, HttpStatus, UseGuards, HttpException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/decorator/auth.decorator';

@Controller('user')
@UseGuards(RolesGuard)

export class UserController {
  constructor(private readonly userService: UserService) {}

  // Only admin and subadmin access
  @Post('create')
  @Roles('admin', 'subadmin')
  async create(@Res() res, @Req() req, @Body() createUserDto:CreateUserDto) {
    try {
      const user = await this.userService.create(req, createUserDto)
      res.status(HttpStatus.CREATED).json('User has been created successfully')
    } catch (error) {
      throw error
    }
  }

  // Only admin and subadmin access
  @Post('allusers')
  @Roles('admin', 'subadmin')
  async findAll(@Res() res, @Req() req, @Body('page') page: string, @Body('filter') filter: Object) {
    let allowed = ["subadmin","engineer"]
    if (allowed.indexOf(page) == -1 ) throw new HttpException('Invalid entry', HttpStatus.BAD_REQUEST)
    try {
      const users = await this.userService.findAll(req, page, filter);
      res.status(HttpStatus.OK).json(users)
    } catch (error) {
      throw error
    }
  }

  // Only admin and subadmin access
  @Get(':id')
  @Roles('admin', 'subadmin')
  async findOne(@Res() res, @Req() req, @Param('id') id: String) {
    try {
      const user = await this.userService.findOne(req, id);
      res.status(HttpStatus.OK).json(user)
    } catch (error) {
      throw error
    }
  }

  // Only admin and subadmin access
  @Post('history/:id')
  @Roles('admin', 'subadmin')
  async findHistory(@Res() res, @Req() req, @Param('id') id: String, @Body('date') date: String = '') {
    try {
      const user = await this.userService.findHistory(req, id, date);
      res.status(HttpStatus.OK).json(user)
    } catch (error) {
      throw error
    }
  }

  // get sinngle product's material used
  // Only admin and subadmin access
  @Post('product/material/:id')
  @Roles('admin', 'subadmin')
  async materialUsed(@Res() res, @Req() req, @Param('id') id: String, @Body('date') date: String = '', @Body('productId') productId: String) {
    try {
      const user = await this.userService.materialUsed(req, id, date, productId);
      res.status(HttpStatus.OK).json(user)
    } catch (error) {
      throw error
    }
  }


  // Only admin and subadmin access
  @Post(':id')
  @Roles('admin', 'subadmin')
  async update(@Res() res, @Req() req, @Param('id') id: String, @Body() updateUserDto: UpdateUserDto) {
    try {
      await this.userService.update(req, id, updateUserDto)
      res.status(HttpStatus.OK).json('User has been updated')
    } catch (error) {
      throw error
    }
  }
  
  // dropdown
  
  // all engineers under logged in user - with same store as product
  @Get('allEngineers/dropdown')
  async allEngineers(@Res() res, @Req() req){
    try {
      const engineers = await this.userService.allEngineers(req)
      res.status(HttpStatus.OK).json(engineers)
    } catch (error) {
      throw error
    }
  }

  // Export
  @Post('export/data')
  @Roles('admin', 'subadmin')
  async exportData(@Res() res, @Req() req, @Body('page') page: string, @Body('filter') filter: Object){
    let allowed = ["subadmin","engineer"]
    if (allowed.indexOf(page) == -1 ) throw new HttpException('Invalid entry', HttpStatus.BAD_REQUEST)
    try {
      await this.userService.exportData(req, page, filter,res)
    } catch (error) {
      throw error
    }
  }

  // all subadmins and admins
  @Get('allUsers/dropdown')
  async allUsers(@Res() res, @Req() req){
    try {
      const users = await this.userService.allUsers(req)
      res.status(HttpStatus.OK).json(users)
    } catch (error) {
      throw error
    }
  }

}
