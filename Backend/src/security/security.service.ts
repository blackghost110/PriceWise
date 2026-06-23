import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isNil } from 'lodash';
import { Credential } from './model/entity/credential.entity';
import { Builder } from 'builder-pattern';
import * as admin from 'firebase-admin';
import {
  CredentialDeleteException,
  UserNotFoundException,
  UserUpdateException,
  UserUpdateNotFoundException,
} from './security.exception';
import { UpdateUserPayload } from './model/payload/update-user.payload';

@Injectable()
export class SecurityService {
  constructor(
    @InjectRepository(Credential)
    private readonly repository: Repository<Credential>,
  ) {}
  //private readonly profilService: ProfilService;

  async detail(id: string): Promise<Credential> {
    const result = await this.repository.findOneBy({ credentialId: id });

    if (!isNil(result)) {
      return result;
    }
    throw new UserNotFoundException();
  }

  // appelé par le FirebaseAuthGuard a chaque requete authentifiee : retrouve le Credential
  // lie a l'uid Firebase, ou le provisionne automatiquement lors de la 1ere connexion
  async findOrCreate(decodedToken: admin.auth.DecodedIdToken): Promise<Credential> {
    const existing = await this.repository.findOneBy({ credentialId: decodedToken.uid });
    if (!isNil(existing)) {
      return existing;
    }
    return await this.repository.save(
      Builder<Credential>()
        .credentialId(decodedToken.uid)
        .email(decodedToken.email ?? '')
        .displayName(decodedToken.name ?? decodedToken.email ?? 'Utilisateur')
        .build(),
    );
  }

  async delete(id): Promise<void> {
    try {
      // verif credential
      const detail: Credential = await this.detail(id);
      await this.repository.remove(detail);
    } catch (e) {
      // on se retrouve ici si detail leve une exception
      throw new CredentialDeleteException();
    }
  }

  async all(): Promise<Credential[]> {
    return await this.repository.find();
  }

  async update(userId: string, payload: UpdateUserPayload) {
    const user = await this.repository.findOne({
      where: { credentialId: userId },
    });

    if (!user) {
      throw new UserUpdateNotFoundException();
    }

    try {
      Object.assign(user, payload);
      return await this.repository.save(user);
    } catch (e) {
      throw new UserUpdateException();
    }
  }


}
