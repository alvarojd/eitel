import { getHeatmapData } from './src/infrastructure/actions/heatmapActions';
async function test() {
  console.log('Testing getHeatmapData...');
  try {
    const data = await getHeatmapData();
    console.log('Data length:', data.length);
  } catch (e) {
    console.error('Error:', e);
  }
}
test();
