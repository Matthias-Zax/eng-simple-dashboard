# How to use Grafana with Docker Compose

This project includes a `docker-compose.yml` to run Grafana and load your dashboards from the `grafana-dashboards` directory.

## Steps

1. **Start Grafana**

   ```bash
   docker-compose up -d
   ```
   This will start Grafana on [http://localhost:3000](http://localhost:3000) (default login: `admin`/`admin`).

2. **Dashboards**

   All JSON files in the `grafana-dashboards/` directory will be automatically provisioned to Grafana.

3. **Data Sources**

   You can add a data source via the Grafana UI or extend the `docker-compose.yml` to include one (e.g., Prometheus).

4. **Stop Grafana**

   ```bash
   docker-compose down
   ```

---

**Tip:**
- To persist Grafana data (users, dashboards, settings), it uses a Docker volume (`grafana_data`).
- You can customize admin password in `docker-compose.yml` under `GF_SECURITY_ADMIN_PASSWORD`.

