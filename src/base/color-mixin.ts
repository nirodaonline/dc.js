import { scaleLinear, scaleOrdinal, scaleQuantize } from 'd3-scale';
import { interpolateHcl } from 'd3-interpolate';
import { max, min } from 'd3-array';

import { config } from '../core/config';
import { BaseMixin } from './base-mixin';
import { Constructor, MinimalColorScale } from '../core/types';
import { IColorMixinConf } from './i-color-mixin-conf';

/**
 * The Color Mixin is an abstract chart functional class providing universal coloring support
 * as a mix-in for any concrete chart implementation.
 * @mixin ColorMixin
 * @param {Object} Base
 * @returns {ColorMixin}
 */
// tslint:disable-next-line:variable-name
export function ColorMixin<TBase extends Constructor<BaseMixin>>(Base: TBase) {
    return class extends Base {
        protected _conf: IColorMixinConf;

        private _colors: MinimalColorScale;

        constructor(...args: any[]) {
            super();

            this.configure({
                colorCalculator: undefined,
                colorAccessor: (d, i?) => this._conf.keyAccessor(d),
            });

            this._colors = scaleOrdinal<any, string>(config.defaultColors());
        }

        public configure(conf: IColorMixinConf): this {
            super.configure(conf);
            return this;
        }

        public conf(): IColorMixinConf {
            return this._conf;
        }

        /**
         * Get the color for the datum d and counter i. This is used internally by charts to retrieve a color.
         * @method getColor
         * @memberof ColorMixin
         * @instance
         * @param {*} d
         * @param {Number} [i]
         * @returns {String}
         */
        public getColor(d, i?: number): string {
            return this._conf.colorCalculator
                ? this._conf.colorCalculator(d, i)
                : this._colors(this._conf.colorAccessor(d, i));
        }

        /**
         * Set the domain by determining the min and max values as retrieved by
         * {@link ColorMixin#colorAccessor .colorAccessor} over the chart's dataset.
         * @memberof ColorMixin
         * @instance
         * @returns {ColorMixin}
         */
        public calculateColorDomain(): this {
            // TODO: use extent from d3-array which does exactly this
            const newDomain = [
                min(this.data(), this._conf.colorAccessor),
                max(this.data(), this._conf.colorAccessor),
            ];
            this._colors.domain(newDomain);
            return this;
        }

        /**
         * Retrieve current color scale or set a new color scale. This methods accepts any function that
         * operates like a d3 scale.
         * @memberof ColorMixin
         * @instance
         * @see {@link https://github.com/d3/d3-scale/blob/master/README.md d3.scale}
         * @example
         * // alternate categorical scale
         * chart.colors(d3.scale.category20b());
         * // ordinal scale
         * chart.colors(d3.scaleOrdinal().range(['red','green','blue']));
         * // convenience method, the same as above
         * chart.ordinalColors(['red','green','blue']);
         * // set a linear scale
         * chart.linearColors(["#4575b4", "#ffffbf", "#a50026"]);
         * @param {d3.scale} [colorScale=d3.scaleOrdinal(d3.schemeCategory20c)]
         * @returns {d3.scale|ColorMixin}
         */
        public colors(): MinimalColorScale;
        public colors(colorScale: MinimalColorScale): this;
        public colors(colorScale?) {
            if (!arguments.length) {
                return this._colors;
            }
            if (colorScale instanceof Array) {
                this._colors = scaleQuantize<string>().range(colorScale); // deprecated legacy support, note: this fails for ordinal domains
            } else {
                this._colors = typeof colorScale === 'function' ? colorScale : () => colorScale;
            }
            return this;
        }

        /**
         * Convenience method to set the color scale to
         * {@link https://github.com/d3/d3-scale/blob/master/README.md#ordinal-scales d3.scaleOrdinal} with
         * range `r`.
         * @memberof ColorMixin
         * @instance
         * @param {Array<String>} r
         * @returns {ColorMixin}
         */
        public ordinalColors(r: string[]): this {
            return this.colors(scaleOrdinal<any, string>().range(r));
        }

        /**
         * Convenience method to set the color scale to an Hcl interpolated linear scale with range `r`.
         * @memberof ColorMixin
         * @instance
         * @param {Array<Number>} r
         * @returns {ColorMixin}
         */
        public linearColors(r: [string, string]): this {
            return this.colors(scaleLinear<any, string>().range(r).interpolate(interpolateHcl));
        }

        /**
         * Set or get the current domain for the color mapping function. The domain must be supplied as an
         * array.
         *
         * Note: previously this method accepted a callback function. Instead you may use a custom scale
         * set by {@link ColorMixin#colors .colors}.
         * @memberof ColorMixin
         * @instance
         * @param {Array<String>} [domain]
         * @returns {Array<String>|ColorMixin}
         */
        public colorDomain(): string[];
        public colorDomain(domain: string[]): this;
        public colorDomain(domain?) {
            if (!arguments.length) {
                return this._colors.domain();
            }
            this._colors.domain(domain);
            return this;
        }
    };
}