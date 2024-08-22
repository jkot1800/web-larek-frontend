/* Интерфейс конкретного товара */
export interface IProductItem {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

/* Интерфейс массива с товарами */
interface IProductList {
	items: IProductItem[];
}

/* Интерфейс формы заказа */
interface IOrderForm {
	payment: string;
	email: string;
	phone: string;
	adress: string;
	total: number | string;
}

/* Массив с выбранными и добавленными в корзину товарами */
interface IOrder extends IOrderForm {
    items: string[];
}

/* состояние приложения */
interface IAppState {
    catalog: IProductItem[];
    basket: string[];
    preview: string;
    order: IOrder;
    total: string | number;
}

// Тип для ошибок валидации
type FormErrors = Partial<Record<keyof IOrder, string>>;

/* Результат заказа (Информация, которую отдаст сервер после получения заказа)*/
interface IOrderResult {
    id: string;
	total: number | string;
}
