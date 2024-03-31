import { BaseAccessor, MinimalCFGroup, ValueAccessor } from '../core/types.js';
import { CFFilterHandler, ICFFilterHandlerConf } from './c-f-filter-handler.js';

export interface ICFSimpleAdapterConf extends ICFFilterHandlerConf {
    readonly group?: MinimalCFGroup;
    readonly groupName?: string;
    readonly valueAccessor?: ValueAccessor;
    readonly ordering?: BaseAccessor<any>;
}

export class CFSimpleAdapter extends CFFilterHandler {
    protected _conf: ICFSimpleAdapterConf;

    constructor(conf: ICFSimpleAdapterConf = {}) {
        super({
            valueAccessor: d => d.value,
            ordering: d => d.key,
            ...conf,
        });
    }

    public configure(conf: ICFSimpleAdapterConf): this {
        return super.configure(conf);
    }

    public conf(): ICFSimpleAdapterConf {
        return super.conf();
    }

    // TODO: better typing
    public data(): any {
        return this._getData(this._conf.dimension, this._conf.group, this._conf.valueAccessor);
    }

    protected _getData(
        dimension: any,
        group: MinimalCFGroup,
        valueAccessor: (d: any, i?: number) => any
    ) {
        // create a two-level deep copy defensively
        return this.helper
            .getGroupings(dimension, group)
            .map(grp => ({ ...grp, _value: valueAccessor(grp) }));
    }
}
