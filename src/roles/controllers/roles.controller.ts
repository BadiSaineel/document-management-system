import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RolesService } from '../services/roles.service';
import { CREATE_ROLE, DELETE_ROLE, EDIT_ROLE, MANAGE_ROLE, VIEW_ROLE } from '../../common/constants/db.constants';

@ApiTags('roles')
@Controller('roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permissions(CREATE_ROLE)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Permissions(MANAGE_ROLE)
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Permissions(VIEW_ROLE)
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Patch(':id')
  @Permissions(EDIT_ROLE)
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @Permissions(DELETE_ROLE)
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }
}