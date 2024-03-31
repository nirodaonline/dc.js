import { MinimalCFGroup } from '../core/types.js';
import { ISimpleDataAdapterConf } from './i-simple-data-adapter-conf.js';
import { FilterStorageHelper } from './filter-storage-helper.js';

interface IGetDataParams {
    dimension: any;
    group: MinimalCFGroup;
    chartId: string;
    valueAccessor: (d: any, i?: number) => any;
}

export class SimpleDataAdapter extends FilterStorageHelper {
    protected _conf: ISimpleDataAdapterConf;

    constructor(conf: ISimpleDataAdapterConf = {}) {
        super({
            valueAccessor: d => d.value,
            ordering: d => d.key,
            ...conf,
        });
    }

    // TODO: better typing
    public data(): any {
        const { dimension, group, chartId, valueAccessor } = this._conf;
        return this._getData({dimension, group, chartId, valueAccessor});
    }

    protected _getData(
        {dimension, group, chartId, valueAccessor}: IGetDataParams
    ) {
        // create a two-level deep copy defensively
        return this.providerBehavior
            .getGroupings(dimension, group, chartId)
            .map(grp => ({ ...grp, _value: valueAccessor(grp) }));
    }
}
