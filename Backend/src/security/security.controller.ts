import {Body, Controller, Delete, Get, Param, Put, Query } from "@nestjs/common";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {User} from "@common/config/decorator/user.decorator";
import {SecurityService} from "./security.service";
import { Credential } from './model/entity/credential.entity';
import { UpdateUserPayload } from "./model/payload/update-user.payload";
import { UpdateDisplayNamePayload } from './model/payload/update-display-name.payload';

@ApiBearerAuth('access-token')
@ApiTags('Account')
@Controller('account')
export class SecurityController {
    constructor(private readonly service: SecurityService) {}

    @Get('me')
    public me(@User() user: Credential) {
        return user;
    }
    @Get('all')
    public all() {
      return this.service.all();
    }
    @Delete('delete/:id')
    public delete(@Param('id') id: string) {
        return this.service.delete(id);
    }
    @Put(':userId')
    public update(@Param('userId') userId: string, @Body() payload: UpdateUserPayload) {
      return this.service.update(userId, payload);
    }
    @Get('display-name/available')
    public isDisplayNameAvailable(@User() user: Credential, @Query('value') value: string) {
      return this.service.isDisplayNameAvailable(value, user.credentialId);
    }
    @Put('me/display-name')
    public updateDisplayName(@User() user: Credential, @Body() payload: UpdateDisplayNamePayload) {
      return this.service.updateDisplayName(user.credentialId, payload);
    }
}
