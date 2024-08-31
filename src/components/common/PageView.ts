import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/events";

interface IPageView {
    catalog: HTMLElement[];
}

// Метод отображения на главной странице
export class PageView extends Component<IPageView> {
    protected PageViewWrapper: HTMLElement;
    protected PageViewBasketButton: HTMLButtonElement;
    protected PageViewBasketCounter: HTMLElement;
    protected PageViewCatalogElement: HTMLElement;
    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);
        this.PageViewWrapper = ensureElement<HTMLElement>(`.page__wrapper`, this.container);
        this.PageViewBasketButton = ensureElement<HTMLButtonElement>(`.header__basket`, this.container);
        this.PageViewBasketCounter = ensureElement<HTMLElement>(`.header__basket-counter`, this.container);
        this.PageViewCatalogElement = ensureElement<HTMLElement>(`.gallery`, this.container);
        this.PageViewBasketButton.addEventListener('click', () => {
            this.events.emit('basket:opened');
        })

    }
    set catalog(productList: HTMLElement[]) {
        this.PageViewCatalogElement.replaceChildren(...productList);
    }

    set basketCountNumber(value: number) {
        this.setText(this.PageViewBasketCounter, value);
    } 
    // ДОБАВЬ МЕТОД В ДОКУМЕНТАЦИЮ
    set wrapperLock(value: boolean) {
        if (value) {
            this.PageViewWrapper.classList.add('page__wrapper_locked');
        }
        else {
            this.PageViewWrapper.classList.remove('page__wrapper_locked');
        }
    }

}