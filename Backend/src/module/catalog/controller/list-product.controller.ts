import {Controller} from "@nestjs/common";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {ListProductService} from "../service/list-product.service";

@ApiBearerAuth('access-token')
@ApiTags('List-Product Controller')
@Controller('list-product')
export class ListProductController {
    constructor(private readonly listProductService: ListProductService) {
    }

}