import * as d3 from 'd3';

export interface ChartData {
  columns: string[];
  data: any[][];
  xColumn: string;
  yColumn: string;
  groupBy?: string;
}

export interface VisualizationConfig {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  theme: 'light' | 'dark';
  colorScheme: string[];
  animationDuration: number;
}

export class VisualizationEngine {
  private config: VisualizationConfig;

  constructor(config: Partial<VisualizationConfig> = {}) {
    this.config = {
      width: config.width || 800,
      height: config.height || 400,
      margin: config.margin || { top: 20, right: 30, bottom: 40, left: 50 },
      theme: config.theme || 'dark',
      colorScheme: config.colorScheme || d3.schemeCategory10,
      animationDuration: config.animationDuration || 750
    };
  }

  private getThemeColors(): { background: string; text: string; grid: string } {
    return this.config.theme === 'dark'
      ? { background: '#1a1a1a', text: '#ffffff', grid: '#333333' }
      : { background: '#ffffff', text: '#000000', grid: '#e0e0e0' };
  }

  createBarChart(container: HTMLElement, data: ChartData): void {
    const colors = this.getThemeColors();
    const margin = this.config.margin;
    const width = this.config.width - margin.left - margin.right;
    const height = this.config.height - margin.top - margin.bottom;

    d3.select(container).selectAll('*').remove();

    const svg = d3.select(container)
      .append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xColumnIdx = data.columns.indexOf(data.xColumn);
    const yColumnIdx = data.columns.indexOf(data.yColumn);

    const processedData = data.data
      .map(row => ({
        x: row[xColumnIdx],
        y: +row[yColumnIdx] || 0
      }))
      .filter(d => d.y !== 0);

    const x = d3.scaleBand()
      .range([0, width])
      .domain(processedData.map(d => d.x))
      .padding(0.1);

    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(processedData, d => d.y) || 0]);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .attr('color', colors.text);

    g.append('g')
      .call(d3.axisLeft(y))
      .attr('color', colors.text);

    g.selectAll('.bar')
      .data(processedData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.x) || 0)
      .attr('width', x.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', this.config.colorScheme[0])
      .transition()
      .duration(this.config.animationDuration)
      .attr('y', d => y(d.y))
      .attr('height', d => height - y(d.y));

    svg.append('text')
      .attr('x', this.config.width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.text)
      .style('font-size', '16px')
      .text(`${data.yColumn} by ${data.xColumn}`);
  }

  createLineChart(container: HTMLElement, data: ChartData): void {
    const colors = this.getThemeColors();
    const margin = this.config.margin;
    const width = this.config.width - margin.left - margin.right;
    const height = this.config.height - margin.top - margin.bottom;

    d3.select(container).selectAll('*').remove();

    const svg = d3.select(container)
      .append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xColumnIdx = data.columns.indexOf(data.xColumn);
    const yColumnIdx = data.columns.indexOf(data.yColumn);

    const processedData = data.data
      .map(row => ({
        x: this.parseDateOrNumber(row[xColumnIdx]),
        y: +row[yColumnIdx] || 0
      }))
      .filter(d => d.y !== 0 && d.x !== null)
      .sort((a, b) => a.x - b.x);

    const x = d3.scaleTime()
      .range([0, width])
      .domain(d3.extent(processedData, d => d.x) as [Date, Date]);

    const y = d3.scaleLinear()
      .range([height, 0])
      .domain(d3.extent(processedData, d => d.y) as [number, number]);

    const line = d3.line<any>()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveMonotoneX);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .attr('color', colors.text);

    g.append('g')
      .call(d3.axisLeft(y))
      .attr('color', colors.text);

    const path = g.append('path')
      .datum(processedData)
      .attr('fill', 'none')
      .attr('stroke', this.config.colorScheme[0])
      .attr('stroke-width', 2)
      .attr('d', line);

    const totalLength = (path.node() as SVGPathElement).getTotalLength();
    
    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(this.config.animationDuration)
      .attr('stroke-dashoffset', 0);

    g.selectAll('.dot')
      .data(processedData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))
      .attr('r', 0)
      .attr('fill', this.config.colorScheme[0])
      .transition()
      .delay((d, i) => i * 50)
      .duration(this.config.animationDuration / 2)
      .attr('r', 4);
  }

  createScatterPlot(container: HTMLElement, data: ChartData): void {
    const colors = this.getThemeColors();
    const margin = this.config.margin;
    const width = this.config.width - margin.left - margin.right;
    const height = this.config.height - margin.top - margin.bottom;

    d3.select(container).selectAll('*').remove();

    const svg = d3.select(container)
      .append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xColumnIdx = data.columns.indexOf(data.xColumn);
    const yColumnIdx = data.columns.indexOf(data.yColumn);

    const processedData = data.data
      .map(row => ({
        x: +row[xColumnIdx] || 0,
        y: +row[yColumnIdx] || 0
      }))
      .filter(d => d.x !== 0 || d.y !== 0);

    const x = d3.scaleLinear()
      .range([0, width])
      .domain(d3.extent(processedData, d => d.x) as [number, number]);

    const y = d3.scaleLinear()
      .range([height, 0])
      .domain(d3.extent(processedData, d => d.y) as [number, number]);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .attr('color', colors.text);

    g.append('g')
      .call(d3.axisLeft(y))
      .attr('color', colors.text);

    g.selectAll('.dot')
      .data(processedData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))
      .attr('r', 0)
      .attr('fill', this.config.colorScheme[1])
      .attr('opacity', 0.7)
      .transition()
      .delay((d, i) => i * 20)
      .duration(this.config.animationDuration / 2)
      .attr('r', 5);
  }

  createPieChart(container: HTMLElement, data: ChartData): void {
    const colors = this.getThemeColors();
    const width = this.config.width;
    const height = this.config.height;
    const radius = Math.min(width, height) / 2 - 40;

    d3.select(container).selectAll('*').remove();

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const labelColumnIdx = data.columns.indexOf(data.xColumn);
    const valueColumnIdx = data.columns.indexOf(data.yColumn);

    const processedData = data.data
      .map(row => ({
        label: row[labelColumnIdx],
        value: +row[valueColumnIdx] || 0
      }))
      .filter(d => d.value > 0);

    const pie = d3.pie<any>()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<any>>()
      .innerRadius(0)
      .outerRadius(radius);

    const arcs = g.selectAll('.arc')
      .data(pie(processedData))
      .enter().append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc as any)
      .attr('fill', (d, i) => this.config.colorScheme[i % this.config.colorScheme.length])
      .attr('stroke', colors.background)
      .attr('stroke-width', 2)
      .transition()
      .duration(this.config.animationDuration)
      .attrTween('d', function(d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function(t) {
          return (arc as any)(interpolate(t));
        };
      });

    arcs.append('text')
      .attr('transform', d => `translate(${(arc as any).centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.text)
      .style('font-size', '12px')
      .text(d => d.data.label);
  }

  private parseDateOrNumber(value: any): Date | number {
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) return date;
    }
    return +value || 0;
  }

  updateTheme(theme: 'light' | 'dark'): void {
    this.config.theme = theme;
  }

  updateColors(colors: string[]): void {
    this.config.colorScheme = colors;
  }
}