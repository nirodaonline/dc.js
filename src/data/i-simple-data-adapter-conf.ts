import {
    BaseAccessor,
    IFilterStorage,
    MinimalCFDimension,
    MinimalCFGroup,
    ValueAccessor,
} from '../core/index.js';
import { IDataProviderBehavior } from './i-data-provider-behavior.js';

export interface ISimpleDataAdapterConf {
    readonly chartId?: string;
    readonly dimId?: string;
    readonly dimension?: MinimalCFDimension;
    readonly shareFilters?: boolean;
    readonly group?: MinimalCFGroup;
    readonly groupName?: string;
    readonly valueAccessor?: ValueAccessor;
    readonly ordering?: BaseAccessor<any>;
    readonly filterStorage?: IFilterStorage;
    readonly primaryChart?: boolean;
    readonly onFiltersChanged?: (filters: any[]) => void;
    readonly dataProviderBehavior?: IDataProviderBehavior;
}
