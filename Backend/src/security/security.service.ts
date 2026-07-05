import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isNil } from 'lodash';
import { Credential } from './model/entity/credential.entity';
import { Builder } from 'builder-pattern';
import * as admin from 'firebase-admin';
import {
  CredentialDeleteException,
  DisplayNameTakenException,
  DisplayNameUpdateException,
  UserNotFoundException,
  UserUpdateException,
  UserUpdateNotFoundException,
} from './security.exception';
import { UpdateUserPayload } from './model/payload/update-user.payload';
import { UpdateDisplayNamePayload } from './model/payload/update-display-name.payload';
import { DisplayNameAvailableResponse } from './model/type/display-name-available.response';

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

  // displayName n'est pas unique en base (pas de contrainte SQL) : on vérifie au niveau applicatif
  async isDisplayNameAvailable(displayName: string, currentUserId: string): Promise<DisplayNameAvailableResponse> {
    const existing = await this.repository.findOneBy({ displayName });
    const available = isNil(existing) || existing.credentialId === currentUserId;
    return { available };
  }

  async updateDisplayName(userId: string, payload: UpdateDisplayNamePayload): Promise<Credential> {
    const user = await this.repository.findOne({ where: { credentialId: userId } });
    if (!user) {
      throw new UserUpdateNotFoundException();
    }

    const existing = await this.repository.findOneBy({ displayName: payload.displayName });
    if (!isNil(existing) && existing.credentialId !== userId) {
      throw new DisplayNameTakenException();
    }

    try {
      user.displayName = payload.displayName;
      return await this.repository.save(user);
    } catch (e) {
      throw new DisplayNameUpdateException();
    }
  }

}
