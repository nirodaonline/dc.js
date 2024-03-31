import { BaseDataAdapter } from './base-data-adapter.js';
import { ISimpleDataAdapterConf } from './i-simple-data-adapter-conf.js';

export class FilterStorageHelper extends BaseDataAdapter {
    private _listenerRegToken: any;

    public configure(conf: ISimpleDataAdapterConf): this {
        super.configure(conf);
        this._ensureListenerRegistered();
        return this;
    }

    protected _storageKey(): any {
        return this.providerBehavior.storageKey(this);
    }

    get dimId(): string {
        return this._conf.dimId || this._conf.chartId;
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
            dimId: this.dimId,
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
