import { AppApi } from './components/common/AppApi';
import { API_URL, CDN_URL } from './utils/constants';
import './scss/styles.scss';
import { Basket, Catalog, Order } from './components/common/AppData';
import { EventEmitter } from './components/base/events';
import { ICatalogEventData, IOrderForm, IProductItem } from './types';
import { cloneTemplate, ensureElement } from './utils/utils';
import { CardPreview, CardView } from './components/common/CardView';
import { PageView } from './components/common/PageView';
import { Modal } from './components/common-view/Modal';
import { BasketView } from './components/common/BasketView';
import {
	OrderContactFormView,
	OrderDeliveryFormView,
	OrderSuccessView,
} from './components/common/OrderClases';

//API сервера практикума
const api = new AppApi(CDN_URL, API_URL);

//Слушатель событий
const eventEmitter = new EventEmitter();

// Темплейты карточки каталога
const catalogCardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
// Темплейт карточки с превью для модального окна
const cardPrewievTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
// Темплейт карточки в корзине
const cardInBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
// Темплейт заказа формы с доставкой
const orderFormDelivery = ensureElement<HTMLTemplateElement>('#order');
// Темплейт заказа с формой где указываем телефон и почту
const orderFormContacts = ensureElement<HTMLTemplateElement>('#contacts');
// Темалейт окна успешного заказа
const orderSuccessTemplate = ensureElement<HTMLTemplateElement>('#success');

// Объект PageView
const page = new PageView(document.body, eventEmitter);
// Объект Model - class Catalog
const catalog = new Catalog(eventEmitter);
// Объект модального окна
const modal = new Modal(
	ensureElement<HTMLElement>('#modal-container'),
	eventEmitter
);
// Объект корзины
const basketObj = new Basket(eventEmitter);
// Объект вью корзины
const basketVw = new BasketView(cloneTemplate('#basket'), eventEmitter);
// Объект слоя модель с классом Order
const orderObj = new Order(eventEmitter);
// Объект вью Order с доставкой и способом оплаты
const orderVwDelivery = new OrderDeliveryFormView(
	cloneTemplate(orderFormDelivery),
	eventEmitter
);
// Объект вью Order с номером телефона и почтой
const orderVwContacts = new OrderContactFormView(
	cloneTemplate(orderFormContacts),
	eventEmitter
);
// Объект вью с окном успешного заказа
const orderVwSuccess = new OrderSuccessView(
	cloneTemplate(orderSuccessTemplate),
	{ onClick: () => modal.close() }
);

// Устанавливаем данные с сервера(Каталог товаров) в модель Catalog
const productsApi = () =>
	api
		.getProductsList()
		.then((data) => {
			catalog.setCatalog(data);
		})
		.catch((error) => {
			console.log(error);
		});

//Вызываем Api
productsApi();

//Обновляем каталог
eventEmitter.on('catalog:updated', (data: ICatalogEventData) => {
	const catalog = data.catalog.map((item) => {
		const cardCatalog = new CardView(cloneTemplate(catalogCardTemplate), {
			onClick: () => eventEmitter.emit('product:open', item),
		});
		return cardCatalog.render({
			id: item.id,
			title: item.title,
			price: item.price,
			image: item.image,
			category: item.category,
		});
	});
	page.catalog = catalog;
});

// Блокирование прокрутки страницы при появлении модального окна
eventEmitter.on('modal:open', () => {
	page.wrapperLock = true;
});

eventEmitter.on('modal:close', () => {
	page.wrapperLock = false;
});

//Открываем превью с товаром
eventEmitter.on('product:open', (productItem: IProductItem) => {
	const cardPreview = new CardPreview(cloneTemplate(cardPrewievTemplate), {
		onClick: () => {
			productItem.isAddedToBasket = !productItem.isAddedToBasket;
			if (productItem.isAddedToBasket) {
				eventEmitter.emit('product:addToBasket', productItem);
			} else {
				eventEmitter.emit('product:removeFromBasket', productItem);
			}
		},
	});
	const cardPreviewRender = {
		content: cardPreview.render({
			id: productItem.id,
			description: productItem.description,
			image: productItem.image,
			title: productItem.title,
			category: productItem.category,
			price: productItem.price,
			isAddedToBasket: productItem.isAddedToBasket,
		}),
	};
	modal.render(cardPreviewRender);
});

//Добавление товара в корзину
eventEmitter.on('product:addToBasket', (product: IProductItem) => {
	basketObj.addProductToBasket(product);
	//А надо ли закрывать корзину тут после добавления продукта?
	modal.close();
});

//Удаляем товар из корзины
eventEmitter.on('product:removeFromBasket', (product: IProductItem) => {
	basketObj.removeProductFromBasket(product);
});

//Обновление корзины и счетчика
eventEmitter.on('basket:changed', (productsInBasket: IProductItem[]) => {
	page.basketCountNumber = productsInBasket.length;
});

//Открытие корзины на странице
eventEmitter.on('basket:opened', () => {
	const basketListItems = basketObj.getProductList().basket;
	const cardsInBasketTemplates = basketListItems.map((item) => {
		const cardInBasket = new CardView(cloneTemplate(cardInBasketTemplate), {
			onClick: () => {
				item.isAddedToBasket = !item.isAddedToBasket;
				eventEmitter.emit('product:removeFromBasket', item);
				eventEmitter.emit('basket:opened');
			},
		});
		return cardInBasket.render({
			id: item.id,
			title: item.title,
			price: item.price,
		});
	});
	modal.render({
		content: basketVw.render({
			products: cardsInBasketTemplates,
			totalAmount: basketObj.getTotal(),
		}),
	});
});

// Иницилизация заказа при нажатии на кнопку в корзине
eventEmitter.on('orderInBasket:opened', () => {
	orderObj.items = basketObj.getProductsId();
	orderObj.total = basketObj.getTotal();
	modal.render({
		content: orderVwDelivery.render({
			address: '',
			payment: '',
			valid: false,
			errors: [],
		}),
	});
});

// Форма ввода даных оплаты и адреса и валидация этих данных
eventEmitter.on(
	'deliveryOrder:change',
	(data: { field: keyof IOrderForm; value: IOrderForm[keyof IOrderForm] }) => {
		orderObj.setDeliveryField(data.field, data.value);
	}
);

eventEmitter.on(
	'formErrors.delivery:changed',
	(errors: Partial<IOrderForm>) => {
		const { address, payment } = errors;
		orderVwDelivery.valid = !address && !payment;
		orderVwDelivery.errors = Object.values({ address, payment })
			.filter((i) => !!i)
			.join('; ');
	}
);

// Форма ввода данных телефона и почты и валидация этих данных
eventEmitter.on('deliveryOrder:nextForm', () => {
	modal.render({
		content: orderVwContacts.render({
			phone: '',
			email: '',
			valid: false,
			errors: [],
		}),
	});
});

eventEmitter.on(
	'formErrors.contacts:changed',
	(errors: Partial<IOrderForm>) => {
		const { phone, email } = errors;
		orderVwContacts.valid = !email && !phone;
		orderVwContacts.errors = Object.values({ phone, email })
			.filter((i) => !!i)
			.join('; ');
	}
);

eventEmitter.on(
	'contactsOrder:change',
	(data: { field: keyof IOrderForm; value: IOrderForm[keyof IOrderForm] }) => {
		orderObj.setContactsField(data.field, data.value);
	}
);

// Подтверждение оплаты и отправка данных с выводом модального окна успешной оплаты
eventEmitter.on('deliveryContacts:nextPayment', () => {
	const { payment, address, email, phone } = orderObj.order;
	// Создаем новый массив без бесценного товара, если он был добавлен в корзину
	const ArrWithDeletedPricelessItem: string[] = [];
	orderObj.items.forEach((item) => {
		if (item !== 'b06cde61-912f-4663-9751-09956c0eed67') {
			ArrWithDeletedPricelessItem.push(item);
		}
	});
	// Отправка данных клиента на сервер и вывод окна успешной покупки
	api
		.sendDataOrder({
			payment,
			address,
			email,
			phone,
			total: orderObj.total,
			items: ArrWithDeletedPricelessItem, //Передаем отфильтрованный массив
		})
		.then((data) => {
			basketObj.clearBasket();
			modal.render({
				content: orderVwSuccess.render({
					id: data.id,
					total: data.total,
				}),
			});
			page.basketCountNumber = 0;
			productsApi();
		})
		.catch((error) => {
			console.log(error);
		});
});
