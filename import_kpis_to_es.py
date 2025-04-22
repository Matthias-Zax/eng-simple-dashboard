# Script to import CSV to Elasticsearch
# Requires: pip install elasticsearch pandas

import pandas as pd
from elasticsearch import Elasticsearch, helpers
import sys
import os

CSV_FILE = sys.argv[1] if len(sys.argv) > 1 else 'output/combined_kpis_1744632932827.csv'
INDEX_NAME = sys.argv[2] if len(sys.argv) > 2 else 'kpis'
ES_HOST = os.environ.get('ES_HOST', 'localhost')
ES_PORT = os.environ.get('ES_PORT', '9200')

es = Elasticsearch(f'http://{ES_HOST}:{ES_PORT}')

def import_csv_to_es(csv_file, index_name):
    df = pd.read_csv(csv_file, sep=';')
    actions = [
        {
            '_index': index_name,
            '_source': row.dropna().to_dict()
        }
        for _, row in df.iterrows()
    ]
    helpers.bulk(es, actions)
    print(f"Imported {len(actions)} records into index '{index_name}'")

if __name__ == '__main__':
    import_csv_to_es(CSV_FILE, INDEX_NAME)
