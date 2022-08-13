export = BasicEventEmitter;
declare class BasicEventEmitter {
    /** @type {Map<string, Map<(...args: any[])=>void, {once: boolean}>>} */
    listeners: Map<string, Map<(...args: any[]) => void, {
        once: boolean;
    }>>;
    _prepareListenersMap(eventName: any): void;
    /**
     * @param {string} eventName
     * @param {(...args: any[])=>void} listener
     */
    on(eventName: string, listener: (...args: any[]) => void): void;
    /**
     * @param {string} eventName
     * @param {(...args: any[])=>void} listener
     */
    once(eventName: string, listener: (...args: any[]) => void): void;
    /**
     * @param {string?} eventName
     * @param {((...args: any[])=>void)?} listener
     */
    off(eventName: string | null, listener: (...args: any[]) => void): boolean | Map<any, any>;
    /**
     * @param {string} eventName
     * @param  {...any} args
     */
    emit(eventName: string, ...args: any[]): void;
    /**
     * @param {string} eventName
     * @param {(...args: any[])=>void} listener
     * @param {{once: boolean}} opts
     */
    addEventListener(eventName: string, listener: (...args: any[]) => void, opts?: {
        once: boolean;
    }): void;
    /**
     * @param {string} eventName
     * @param {((...args: any[])=>void)?} listener
     */
    removeEventListener(eventName: string, listener: (...args: any[]) => void): void;
    /**
     * @param {string} eventName
     * @param {(...args: any[])=>void} listener
     * @param {{once: boolean}} opts
     */
    addListener(eventName: string, listener: (...args: any[]) => void, opts?: {
        once: boolean;
    }): void;
    /**
     * @param {string} eventName
     * @param {((...args: any[])=>void)?} listener
     */
    removeListener(eventName: string, listener: (...args: any[]) => void): void;
}
