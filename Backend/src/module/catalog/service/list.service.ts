import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {ListEntity} from "../model/list.entity";
import { ILike, Repository} from "typeorm";
import { CreateStoreDto } from '../model/dto/create-store.dto';
import { StoreEntity } from '../model/store.entity';
import { Credential } from '../../../security/model/entity/credential.entity';
import { CreateListDto } from '../model/dto/create-list.dto';
import { ListResponse } from '../model/type/list.response';
import { CredentialDeleteException } from '../../../security/security.exception';
import { isNil } from 'lodash';


@Injectable()
export class ListService {
  constructor(
    @InjectRepository(ListEntity) private readonly listRepository: Repository<ListEntity>,
    @InjectRepository(Credential) private readonly credentialRepository: Repository<Credential>,
  ) {}

  async createList(user: Credential, dto: CreateListDto) {
    const existingList = await this.listRepository.findOne({
      where: {
        name: ILike(dto.name),
      },
    });
    if (existingList) {
      throw new ConflictException(
        `Store named '${existingList.name}' already exists at this address`,
      );
    }

    const list = new ListEntity();
    Object.assign(list, dto);
    list.user = user;
    return await this.listRepository.save(list);
  }

  async getListsByUser(user: Credential): Promise<ListResponse[]> {
    return await this.listRepository.find({
      where: {
        user: {credential_id: user.credential_id},
      },
    });
  }

  async updateList(user: Credential, listId: number, dto: CreateListDto) {
    const list = await this.listRepository.findOne({ where: { listId }, relations: ['user']});
    if (!list) {
      throw new NotFoundException(`list not found`,);
    }
    const isExistingList = await this.listRepository.find({
      where: {
        name: ILike(dto.name),
        user: {credential_id: user.credential_id}
      },
      relations: ['user']
    })
    if (isExistingList.length > 0) {
      throw new ConflictException(`List named '${dto.name}' already exists in this user`,);
    }

    if (list.user.credential_id !== user.credential_id) {
      throw new ForbiddenException(`you are not the owner of this list`,);
    }


    Object.assign(list, dto);
    return await this.listRepository.save(list);
  }

  async deleteList(listId: number, user: Credential): Promise<void> {
    try {

      const list = await this.listRepository.findOne({ where: { listId }, relations: ['user']});
      if (!list) {
        throw new NotFoundException(`list not found`,);
      }
      if (list.user.credential_id !== user.credential_id) {
        throw new ForbiddenException(`you are not the owner of this list`,);
      }
      await this.listRepository.remove(list);
    } catch (e) {
      throw new CredentialDeleteException();
    }
  }
}