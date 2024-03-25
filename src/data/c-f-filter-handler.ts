import { MinimalCFDimension } from '../core/types.js';
import { FilterStorageHelper, IFilterStorageConf } from './filter-storage-helper.js';

export interface ICFFilterHandlerConf extends IFilterStorageConf {
    dimension?: MinimalCFDimension;
    readonly shareFilters?: boolean;
}

export class CFFilterHandler extends FilterStorageHelper {
    protected _conf: ICFFilterHandlerConf;

    constructor(conf: ICFFilterHandlerConf = {}) {
        super({
            shareFilters: true,
            ...conf,
        });
    }
    public configure(conf: ICFFilterHandlerConf): this {
        return super.configure(conf);
    }

    public conf(): ICFFilterHandlerConf {
        return super.conf();
    }

    protected _storageKey(): any {
        if (this._conf.shareFilters) {
            return this._conf.dimension;
        } else {
            return this;
        }
    }

    public applyFilters() {
        if (!(this._conf.dimension && this._conf.dimension.filter)) {
            return;
        }

        if (this.filters.length === 0) {
            this._conf.dimension.filter(null);
        } else if (this.filters.length === 1 && !this.filters[0].isFiltered) {
            // single value and not a function-based filter
            this._conf.dimension.filterExact(this.filters[0]);
        } else if (this.filters.length === 1 && this.filters[0].filterType === 'RangedFilter') {
            // single range-based filter
            this._conf.dimension.filterRange(this.filters[0]);
        } else {
            this._conf.dimension.filterFunction(d => {
                for (let i = 0; i < this.filters.length; i++) {
                    const filter = this.filters[i];
                    if (filter.isFiltered) {
                        if (filter.isFiltered(d)) {
                            return true;
                        }
                    } else if (filter <= d && filter >= d) {
                        return true;
                    }
                }
                return false;
            });
        }
    }
}
