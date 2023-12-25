export default class Queue {
    items;
    index;
    constructor(items) {
        if (!Array.isArray(items))
            throw new TypeError("Expected an array of items");
        this.items = items;
        this.index = 0;
    }
    get previous() {
        return this.index > 0;
    }
    get next() {
        return this.index < this.items.length - 1;
    }
    get firstItem() {
        if (this.previous)
            return this.items[(this.index = 0)];
    }
    get previousItem() {
        if (this.previous)
            return this.items[(this.index -= 1)];
    }
    get currentItem() {
        return this.items[this.index];
    }
    get nextItem() {
        if (this.next)
            return this.items[(this.index += 1)];
    }
    get lastItem() {
        if (this.next)
            return this.items[(this.index = this.items.length - 1)];
    }
    get randomItem() {
        return this.items[(this.index = Math.floor(Math.random() * this.items.length))];
    }
    at(index) {
        if (Number.isInteger(index))
            return this.items[index];
    }
    jump(index) {
        if (Number.isInteger(index) && index >= 0 && index < this.items.length)
            return this.items[(this.index = index)];
    }
    destroy() {
        delete this.items;
        delete this.index;
    }
}
