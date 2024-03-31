import { CFGrouping, MinimalCFDimension, MinimalCFGroup } from '../core/index.js';

export interface IDataProviderBehavior {
    applyFilters(dimension: MinimalCFDimension, filters: any[]): void;
    storageKey(provider: any): any;
    getGroupings(dimension: any, group: MinimalCFGroup, chartId: string): ReadonlyArray<CFGrouping>;
}
