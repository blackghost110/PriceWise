import {BadRequestException, ConflictException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {PriceEntity} from "../model/price.entity";
import { Repository} from "typeorm";
import {CreatePriceDto} from "../model/dto/create-price.dto";
import {Credential} from "../../../security/model/entity/credential.entity";
import {ProductEntity} from "../model/product.entity";
import {UpdatePriceDto} from "../model/dto/update-price.dto";

@Injectable()
export class PriceService {
    constructor(@InjectRepository(PriceEntity) private readonly priceRepository: Repository<PriceEntity>,
                @InjectRepository(Credential) private readonly credentialRepository: Repository<Credential>,
                @InjectRepository(ProductEntity) private readonly productRepository: Repository<ProductEntity>,) {}

    async createPrice(userId: string , createPriceDto: CreatePriceDto, productId: number) {
        const user = await this.credentialRepository.findOne({ where: { credential_id: userId }})
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const product = await this.productRepository.findOne({ where: { productId } });
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        if (createPriceDto.productPrice <= 0 || createPriceDto.grossPrice <= 0) {
            throw new BadRequestException('Price should be greater than 0');
        }


        const existingPrice = await this.priceRepository.findOne({
            where: {
                product: {productId: productId},
                priceDate: createPriceDto.priceDate
            }
        })
      console.log('existingPrice : ', existingPrice);
        if (existingPrice) {
            throw new ConflictException(`Price already exists for this date`);
        }

        const price = new PriceEntity();
        price.productPrice = createPriceDto.productPrice;
        price.grossPrice = createPriceDto.grossPrice;
        price.product = product;
        price.user = user;

        if (createPriceDto.priceDate) {
            price.priceDate = createPriceDto.priceDate;
        }

        return await this.priceRepository.save(price);
    }

    async getProductPrices(productId: number) {
        return await this.priceRepository.find({
            where: {
                product: {productId: productId}
            },
            order: {
                created: 'DESC'
            }
        })
    }

    async getProductLastPrice(productId: number) {
        return await this.priceRepository.findOne({
            where: { product: {productId} },
            order: { priceDate: 'DESC'}
        })
    }

    async updatePrice(user: Credential , updatePriceDto: UpdatePriceDto, priceId: number) {

        if ((updatePriceDto.productPrice ?? 1) <= 0 || (updatePriceDto.grossProductPrice ?? 1) <= 0) {
            throw new BadRequestException('Price should be greater than 0');
        }
        const price = await this.priceRepository.findOne({ where: { priceId } });
        if (!price) {
            throw new NotFoundException('Price not found');
        }
        console.log('price : ', price)
        console.log('updateDTO :', updatePriceDto)

        Object.assign(price, updatePriceDto);
        price.user = user;


        return await this.priceRepository.save(price);
    }


}