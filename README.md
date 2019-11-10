# vue-d3-charts

Simply yet configurable charts build with D3

See [documentation page](https://saigesp.github.io/vue-d3-charts/).

### Install

```bash
npm i vue-d3-charts --save
```

### Usage

Import:

```javascript
import {D3BarChart} from 'vue-d3-charts'
```

Template:

```html
<D3BarChart :config="config" :datum="data"></D3BarChart>
```

Configuration and data:

```javascript
// data
data = [{
  name: "Lorem",
  total: 30
},{
  name: "Ipsum",
  total: 21
},{
  name: "Dolor",
  total: 20
}]

// Configuration
config = {
  key: "name",
  value: "total",
  color: "steelblue",
}
```