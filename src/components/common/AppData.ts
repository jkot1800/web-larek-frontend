import {
	IBasketEventData,
	IOrder,
	IOrderForm,
	IProductItem,
	ProductsInBasket,
	FormErrors,
	PayOptions,
} from '../../types/index';
import { Model } from '../base/Model';
import { IEvents } from '../base/events';

// Хранение информации о конкретном товаре
export class ProductItem extends Model<IProductItem> {
	constructor(data: IProductItem, events: IEvents) {
		super(data, events);
	}
}

// Работа с каталогом
export class Catalog extends Model<IProductItem[]> {
	protected catalogList: IProductItem[] = [];
	constructor(events?: IEvents) {
		super([], events);
	}
	// Устанавливает данные в каталог
	setCatalog(catalog: IProductItem[]) {
		this.catalogList = catalog.map((item) => ({
			...item,
			isAdedToBasket: false,
		}));

		this.emitChanges('catalog:updated', { catalog: this.catalogList });
	}
    // Получение каталога
    getCatalog() {
        return this.catalogList;
    }
}

// Работа с корзиной
export class Basket extends Model<ProductsInBasket[]> {
	protected productItemList: ProductsInBasket[] = [];
	constructor(events?: IEvents) {
		super([], events);
	}
	// Информирует об изменении в корзине. (Вызывается в методе)
	changedProductList() {
		this.events.emit('basket:changed', this.productItemList);
	}

	// Метод добавления товара в корзину(в массив productItemList)
	addProductToBasket(product: IProductItem) {
		const isProductInArray = this.productItemList.findIndex(
			(item) => item.id === product.id
		);
		if (isProductInArray === -1) {
			this.productItemList.push(product);
		}
		this.changedProductList();
	}

	// Метод удаляет товар из корзины. Ищет совпадения по id и возвращает массив без переданного товара
	removeProductFromBasket(product: IProductItem) {
		this.productItemList = this.productItemList.filter((item) => {
			return item.id !== product.id;
		});
		this.changedProductList();
	}

	// Метод очищает корзину с товарами (Возможно требует доработки?????)
	clearBasket() {
		this.productItemList = [];
	}

	//Метод получает общую сумму цен товаров в корзине
	getTotal() {
		let totalPriseCounter = 0;
		this.productItemList.forEach((item) => {
			if (item.price === null) {
				totalPriseCounter = totalPriseCounter + 0;
			} else {
				totalPriseCounter = totalPriseCounter + item.price;
			}
		});
		return totalPriseCounter;
	}
	//Массив с Id товаров в корзине, для передачи на сервер
	getProductsId() {
		const arrWithId: string[] = [];
		this.productItemList.forEach((item) => {
			arrWithId.push(item.id);
		});
		return arrWithId;
	}

	//Метод мередает данные из корзины вместе с событием
	getProductList(): IBasketEventData {
		return {
			basket: this.productItemList,
		};
	}

	//Метод для отслеживания есть ли в корзине что то или нет. Если корзина не пустая, передает событие
	makeOrder() {
		if (this.productItemList.length > 0) {
			this.emitChanges('basket:makeOrder');
		}
	}
}

// Работа с формами заказа
export class Order extends Model<IOrder> {
	order: IOrderForm = {
		payment: '',
		address: '',
		email: '',
		phone: '',
		
	};
	total?: number;
	items?: string[];
	formErrors: FormErrors = {};
	constructor(events?: IEvents) {
		super({}, events);
	}

	// Устанавливает значения в поля доставки(форма оплаты и адрес доставки) и производит валидацию
	setDeliveryField(
		setField: keyof IOrderForm,
		value: IOrderForm[keyof IOrderForm]
	) {
		if (setField === 'payment') {
			this.order[setField] = value as PayOptions;
		}
		if (setField === 'address') {
			this.order[setField] = value;
		}
		if (this.validationDelivery()) {
			this.events.emit('order.delivery:ok', this.order);
		}
	}

	// Метод валидации данных способа оплаты и доставки
	validationDelivery() {
		const errors: typeof this.formErrors = {};
		if (!this.order.address) {
			errors.address = 'Введите адрес доставки';
		}
		if (!this.order.payment) {
			errors.payment = 'Укажите способ оплаты';
		}
		this.formErrors = errors;
		this.events.emit('formErrors.delivery:changed', this.formErrors);
		return Object.keys(errors).length === 0;
	}
	// Устанавливает значения в поля Email и телефон, производит валидацию полей
	setContactsField(
		setField: keyof IOrderForm,
		value: IOrderForm[keyof IOrderForm]
	) {
		if (setField === 'email') {
			this.order[setField] = value;
		}
		if (setField === 'phone') {
			this.order[setField] = value;
		}
		if (this.validationContacts()) {
			this.events.emit('order.contacts:ok', this.order);
		}
	}

	//Метод валидации данных email и телефона
	validationContacts() {
		const errors: typeof this.formErrors = {};
		if (!this.order.email) {
			errors.email = 'Введите вашу элеткронную почту';
		}
		if (!this.order.phone) {
			errors.phone = 'Введите ваш номер телефона';
		}
		this.formErrors = errors;
		this.events.emit('formErrors.contacts:changed', this.formErrors);
		return Object.keys(errors).length === 0;
	}
}
