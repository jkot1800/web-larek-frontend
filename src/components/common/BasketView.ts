import { createElement,  ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/events';

interface IBasketView {
	products: HTMLElement[];
	totalAmount: number;
}

export class BasketView extends Component<IBasketView> {
	protected basketList: HTMLElement;
	protected basketOrderButton: HTMLButtonElement;
	protected totalAmountBasket: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);
		this.basketList = ensureElement<HTMLElement>(
			`.basket__list`,
			this.container
		);
		this.basketOrderButton = ensureElement<HTMLButtonElement>(
			`.button`,
			this.container
		);
		this.totalAmountBasket = ensureElement<HTMLElement>(
			`.basket__price`,
			this.container
		);
		this.basketOrderButton.addEventListener('click', () => {
			events.emit('orderInBasket:opened');
		});
        this.products = [];
        
        
	}
    set products(products: HTMLElement[]) {
        if (products.length) {
            products.forEach((item, index) => {
                const itemIndex: HTMLElement = item.querySelector('.basket__item-index');
                if (itemIndex) {
                    this.setText(itemIndex, (index + 1).toString());
                }
            });
            this.basketList.replaceChildren(...products);
            this.setVisible(this.totalAmountBasket);
            this.setDisabled(this.basketOrderButton, false);
        }
        
        else {
            this.basketList.replaceChildren(
                createElement<HTMLElement>('p', {
                    textContent: 'Добавьте товар в корзину',
                })
            )
            this.setHidden(this.totalAmountBasket);
            this.setDisabled(this.basketOrderButton, true);
        }
    }

    set totalAmount(value: number) {
        if (value === 0) {
            this.setText(this.totalAmountBasket, 'Бесценный товар нельзя купить!');
            this.setDisabled(this.basketOrderButton, true);
        }
        else {
            this.setText(this.totalAmountBasket, `${value} синапсов`);
        }
        
    }
}


