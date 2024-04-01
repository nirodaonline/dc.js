import { IFilterListenerParams, IFilterStorage } from './i-filter-storage.js';
import { IFilter } from './filters/i-filter.js';
import { filterFactory } from './filters/filter-factory.js';
import { ISerializedFilters } from './i-serialized-filters.js';
import { Dispatch, dispatch } from 'd3-dispatch';

export class FilterStorage implements IFilterStorage {
    // Current filters
    private _filters: Map<any, any>;

    // The list of listeners for each storage key
    //  will be dimension (id shareFilters is true) or the chart itself
    private _listenerChains: Map<any, IFilterListenerParams[]>;

    // notify when filter changes for any of the charts
    private _filterChangeListener: Dispatch<object>;

    constructor() {
        this._filters = new Map();
        this._listenerChains = new Map();
        this._filterChangeListener = dispatch('filter-changed');
    }

    public onFilterChange(key: string, callback: (this: object, ...args: any[]) => void) {
        this._filterChangeListener.on(`filter-changed.${key}`, callback);
    }

    public registerFilterListener(params: IFilterListenerParams): any {
        const storageKey = params.storageKey;
        if (!this._listenerChains.get(storageKey)) {
            this._listenerChains.set(storageKey, []);
        }
        const listener = { ...params };
        this._listenerChains.get(storageKey).push(listener);
        return listener;
    }

    public deRegisterFilterListener(storageKey: any, listener: any): void {
        // exclude this listener and retain the rest
        let listenerChain = this._listenerChains.get(storageKey);
        listenerChain = listenerChain.filter(l => l !== listener);
        this._listenerChains.set(storageKey, listenerChain);
    }

    public deRegisterAll(): void {
        this._filters = new Map();
        this._listenerChains = new Map();
    }

    public notifyListeners(storageKey: any, filters: any[]) {
        const listenerChain = this._listenerChains.get(storageKey);
        listenerChain
            .filter(l => typeof l.onFiltersChanged === 'function')
            .forEach(l => {
                l.onFiltersChanged(filters);
            });

        const chartIds = listenerChain.map(lsnr => lsnr.dimId);
        this._filterChangeListener.call('filter-changed', this, {
            chartIds,
            filters: this._filters.get(storageKey),
        });
    }

    public setFiltersFor(storageKey: any, filters: any[]) {
        this._filters.set(storageKey, filters);
    }

    public getFiltersFor(storageKey: any) {
        if (!this._filters.get(storageKey)) {
            this._filters.set(storageKey, []);
        }
        return this._filters.get(storageKey);
    }

    public resetFiltersAndNotify(storageKey: any) {
        this.setFiltersAndNotify(storageKey, []);
    }

    public setFiltersAndNotify(storageKey: any, filters: any[]) {
        // Update filters in the storage
        this.setFiltersFor(storageKey, filters);

        // Apply filters with the DataProvider - it will update CrossFilter
        // Applying it to just first entry is sufficient as these share the underlying dimension
        const listenerChain = this._listenerChains.get(storageKey);
        if (listenerChain && listenerChain[0]) {
            listenerChain[0].applyFilters(filters);
        }

        // Notify charts that filter has been updated
        this.notifyListeners(storageKey, filters);
    }

    public deserializeFiltersSetAndNotify(
        storageKey: any,
        entry: { filterType: any; values: any[] }
    ) {
        const filters = this._deSerializeFilters(entry.filterType, entry.values);
        this.setFiltersAndNotify(storageKey, filters);
    }

    public serialize(): ISerializedFilters[] {
        // Include items that have active filters
        // In case of Composite charts, include only the parent chart
        return Array.from(this._listenerChains.values())
            .map(listenersList => {
                // check if any item in the list corresponds to a non-child chart
                const listener = listenersList.find(l => l.primaryChart);

                if (listener) {
                    const filters = this._filters.get(listener.storageKey);
                    if (filters && filters.length > 0) {
                        return this._serializeFilters(
                          listener.dimId,
                          listener.dimLabel,
                          filters
                        );
                    }
                }
                return undefined;
            })
            .filter(o => o); // Exclude all undefined
    }

    public restore(entries: ISerializedFilters[]): void {
        const listenerChains = Array.from(this._listenerChains.values());

        const filtersToRestore = new Map(
            entries.map(entry => {
                // Find a listenerChain that has the same chartId registered
                const listenerChain = listenerChains.find((l: IFilterListenerParams[]) =>
                    l.find(listener => listener.dimId === entry.dimId)
                );

                // convert to appropriate dc IFilter objects
                const filters = this._deSerializeFilters(entry.filterType, entry.values);

                // pickup storageKey from first entry - all entries will have the same storage key
                const storageKey = listenerChain[0].storageKey;

                return [storageKey, filters];
            })
        );

        for (const storageKey of this._listenerChains.keys()) {
            // reset a filter if it is not getting restored
            const filters = filtersToRestore.has(storageKey)
                ? filtersToRestore.get(storageKey)
                : [];

            this.setFiltersAndNotify(storageKey, filters);
        }
    }

    private _serializeFilters(dimId: string, dimLabel: string, filters: any[]): ISerializedFilters {
        if (typeof filters[0].isFiltered !== 'function') {
            return {
                dimId,
                dimLabel,
                filterType: 'Simple',
                values: [...filters], // defensively clone
            };
        }

        const filtersWithType: IFilter[] = filters;
        return {
            dimId,
            dimLabel,
            filterType: filtersWithType[0].filterType,
            values: filtersWithType.map(f => f.serialize()),
        };
    }

    private _deSerializeFilters(filterType: string, values: any[]) {
        // Simple filters are simple list of items, not need to any additional instantiation
        if (filterType === 'Simple') {
            return values;
        }

        // Lookup filter factory based on the filter type
        const filterCreator = filterFactory[filterType];

        return values.map(f => filterCreator(f));
    }
}
