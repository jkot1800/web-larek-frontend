import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/events";

interface IModalContent {
    content: HTMLElement;
}
// Общий Класс Modal
export class Modal extends Component<IModalContent> {
    protected modalCloseButton: HTMLButtonElement;
    protected modalContent: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);
        this.modalCloseButton = ensureElement<HTMLButtonElement>(`.modal__close`, container);
        this.modalContent = ensureElement<HTMLElement>(`.modal__content`, container);
        // нужно повесить слушатели на кнопки
        this.modalCloseButton.addEventListener('click', this.close.bind(this));
        this.container.addEventListener('click', this.close.bind(this));
        this.modalContent.addEventListener('click', (event) => event.stopPropagation());
    }
    set content(value: HTMLElement) {
        this.modalContent.replaceChildren(value);
    }

    open() {
        this.container.classList.add('modal_active');
        this.events.emit('modal:open');
    }
    close() {
        this.container.classList.remove('modal_active');
        this.events.emit('modal:close');
    }
    render(data?: Partial<IModalContent>): HTMLElement {
        super.render(data);
        this.open();
        return this.container;
    }

}