/* Интерфейс конкретного товара */
export interface IProductItem {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
	// Добавлен ли товар в корзину
	isAddedToBasket?: boolean;
}

// Тип товара(его свойства) в корзине
export type ProductsInBasket = Pick<
	IProductItem,
	'id' | 'title' | 'price' | 'isAddedToBasket'
>;
// Интерфейс данных, передаваемых корзиной вместе с событием
export interface IBasketEventData {
	basket: ProductsInBasket[];
}

/* Интерфейс массива с товарами */
export interface IProductList {
	items: IProductItem[];
}

/* Общий тип формы заказа */
export type IOrderForm = Partial<IOrderFormContacts> &
	Partial<IOrderFormDelivery>;

// Интерфейс формы с указанием способа оплаты и адреса доставки
export interface IOrderFormDelivery {
	payment: string;
	address: string;
}
// Интерфейс формы указания контактов
export interface IOrderFormContacts {
	email: string;
	phone: string;
}

/* Массив с выбранными и добавленными в корзину товарами */
export interface IOrder extends IOrderForm {
	total: number;
	items: string[];
}
// Опции оплаты
export type PayOptions = 'card' | 'cash' | '';

/* состояние приложения */
export interface IAppState {
	catalog: IProductItem[];
	basket: string[];
	preview: string;
	order: IOrder;
	total: string | number;
}

// Тип для ошибок валидации
export type FormErrors = Partial<Record<keyof IOrder, string>>;

/* Результат заказа (Информация, которую отдаст сервер после получения заказа)*/
export interface IOrderResult {
	id: string;
	total: number | string;
}
// Интерфейс окна успеха заказа
export interface IOrderSuccess {
	total: number;
}
// Интерфейс события окна успеха заказа
export interface IOrderSuccessActions {
	onClick: () => void;
}

// 	Интерфейс данных передаваемы вместе с событием в каталоге
export interface ICatalogEventData {
	catalog: IProductItem[];
}
