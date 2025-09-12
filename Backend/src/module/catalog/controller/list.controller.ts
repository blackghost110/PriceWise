import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import { Controller} from "@nestjs/common";
import {ListService} from "../service/list.service";

@ApiBearerAuth('access-token')
@ApiTags('List Controller')
@Controller('list')
export class ListController {
    constructor(private readonly listService: ListService) {}





}