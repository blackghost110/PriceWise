import {
  Injectable,
} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {ListEntity} from "../model/list.entity";
import { ILike, Repository} from "typeorm";
import { Credential } from '../../../security/model/entity/credential.entity';
import { CreateListDto } from '../model/dto/create-list.dto';
import { ListResponse } from '../model/type/list.response';
import {
  ListCreateConflictException,
  ListCreateException,
  ListDeleteException,
  ListDeleteForbiddenException,
  ListDeleteNotFoundException,
  ListGetByUserException,
  ListUpdateConflictException,
  ListUpdateException,
  ListUpdateForbiddenException,
  ListUpdateNotFoundException,
} from '../catalog.exception';


@Injectable()
export class ListService {
  constructor(
    @InjectRepository(ListEntity)
    private readonly listRepository: Repository<ListEntity>,
  ) {}

  async createList(user: Credential, dto: CreateListDto) {
    const existingList = await this.listRepository.findOne({
      where: {
        name: ILike(dto.name),
      },
    });
    if (existingList) {
      throw new ListCreateConflictException();
    }
    try {
      const list = new ListEntity();
      Object.assign(list, dto);
      list.user = user;
      return await this.listRepository.save(list);
    } catch (e) {
      throw new ListCreateException();
    }
  }

  async getListsByUser(user: Credential): Promise<ListResponse[]> {
    try {
      return await this.listRepository.find({
        where: {
          user: { credentialId: user.credentialId },
        },
      });
    } catch (e) {
      throw new ListGetByUserException();
    }
  }

  async updateList(user: Credential, listId: number, dto: CreateListDto) {
    const list = await this.listRepository.findOne({
      where: { listId },
      relations: ['user'],
    });
    if (!list) {
      throw new ListUpdateNotFoundException();
    }
    const isExistingList = await this.listRepository.find({
      where: {
        name: ILike(dto.name),
        user: { credentialId: user.credentialId },
      },
      relations: ['user'],
    });
    if (isExistingList.length > 0) {
      throw new ListUpdateConflictException();
    }

    if (list.user.credentialId !== user.credentialId) {
      throw new ListUpdateForbiddenException();
    }

    try {
      Object.assign(list, dto);
      return await this.listRepository.save(list);
    } catch (e) {
      throw new ListUpdateException();
    }
  }

  async deleteList(listId: number, user: Credential): Promise<void> {
    const list = await this.listRepository.findOne({
      where: { listId },
      relations: ['user'],
    });
    if (!list) {
      throw new ListDeleteNotFoundException();
    }
    if (list.user.credentialId !== user.credentialId) {
      throw new ListDeleteForbiddenException();
    }
    try {
      await this.listRepository.remove(list);
    } catch (e) {
      throw new ListDeleteException();
    }
  }

}