import d3chart from '../d3.chart'
import {select, selectAll} from 'd3-selection'
import {scaleOrdinal, scaleLinear, scaleTime} from 'd3-scale'
import {timeParse, timeFormat} from 'd3-time-format'
import {max, min, extent} from 'd3-array'
import {line, area} from 'd3-shape'
import {transition} from 'd3-transition'
import {axisLeft, axisBottom} from 'd3-axis'
import {easeLinear, easePolyIn, easePolyOut, easePoly, easePolyInOut,
    easeQuadIn, easeQuadOut, easeQuad, easeQuadInOut, easeCubicIn,
    easeCubicOut, easeCubic, easeCubicInOut, easeSinIn, easeSinOut,
    easeSin, easeSinInOut, easeExpIn, easeExpOut, easeExp,
    easeExpInOut, easeCircleIn, easeCircleOut, easeCircle,
    easeCircleInOut, easeElasticIn, easeElastic, easeElasticOut,
    easeElasticInOut, easeBackIn, easeBackOut, easeBack, easeBackInOut,
    easeBounceIn, easeBounce, easeBounceOut, easeBounceInOut} from 'd3-ease'
import {curveBasis, curveBundle, curveCardinal, curveCatmullRom,
  curveLinear, curveMonotoneX, curveMonotoneY, curveNatural, curveStep,
  curveStepAfter, curveStepBefore} from 'd3-shape' // Curve variables
import {schemeCategory10, schemeAccent, schemeDark2, schemePaired,
  schemePastel1, schemePastel2, schemeSet1, schemeSet2, schemeSet3,
  schemeTableau10} from 'd3-scale-chromatic'

const d3 = { select, selectAll, scaleOrdinal, scaleLinear, scaleTime,
  timeParse, timeFormat, max, min, extent, line, area, transition, axisLeft,
  axisBottom, easeLinear, easePolyIn, easePolyOut, easePoly, easePolyInOut,
  easeQuadIn, easeQuadOut, easeQuad, easeQuadInOut, easeCubicIn, easeCubicOut,
  easeCubic, easeCubicInOut, easeSinIn, easeSinOut, easeSin, easeSinInOut,
  easeExpIn, easeExpOut, easeExp, easeExpInOut, easeCircleIn, easeCircleOut,
  easeCircle, easeCircleInOut, easeElasticIn, easeElastic, easeElasticOut,
  easeElasticInOut, easeBackIn, easeBackOut, easeBack, easeBackInOut, easeBounceIn,
  easeBounce, easeBounceOut, easeBounceInOut, curveBasis, curveBundle, curveCardinal,
  curveCatmullRom, curveLinear, curveMonotoneX, curveMonotoneY, curveNatural, curveStep,
  curveStepAfter, curveStepBefore, schemeCategory10, schemeAccent, schemeDark2, schemePaired,
  schemePastel1, schemePastel2, schemeSet1, schemeSet2, schemeSet3, schemeTableau10}

/**
 * D3 Area Chart
 */
class d3areachart extends d3chart {

    constructor(selection, data, config) {
        super(selection, data, config, {
            margin: { top: 20, right: 20, bottom: 20, left: 40 },
            values: [],
            areas: {},
            date: { key: false, inputFormat: "%Y-%m-%d", outputFormat: "%Y-%m-%d" },
            color: { key: false, keys: false, scheme: false, current: '#1f77b4', default: '#AAA', axis: '#000' },
            curve: 'curveBasis',
            areacurve: 'curveBasis',
            points: { visibleSize: 3, hoverSize: 6 },
            axis: { yTitle: false, xTitle: false, yFormat: ".0f", xFormat: "%Y-%m-%d", yTicks: 5, xTicks: 3 },
            tooltip: { labels: false },
            transition: { duration: 350, ease: 'easeLinear' },
        });
    }

    /**
    * Init chart
    */
    initChart() {

        // Set up dimensions
        this.getDimensions();
        this.initChartFrame('areachart');

        // Format date functions
        this.parseTime = d3.timeParse(this.cfg.date.inputFormat);
        this.formatTime = d3.timeFormat(this.cfg.date.outputFormat);

        // Init scales
        this.yScale = d3.scaleLinear();
        this.xScale = d3.scaleTime();
        // this.line = d3.line();
        this.areagen = d3.area();
        this.line = d3.line();

        // Axis group
        this.axisg = this.g.append('g')
            .attr('class', 'chart__axis chart__axis--areachart')

        // Horizontal grid
        this.yGrid = this.axisg.append("g")
            .attr("class", "chart__grid chart__grid--y chart__grid--areachart");

        // Bottom axis
        this.xAxis = this.axisg.append("g")
            .attr("class", "chart__axis-x chart__axis-x--areachart");

        // Vertical axis
        this.yAxis = this.axisg.append("g")
            .attr("class", "chart__axis-y chart__axis-y--areachart chart__grid")

        // Vertical axis title
        if (this.cfg.axis.yTitle)
            this.yAxisTitle = this.axisg.append('text')
            .attr('class', 'chart__axis-title chart__axis-title--areachart')
            .attr("transform", 'rotate(-90)')
            .style("text-anchor", "middle");

        this.setChartDimension();
        this.updateChart();
    }

    /**
     * Calcule required derivated data
     */
    computeData() {
        // Calcule transpose data
        const tData = [];
        this.cfg.values.forEach((j, i) => {
            tData[i] = {};
            tData[i].key = j;
            tData[i].values = [];
        });

        this.data.forEach(d => { d.jsdate = this.parseTime(d[this.cfg.date.key]) });
        this.data.sort((a, b) => a.jsdate - b.jsdate);


        this.data.forEach((d, c) => {
            d.min = 9999999999999999999;
            d.max = -9999999999999999999;          
            this.cfg.values.forEach((j, i) => {
                let jyl_cn = this.cfg.areas[j].lower
                let jyu_cn = this.cfg.areas[j].upper
                let jyo_cn = this.cfg.areas[j].observed                  
                tData[i].values.push({ 
                    x: d.jsdate,
                    y: +d[j],
                    y0: +d[jyl_cn],
                    y1: +d[jyu_cn],
                    yo: +d[jyo_cn],
                    k: i })
                if (d[j] < d.min) d.min = +d[jyl_cn];
                if (d[j] > d.max) d.max = +d[jyu_cn];
            })
        });
        this.tData = tData;
    }

    /**
     * Set up chart dimensions (non depending on data)
     */
    setChartDimension() {
        // Resize SVG element
        this.svg
            .attr("viewBox", `0 0 ${this.cfg.width+this.cfg.margin.left+this.cfg.margin.right} ${this.cfg.height+this.cfg.margin.top+this.cfg.margin.bottom}`)
            .attr("width", this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)
            .attr("height", this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom);

        // Vertical axis title
        if (this.cfg.axis.yTitle)
            this.yAxisTitle
            .attr("y", -this.cfg.margin.left + 10)
            .attr("x", -this.cfg.height / 2)
            .text(this.cfg.axis.yTitle)
    }

    /**
     * Set up scales
     */
    setScales() {
        // Calcule vertical scale
        console.log(this.data)
        this.yScale
            .domain([d3.min(this.data, d => d.min), d3.max(this.data, d => d.max)])
            .rangeRound([this.cfg.height, 0]);

        // Calcule horizontal scale
        this.xScale
            .domain(d3.extent(this.data, d => d.jsdate))
            .rangeRound([0, this.cfg.width]);

        if (this.cfg.color.scheme instanceof Array === true) {
            this.colorScale = d3.scaleOrdinal().range(this.cfg.color.scheme)
        } else if (typeof this.cfg.color.scheme === 'string') {
            this.colorScale = d3.scaleOrdinal(d3[this.cfg.color.scheme]);
        }

        // Set up area function
        this.areagen
            .x( (d, i) =>  this.xScale(d.x))
            .y0( (d, i) => this.yScale(d.y0))
            .y1( (d, i) => this.yScale(d.y1))
            .curve(d3[this.cfg.areacurve])

        // Set up line function
        this.line
            .x(d => this.xScale(d.x))
            .y(d => this.yScale(d.y))
            .curve(d3[this.cfg.curve])            

        // Redraw grid
        this.yGrid
            .call(
                d3.axisLeft(this.yScale)
                .tickSize(-this.cfg.width)
                .ticks(this.cfg.axis.yTicks, this.cfg.axis.yFormat)
            );

        // Redraw horizontal axis
        this.xAxis
            .attr("transform", `translate(0,${this.cfg.height})`)
            .call(
                d3.axisBottom(this.xScale)
                .tickFormat(this.formatTime)
                .ticks(this.cfg.axis.xTicks, this.cfg.axis.xFormat)
            );
    }

    /**
     * Bind data to main elements groups
     */
    bindData() {
        // Set transition
        this.transition = d3.transition('t')
            .duration(this.cfg.transition.duration)
            .ease(d3[this.cfg.transition.ease]);

        // Area group
        this.source = this.g.selectAll(".chart__multiarea-group")
            .data(this.tData, d => d.key)

        // Lines group
        this.linesgroup = this.g.selectAll(".chart__lines-group")
            .data(this.tData, d => d.key);

        // Set points store
        if (!this.pointsg || this.pointsg instanceof Array === false) {
            this.pointsg = [];
        }

    }

    /**
     * Add new chart's elements
     */
    enterElements() {        
        // Elements to add
        const esource = this.source
                            .enter().append('g')
                            .attr("class", function(d) { return `chart__multiarea-group chart__${d.key}-group chart__multiarea-group--areachart`; })

        // avoid scope problems
        const ag = this.areagen
        esource.append('path')
            .attr("class", `chart__area chart__area--areachart`)
            .attr('fill-opacity', '0.3')
            .attr("d", function(d) { return ag(d.values); })

        // Elements to add
        const newlinegroup = this.linesgroup
            .enter().append('g')
            .attr("class", "chart__lines-group chart__lines-group--areachart");

        // Lines
        newlinegroup.append('path')
            .attr("class", "chart__line chart__line--areachart")
            .attr('fill', 'transparent')
            .attr("d", d => this.line(
                d.values.map(v => ({ y: 0, x: v.x, k: v.k }))
            ));
            
        // Don't continue if points are disabled
        if(this.cfg.points === false)
          return;

        let ck = this.cfg.points.colKey
        this.cfg.values.forEach((k, i) => {
            // Point group
            let gp = this.g.selectAll('.chart__points-group--' + ck)
                .data(this.data).enter()
                .append('g')
                .attr('class', 'chart__points-group chart__points-group--areachart chart__points-group--' + ck )
                .attr('transform', d => `translate(${this.xScale(d.jsdate)},${this.cfg.height})`)

            // Visible point
            gp.append('circle')
                .attr('class', 'chart__point-visible chart__point-visible--areachart')
                .attr('pointer-events', 'none');

            this.pointsg.push({ selection: gp, key: ck})
        })            
    }

    /**
     * Update chart's elements based on data change
     */
    updateElements() {
        // avoid scope problems
        const ag = this.areagen
        this.g.selectAll('.chart__area')
            .transition(this.transition)
            .attr('fill', d => this.colorElement(d, 'key'))
            .attr("d", (d, i) => ag(this.tData[i].values));

        // Color lines
        this.linesgroup
            .attr('stroke', d => this.colorElement(d, 'key'))

        // Redraw lines
        this.g.selectAll('.chart__line')
            .attr('stroke', d => this.colorElement(d, 'key'))
            .transition(this.transition)
            .attr("d", (d, i) => this.line(this.tData[i].values));
            
        // Redraw points
        this.pointsg.forEach((p, i) => {
            p.selection
                .transition(this.transition)
                .attr('transform', d => {
                    if (d[p.key]) {
                        return `translate(${this.xScale(d.jsdate)},${this.yScale(d[p.key])})`
                    } else {
                        return `translate(${this.xScale(d.jsdate)},${this.yScale(0)})`
                    }
                })

            // Visible point
            p.selection.selectAll('.chart__point-visible')
                .attr('fill', d => this.colorElement(p, 'points'))
                .attr('r', d => {
                    if (d[p.key]) {
                        return this.cfg.points.visibleSize
                    } else {
                        return 0
                    }
                })
        })            
    }

    /**
     * Remove chart's elements without data
     */
    exitElements() {
        this.source.exit()
            .transition(this.transition)
            .style("opacity", 0)
            .remove();            
    }

}

export default d3areachart
