import { IFilterStorage } from './i-filter-storage.js';
import { IMinimalChart } from './i-minimal-chart.js';
import { IDataProviderBehavior } from '../data/index.js';

export interface IChartGroup {
    register(chart: IMinimalChart): void;
    deregister(chart: IMinimalChart): void;
    renderAll(): void;
    redrawAll(): void;
    filterAll(): void;
    refocusAll(): void;
    filterStorage: IFilterStorage;
    dataProviderBehavior: IDataProviderBehavior;
    beforeRedrawAll: () => Promise<void>;
    beforeRenderAll: () => Promise<void>;
    renderlet: () => void;
}
