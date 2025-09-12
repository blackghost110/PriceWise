import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {TokenService} from "./jwt/token.service";
import {isNil} from "lodash";
import {SignInPayload} from "./model/payload/signin.payload";
import {Credential} from "./model/entity/credential.entity";
import {Token} from "./model/entity/token.entity";
import {comparePassword, encryptPassword} from "./utils/password.encoder";
import {SignupPayload} from "./model/payload/signup.payload";
import {Builder} from "builder-pattern";
import {RefreshTokenPayload} from "./model/payload/refresh.payload";
import {
    CredentialDeleteException,
    SignupException,
    UserAlreadyExistException,
    UserNotFoundException
} from "./security.exception";

@Injectable()
export class SecurityService {
    constructor(
        @InjectRepository(Credential)
        private readonly repository: Repository<Credential>,
        private readonly tokenService: TokenService,
    )
    {
    }
    //private readonly profilService: ProfilService;

    // soit detail(credential_id: string)
    async detail(id: string): Promise<Credential> {               // soit {credential_id}
        const result = await this.repository.findOneBy({credential_id: id});

        if (!(isNil(result))) {
            return result;
        }
        throw new UserNotFoundException();
    }

    async signIn(payload: SignInPayload): Promise<Token> {
        const result = await this.repository.findOneBy({username: payload.username});

        if (!isNil(result) && await comparePassword(payload.password, result.password)) {
            return this.tokenService.getTokens(result);
        }
        throw new UserNotFoundException();
    }

    async signup(payload: SignupPayload): Promise<Credential | null> {
        const result: Credential | null = await this.repository.findOneBy({username: payload.username});

        if (!isNil(result)) {
            throw new UserAlreadyExistException();
        }
        try {
            const encryptedPassword: string = await encryptPassword(payload.password);
            // Create the user account
            const newUser = await this.repository.save(
                Builder<Credential>()
                    .username(payload.username)
                    .password(encryptedPassword)
                    .email(payload.mail)
                    .build()
            );

            return newUser;


        } catch (e) {
            throw new SignupException();
        }
    }

    async refresh(payload: RefreshTokenPayload): Promise<Token> {
        return this.tokenService.refresh(payload);
    }

    async delete(id): Promise<void> {
        try {
            // verif credential
            const detail: Credential = await this.detail(id);
            await this.tokenService.deleteFor(detail);
            await this.repository.remove(detail);
        } catch (e) {
            // on se retrouve ici si detail leve une exception
            throw new CredentialDeleteException();
        }
    }



}