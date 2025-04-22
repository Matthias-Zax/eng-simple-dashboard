// This script combines Excel data and uploads it to Elasticsearch
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { Client } = require('@elastic/elasticsearch');

// Elasticsearch config
const ES_HOST = process.env.ES_HOST || 'localhost';
const ES_PORT = process.env.ES_PORT || '9200';
const ES_INDEX = process.env.ES_INDEX || 'kpis';

const es = new Client({ node: `http://${ES_HOST}:${ES_PORT}` });

// Function to upload data to Elasticsearch
async function uploadToElasticsearch(data, index) {
  const actions = data.map(doc => [{ index: { _index: index } }, doc]).flat();
  const response = await es.bulk({ refresh: true, body: actions });
  if (!response || !response.body) {
    console.error('No response or missing body from Elasticsearch bulk API:', response);
    return;
  }
  if (response.body.errors) {
    console.error('Errors occurred while uploading to Elasticsearch:', response.body);
  } else {
    console.log(`Uploaded ${data.length} records to Elasticsearch index '${index}'.`);
  }
}

// Main execution
(async () => {
  try {
    const outputDir = path.join(__dirname, '..', 'output');
    // Find the latest combined_kpis_*.csv file
    const files = fs.readdirSync(outputDir)
      .filter(file => file.startsWith('combined_kpis_') && file.endsWith('.csv'));
    if (files.length === 0) {
      throw new Error('No combined_kpis_*.csv files found in output directory.');
    }
    const latestFile = files
      .map(f => ({
        name: f,
        timestamp: parseInt(f.match(/combined_kpis_(\d+)\.csv/)[1], 10)
      }))
      .sort((a, b) => b.timestamp - a.timestamp)[0].name;
    const csvPath = path.join(outputDir, latestFile);
    console.log('Uploading data from', csvPath);

    // Parse CSV (semicolon-separated)
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const [headerLine, ...lines] = csvContent.split(/\r?\n/).filter(Boolean);
    const headers = headerLine.split(';');
    const data = lines.map(line => {
      const values = line.split(';');
      const doc = headers.reduce((obj, header, i) => {
        obj[header] = values[i] || '';
        return obj;
      }, {});
      // Extract ISO dates from 'Reference Period' (e.g., '01.07.2024-30.09.2024')
      const refPeriod = doc['Reference Period'] || '';
      const match = refPeriod.match(/(\d{2})\.(\d{2})\.(\d{4})-(\d{2})\.(\d{2})\.(\d{4})/);
      if (match) {
        // Convert to YYYY-MM-DD
        const start = `${match[3]}-${match[2]}-${match[1]}`;
        const end = `${match[6]}-${match[5]}-${match[4]}`;
        doc['Period Start'] = start;
        doc['Period End'] = end;
      }
      return doc;
    });

    await uploadToElasticsearch(data, ES_INDEX);
  } catch (err) {
    console.error('Error during upload:', err.message || err);
  }
})();
