import { BaseAccessor, IFilterStorage, ValueAccessor } from '../core/index.js';
import { IDataProviderBehavior } from './i-data-provider-behavior.js';

// TODO: better typing for dimension and group
export interface ISimpleDataAdapterConf {
    readonly chartId?: string;
    readonly dimId?: string;
    readonly dimLabel?: string;
    readonly dimension?: any;
    readonly shareFilters?: boolean;
    readonly group?: any;
    readonly groupName?: string;
    readonly valueAccessor?: ValueAccessor;
    readonly ordering?: BaseAccessor<any>;
    readonly filterStorage?: IFilterStorage;
    readonly primaryChart?: boolean;
    readonly onFiltersChanged?: (filters: any[]) => void;
    readonly dataProviderBehavior?: IDataProviderBehavior;
}
