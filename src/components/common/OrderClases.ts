import {
	IOrderFormContacts,
	IOrderFormDelivery,
	IOrderSuccess,
	IOrderSuccessActions,
	PayOptions,
	IOrderResult
} from '../../types';
import { ensureAllElements, ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import { Form } from '../common-view/Form';

// Класс формы заполнения данных доставки и оплаты
export class OrderDeliveryFormView extends Form<IOrderFormDelivery> {
	protected paymentButtons: HTMLButtonElement[];
	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
		this.submitFormButton.addEventListener('click', () => {
			this.events.emit(`deliveryOrder:nextForm`);
		});
		this.paymentButtons = ensureAllElements('.button_alt', container);

		this.paymentButtons.forEach((button) => {
			button.addEventListener('click', (event) => {
				this.ressetButtons();
				this.toggleClass(button, 'button_alt-active', true);
				this.selectPayment(
					(event.target as HTMLButtonElement).name as PayOptions
				);
			});
		});
	}

	ressetButtons() {
		if (this.paymentButtons) {
			this.paymentButtons.forEach((item) => {
				this.toggleClass(item, 'button_alt-active', false);
			});
		}
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}

	selectPayment(method: PayOptions) {
		this.events.emit('deliveryOrder:change', {
			field: 'payment',
			value: method,
		});
	}

	protected onInputChange(
		field: keyof IOrderFormDelivery,
		value: string
	): void {
		this.events.emit('deliveryOrder:change', {
			field,
			value,
		});
	}
}

// класс формы заполнения данных почты и телефона
export class OrderContactFormView extends Form<IOrderFormContacts> {
	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
		this.submitFormButton.addEventListener('click', () => {
			this.events.emit('deliveryContacts:nextPayment')
		})
	}

	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}

	set phoneNumber(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}

    protected onInputChange(
		field: keyof IOrderFormContacts,
		value: string
	): void {
		this.events.emit('contactsOrder:change', {
			field,
			value,
		});
	}
}

// Класс окна успешного заказа
export class OrderSuccessView extends Component<IOrderResult> {
	totalValue: HTMLElement;
	close: HTMLElement;

	constructor(container: HTMLElement, actions: IOrderSuccessActions) {
		super(container);

		this.totalValue = ensureElement<HTMLElement>(
			`.order-success__description`,
			this.container
		);
		this.close = ensureElement<HTMLElement>(
			'.order-success__close',
			this.container
		);

		if (actions?.onClick) {
			this.close.addEventListener('click', actions.onClick);
		}

	}

	set total(value: number) {
		this.setText(this.totalValue, `Списано ${value} синапсов`);
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}
}
