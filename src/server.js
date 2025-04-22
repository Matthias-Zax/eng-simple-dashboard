const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const app = express();
const port = 3000;

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use(cors());
app.use(express.json());

// Helper function to process Excel data
function processExcelData(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet);
}

// Function to calculate team counts by NWB
function getTeamCounts(data) {
    const teamsByNWB = {};
    data.forEach(row => {
        if (row.NWB && row.Team) {
            if (!teamsByNWB[row.NWB]) {
                teamsByNWB[row.NWB] = new Set();
            }
            teamsByNWB[row.NWB].add(row.Team);
        }
    });

    return Object.entries(teamsByNWB).map(([nwb, teams]) => ({
        nwb,
        count: teams.size
    }));
}

// Endpoint to get all KPIs
app.get('/api/kpis', (req, res) => {
    try {
        // Find the latest combined_kpis_<timestamp>.xlsx file
        const outputDir = path.join(__dirname, '..', 'output');
        const files = fs.readdirSync(outputDir)
            .filter(file => file.startsWith('combined_kpis_') && file.endsWith('.xlsx'));
        if (files.length === 0) {
            throw new Error('No combined_kpis_<timestamp>.xlsx files found in output directory.');
        }
        const latestFile = files.map(f => ({
            name: f,
            timestamp: parseInt(f.match(/combined_kpis_(\d+)\.xlsx/)[1], 10)
        })).sort((a, b) => b.timestamp - a.timestamp)[0].name;
        const outputPath = path.join(outputDir, latestFile);
        const data = processExcelData(outputPath);
        
        const kpis = data.map(row => ({
            nwb: row['NWB'],
            tribe: row['GPTS tribe name (Initiative name)'],
            team: row['Team (if applicable)'],
            product: row['Product/Application (agile products only)'],
            deploymentFrequency: row['Deployment Frequency [# per quarter]'],
            cycleTime: row['Cycle Time [days]'],
            changeFailureRate: row['Change Failure Rate [%]'],
            mttr: row['MTTR [hours]'],
            cicdPipeline: row['CICD Pipeline [%]'],
            testAutomation: row['Test Automation [%]'],
            devOpsScore: row['DevOps Score'],
            quarter: row['Quarter'],
            year: row['Year']
        }));

        res.json(kpis);
    } catch (error) {
        console.error('Error reading KPI data:', error);
        res.status(500).json({ error: 'Failed to retrieve KPI data' });
    }
});

// Endpoint to get team counts
app.get('/api/team-counts', (req, res) => {
    try {
        // Find the latest combined_kpis_<timestamp>.xlsx file
        const outputDir = path.join(__dirname, '..', 'output');
        const files = fs.readdirSync(outputDir)
            .filter(file => file.startsWith('combined_kpis_') && file.endsWith('.xlsx'));
        if (files.length === 0) {
            throw new Error('No combined_kpis_<timestamp>.xlsx files found in output directory.');
        }
        const latestFile = files.map(f => ({
            name: f,
            timestamp: parseInt(f.match(/combined_kpis_(\d+)\.xlsx/)[1], 10)
        })).sort((a, b) => b.timestamp - a.timestamp)[0].name;
        const outputPath = path.join(outputDir, latestFile);
        const data = processExcelData(outputPath);
        const teamCounts = getTeamCounts(data);
        res.json(teamCounts);
    } catch (error) {
        console.error('Error getting team counts:', error);
        res.status(500).json({ error: 'Failed to retrieve team counts' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
