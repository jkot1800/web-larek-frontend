import { IProductItem } from '../../types';
import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';

interface IActionscCard {
	onClick: (event: MouseEvent) => void;
}
// Карточка в каталоге
export class CardView extends Component<IProductItem> {
	protected categoryCardElement?: HTMLElement;
	protected titleCardElement: HTMLElement;
	protected imageCardElement?: HTMLImageElement;
	protected priceCardElement: HTMLElement;
	protected buttonCardElement?: HTMLButtonElement;
	protected categoryColors? = <Record<string, string>>{
		'софт-скил': 'soft',
		'хард-скил': 'hard',
		другое: 'other',
		дополнительное: 'additional',
		кнопка: 'button',
	};

	constructor(container: HTMLElement, actions?: IActionscCard) {
		super(container);

		this.categoryCardElement = container.querySelector('.card__category');
		this.imageCardElement = container.querySelector('.card__image');
		this.buttonCardElement = container.querySelector('.card__button');
		this.titleCardElement = ensureElement<HTMLElement>(
			`.card__title`,
			container
		);

		this.priceCardElement = ensureElement<HTMLElement>(
			`.card__price`,
			container
		);

		if (actions?.onClick) {
			if(this.buttonCardElement) {
				this.buttonCardElement.addEventListener('click', actions.onClick);
			}
			else {
				this.container.addEventListener('click', actions.onClick);
			}
			
		}
	}

	set category(value: string) {
		this.setText(this.categoryCardElement, value);
		this.categoryCardElement.className = `card__category card__category_${this.categoryColors[value]}`;
	}

	set title(value: string) {
		this.setText(this.titleCardElement, value);
	}

	set image(value: string) {
		this.setImage(this.imageCardElement, value, this.title);
	}

	set price(value: string | number) {
		if (value === null) {
			this.setText(this.priceCardElement, `Бесценно`);
		} else {
			this.setText(this.priceCardElement, `${value} синапсов`);
		}
	}
}

// Карточка в превью
export class CardPreview extends CardView {
	protected cardPreviewDescription: HTMLElement;
	protected buttonCardPreviwElement: HTMLButtonElement;
	private _isAddedToBasket: boolean;
	constructor(container: HTMLElement, actions?: IActionscCard) {
		super(container, actions);
		this.cardPreviewDescription = ensureElement<HTMLElement>(
			`.card__text`,
			container
		);
		this.buttonCardPreviwElement = ensureElement<HTMLButtonElement>(
			`.card__button`,
			container
		);

		if (this.buttonCardPreviwElement) {
			this.buttonCardPreviwElement.addEventListener('click', () => {
				this.isAddedToBasket = !this.isAddedToBasket;
			});
		}

		if (actions?.onClick) {
			if (this.buttonCardPreviwElement) {
				container.removeEventListener('click', actions.onClick);
				this.buttonCardPreviwElement.addEventListener('click', actions.onClick);
			}
		}
	}

	// устанавливает описание
	set description(value: string) {
		this.setText(this.cardPreviewDescription, value);
	}

	setButtonStatus(status: boolean) {
		if (status) {
			this.setText(this.buttonCardPreviwElement, 'Убрать из корзины');
		} else {
			this.setText(this.buttonCardPreviwElement, 'В корзину');
		}
	}

	get isAddedToBasket(): boolean {
		return this._isAddedToBasket;
	}

	set isAddedToBasket(value: boolean) {
		this.setButtonStatus(value);
		this._isAddedToBasket = value;
	}

	render(data: IProductItem): HTMLElement {
		super.render(data);
		return this.container;
	}
}
