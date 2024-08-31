import { Api, ApiListResponse } from '../base/api';
import { IOrder, IProductItem, IOrderResult } from '../../types/index';

export class AppApi extends Api {
	cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getProductsList(): Promise<IProductItem[]> {
		return this.get('/product').then((data: ApiListResponse<IProductItem>) => {
			return data.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
			}));
		});
	}

	getProductItem(productId: string): Promise<IProductItem> {
		return this.get(`/product/${productId}`).then((item: IProductItem) => ({
			...item,
			image: this.cdn + item.image,
		}));
	}

	sendDataOrder(order: IOrder): Promise<IOrderResult> {
		return this.post('/order', order).then((data: IOrderResult) => data);
	}
}
