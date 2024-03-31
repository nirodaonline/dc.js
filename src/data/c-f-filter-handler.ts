import { MinimalCFDimension } from '../core/types.js';
import { FilterStorageHelper, IFilterStorageConf } from './filter-storage-helper.js';
import { cfHelper } from './cf-helper.js';
import { ICFHelper } from './i-c-f-helper.js';

export interface ICFFilterHandlerConf extends IFilterStorageConf {
    dimension?: MinimalCFDimension;
    readonly shareFilters?: boolean;
}

export class CFFilterHandler extends FilterStorageHelper {
    protected _conf: ICFFilterHandlerConf;
    protected helper: ICFHelper = cfHelper;

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
        return this.helper.storageKey(this);
    }

    public applyFilters() {
        this.helper.applyFilters(this._conf.dimension, this.filters);
    }
}
