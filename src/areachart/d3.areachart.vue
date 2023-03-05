<script>
import D3Chart from '../d3.chart.vue';
import d3areachart from './d3.areachart';

export default {
  name: 'D3AreaChart',
  extends: D3Chart,
  mounted() {
    this.chart = new d3areachart(
      this.$refs.chart,
      JSON.parse(JSON.stringify(this.datum)),
      this.config,
    );
  },
};
</script>
