# How to use Elasticsearch & Grafana for Engineering KPIs

This project now supports an ELK stack (Elasticsearch & Kibana) alongside Grafana for advanced KPI analytics.

## 1. Start the stack

```
docker-compose up -d
```
- Grafana:      http://localhost:3000 (admin/admin)
- Kibana:       http://localhost:5601
- Elasticsearch: http://localhost:9200

## 2. Import your KPI data to Elasticsearch

Run the provided script (requires Python 3, pandas, elasticsearch):

```
pip install pandas elasticsearch
python import_kpis_to_es.py output/combined_kpis_1744632932827.csv kpis
```
- This will load your CSV into the `kpis` index in Elasticsearch.
- You can import other CSVs by changing the script arguments.

## 3. Connect Grafana to Elasticsearch

1. In Grafana, go to **Connections > Data Sources > Add data source**.
2. Select **Elasticsearch**.
3. Set URL to `http://elasticsearch:9200` (or `http://localhost:9200` from your host).
4. Set Index name to `kpis` (or the one you used in the script).
5. Adjust time field and other settings as needed.

## 4. Build dashboards

- Use Grafana or Kibana to build visualizations from your KPI data now stored in Elasticsearch.
- You can query, filter, and aggregate your KPIs with much more power than with CSVs.

---

**Tip:**
- You can automate the import of new KPI files by running the script regularly or integrating it into your data pipeline.
- For production, consider securing Elasticsearch and Grafana.
