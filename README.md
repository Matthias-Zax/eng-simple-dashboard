# Engineering KPI Dashboard

A Node.js based dashboard for visualizing and analyzing engineering KPIs.

## Project Structure

```
eng-dashboard/
├── files/         # Input Excel files
├── output/        # Combined Excel output
└── src/           # Source code
    └── combineExcel.js  # Script to combine Excel files
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the Excel combiner:
```bash
node src/combineExcel.js
```

This will:
- Read all Excel files from the `files` directory
- Combine them into a single dataset
- Add metadata (Team, Quarter, Year)
- Save the combined data to `output/combined_kpis.xlsx`
