import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {ListEntity} from "../model/list.entity";
import {Repository} from "typeorm";


@Injectable()
export class ListService {
    constructor(@InjectRepository(ListEntity) private readonly listRepository: Repository<ListEntity>,) {}



}