import {Body, Controller, Delete, Get, Param, Post} from "@nestjs/common";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {Public} from "@common/config/decorator/public.decorator";
import {SignInPayload} from "./model/payload/signin.payload";
import {SignupPayload} from "./model/payload/signup.payload";
import {RefreshTokenPayload} from "./model/payload/refresh.payload";
import {User} from "@common/config/decorator/user.decorator";
import {SecurityService} from "./security.service";
import {Credential} from "./model/entity/credential.entity";

@ApiBearerAuth('access-token')
@ApiTags('Account')
@Controller('account')
export class SecurityController {
    constructor(private readonly service: SecurityService) {}

    @Public()
    @Post('signin')
    public signIn(@Body() payload: SignInPayload) {
        return this.service.signIn(payload);
    }
    @Public()
    @Post('signup')
    public signUp(@Body() payload: SignupPayload) {
        return this.service.signup(payload);
    }
    @Public()
    @Post('refresh')
    public refresh(@Body() payload: RefreshTokenPayload) {
        return this.service.refresh(payload);
    }
    @Get('me')
    public me(@User() user: Credential) {
        return user;
    }
    @Delete('delete/:id')
    public delete(@Param('id') id: string) {
        return this.service.delete(id);
    }
}