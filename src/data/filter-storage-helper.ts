import { IFilterStorage } from '../core/index.js';
import { FilterHandler } from './filter-handler.js';

export interface IFilterStorageConf {
    readonly filterStorage?: IFilterStorage;
    readonly chartId?: string;
    readonly dimName?: string;
    readonly primaryChart?: boolean;
    readonly onFiltersChanged?: (filters: any[]) => void;
}

export class FilterStorageHelper extends FilterHandler {
    private _listenerRegToken: any;
    protected _conf: IFilterStorageConf;

    constructor(conf: IFilterStorageConf) {
        super();
        this._conf = conf;
    }

    public conf(): IFilterStorageConf {
        return this._conf;
    }

    public configure(conf: IFilterStorageConf): this {
        this._conf = { ...this._conf, ...conf };
        this._ensureListenerRegistered();
        return this;
    }

    protected _storageKey(): any {
        return this;
    }

    get dimName(): string {
        return this._conf.dimName || this._conf.chartId;
    }

    private _ensureListenerRegistered() {
        if (!this._conf.filterStorage) {
            return;
        }

        // If it was already registered, we check if the storage key is still the same
        // in case that has changed, we need to deregister and register afresh

        const storageKey = this._storageKey();

        if (this._listenerRegToken) {
            if (this._listenerRegToken.storageKey === storageKey) {
                // all good, storageKey has not changed
                return;
            }
            // storageKey changed, de-register first
            this._deRegisterListener();
        }

        this._listenerRegToken = this._conf.filterStorage.registerFilterListener({
            storageKey,
            onFiltersChanged: this._conf.onFiltersChanged,
            dimName: this.dimName,
            primaryChart: this._conf.primaryChart,
            applyFilters: () => this.applyFilters(),
        });
    }

    private _deRegisterListener() {
        this._conf.filterStorage.deRegisterFilterListener(
            this._listenerRegToken.storageKey,
            this._listenerRegToken
        );
        this._listenerRegToken = undefined;
    }

    get filters(): any[] {
        return this._conf.filterStorage.getFiltersFor(this._storageKey());
    }

    set filters(value: any[]) {
        this._conf.filterStorage.setFiltersFor(this._storageKey(), value);
    }

    public notifyListeners(filters: any[]) {
        this._conf.filterStorage.notifyListeners(this._storageKey(), filters);
    }

    public dispose() {
        super.dispose();
        if (this._listenerRegToken) {
            this._deRegisterListener();
        }
    }
}
