const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Column order for the output
const COLUMN_ORDER = [
    'Source File',
    'Source Tab',
    'NWB',
    'GPTS tribe name (Initiative name)',
    'Team (if applicable)',
    'Product/Application (agile products only)',
    'Reference Period',
    'Contact Person',
    'Comment',
    'Customer facing Y/N'
];

// KPI columns to add after the base columns
const KPI_COLUMNS = {
    'Deployment Frequency': 'Deployment Frequency [# per quarter]',
    'Cycle Time for Changes': 'Cycle Time [days]',
    'Change Failure Rate': 'Change Failure Rate [%]',
    'Mean Time to Repair': 'MTTR [hours]',
    'CICD Pipeline': 'CICD Pipeline [%]',
    'Test automation': 'Test Automation [%]',
    'DevOps': 'DevOps Score'
};

// Rows to ignore
const IGNORE_ROWS = [
    'Enter your NWB name',
    'Please enter the official tribe name',
    'Please enter Team name',
    'NWB'
];

// Define KPI tabs to process (excluding metadata tabs)
const KPI_TABS = [
    'Deployment Frequency',
    'Cycle Time for Changes',
    'Change Failure Rate',
    'Mean Time to Repair',
    'CICD Pipeline',
    'Test automation',
    'DevOps'
];

// KPI-specific column mappings
const KPI_COLUMN_MAPPINGS = {
    'Deployment Frequency': {
        'NWB': 'NetworkBank',
        'GPTS tribe name (Initiative name)': 'TribeName',
        'Team (if applicable)': 'TeamName',
        'Product/Application (agile products only)': 'ProductName',
        'Depolyment Frequency \r\n[# of deployments for reported quarter]': 'Value',
        'Reference Period': 'ReferencePeriod',
        'Contact Person': 'ContactPerson',
        'Comment': 'Comment',
        'Customer facing\r\nY/N': 'IsCustomerFacing'
    },
    'Cycle Time for Changes': {
        'NWB': 'NetworkBank',
        'GPTS tribe name (Initiative name)': 'TribeName',
        'Team (if applicable)': 'TeamName',
        'Product/Application (agile products only)': 'ProductName',
        'Cycle Time for Changes\r\n[in days]': 'Value',
        'Reference Period': 'ReferencePeriod',
        'Contact Person': 'ContactPerson',
        'Comment': 'Comment',
        'Customer facing\r\nY/N': 'IsCustomerFacing'
    },
    // Add mappings for other KPIs as needed
};

// KPI metadata
const KPI_METADATA = {
    'Deployment Frequency': {
        unit: 'deployments/quarter',
        description: 'Number of deployments to production per quarter',
        higherIsBetter: true
    },
    'Cycle Time for Changes': {
        unit: 'days',
        description: 'Time taken from code commit to production deployment',
        higherIsBetter: false
    },
    'Change Failure Rate': {
        unit: 'percentage',
        description: 'Percentage of deployments causing failures in production',
        higherIsBetter: false
    },
    'Mean Time to Repair': {
        unit: 'hours',
        description: 'Average time to restore service after a failure',
        higherIsBetter: false
    },
    'CICD Pipeline': {
        unit: 'percentage',
        description: 'Percentage of steps automated in CI/CD pipeline',
        higherIsBetter: true
    },
    'Test automation': {
        unit: 'percentage',
        description: 'Percentage of test cases automated',
        higherIsBetter: true
    },
    'DevOps': {
        unit: 'score',
        description: 'Overall DevOps maturity score',
        higherIsBetter: true
    }
};

// Function to extract metadata from filename
function extractFileMetadata(filename) {
    // Extract quarter and year
    const quarterMatch = filename.match(/Q([1-4])\s*(\d{4})/);
    const quarter = quarterMatch ? `Q${quarterMatch[1]}` : null;
    const year = quarterMatch ? quarterMatch[2] : null;

    // Extract team name - look for common patterns like RBRO, RBBH, etc.
    const teamMatch = filename.match(/(?:_|\s)(RB[A-Z]{2})(?:_|\s|\.)/);
    const team = teamMatch ? teamMatch[1] : null;

    return { quarter, year, team };
}

// Function to extract unique values from data
function extractUniqueValues(data) {
    const unique = {
        teams: new Set(),
        quarters: new Set(),
        years: new Set(),
        networkBanks: new Set(),
        tribes: new Set(),
        products: new Set()
    };

    data.forEach(row => {
        if (row.Team) unique.teams.add(row.Team);
        if (row.Quarter) unique.quarters.add(row.Quarter);
        if (row.Year) unique.years.add(row.Year);
        if (row.NetworkBank) unique.networkBanks.add(row.NetworkBank);
        if (row.TribeName) unique.tribes.add(row.TribeName);
        if (row.ProductName) unique.products.add(row.ProductName);
    });

    // Convert Sets to sorted Arrays
    return Object.fromEntries(
        Object.entries(unique).map(([key, value]) => [
            key,
            [...value].sort()
        ])
    );
}

// Column mapping for cleaner names
const COLUMN_MAPPING = {
    'NWB': 'NetworkBank',
    'GPTS tribe name (Initiative name)': 'TribeName',
    'Team (if applicable)': 'TeamName',
    'Product/Application (agile products only)': 'ProductName',
    'Depolyment Frequency \r\n[# of deployments for reported quarter]': 'DeploymentFrequency',
    'Reference Period': 'ReferencePeriod',
    'Contact Person': 'ContactPerson',
    'Comment': 'Comment',
    'Customer facing\r\nY/N': 'IsCustomerFacing'
};

// Function to clean and transform a single row of data
function cleanRow(row, kpiName) {
    const cleanedRow = {};
    const columnMapping = KPI_COLUMN_MAPPINGS[kpiName] || {};
    
    // Map old column names to new ones and clean values
    Object.entries(row).forEach(([key, value]) => {
        // Skip empty columns
        if (key.startsWith('__EMPTY')) return;
        
        // Find the mapped column name or use the original
        const mappedKey = columnMapping[key] || key;
        
        // Clean and transform the value
        let cleanedValue = value;
        if (typeof value === 'string') {
            cleanedValue = value.trim().replace(/\r\n/g, ' ');
        }
        
        // Convert numeric values
        if (mappedKey === 'Value') {
            cleanedValue = value === null ? 0 : Number(value);
        }
        
        // Convert customer facing to boolean
        if (mappedKey === 'IsCustomerFacing') {
            cleanedValue = value?.toString().toLowerCase() === 'yes';
        }
        
        cleanedRow[mappedKey] = cleanedValue;
    });
    
    // Add KPI metadata
    cleanedRow.KpiName = kpiName;
    cleanedRow.Unit = KPI_METADATA[kpiName]?.unit;
    cleanedRow.HigherIsBetter = KPI_METADATA[kpiName]?.higherIsBetter;
    
    return cleanedRow;
}

// Function to read all Excel files from a directory
function readExcelFiles(directoryPath) {
    const files = fs.readdirSync(directoryPath)
        .filter(file => file.endsWith('.xlsx'));
    
    // Store KPI values by product key
    const productKPIs = new Map();

    files.forEach(file => {
        const filePath = path.join(directoryPath, file);
        const workbook = XLSX.readFile(filePath);
        const metadata = extractFileMetadata(file);
        
        // Process each KPI tab
        Object.keys(KPI_COLUMNS).forEach(kpiName => {
            if (workbook.SheetNames.includes(kpiName)) {
                const worksheet = workbook.Sheets[kpiName];
                // Read with header: 1 to get raw rows first
                const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                // Find the header row (first non-empty row)
                const headerRowIndex = rawData.findIndex(row => 
                    row.length > 0 && 
                    typeof row[0] === 'string' && 
                    row[0].includes('NWB'));
                
                if (headerRowIndex === -1) return;
                
                // Create column mapping from header row
                const headers = rawData[headerRowIndex];
                const columnMapping = {};
                headers.forEach((header, index) => {
                    if (header) columnMapping[index] = header;
                });
                
                // Process data rows
                const data = rawData.slice(headerRowIndex + 1)
                    .map(row => {
                        const obj = {};
                        Object.entries(columnMapping).forEach(([index, header]) => {
                            obj[header] = row[index];
                        });
                        return obj;
                    })
                    .filter(row => row['NWB'] && !IGNORE_ROWS.includes(row['NWB']));
                
                data.forEach(row => {
                    // Skip instruction rows
                    if (IGNORE_ROWS.some(ignore => 
                        row['NWB'] === ignore || 
                        row['GPTS tribe name (Initiative name)'] === ignore ||
                        row['Team (if applicable)'] === ignore
                    )) {
                        return;
                    }

                    // Validate NWB length
                    const nwb = row['NWB'];
                    if (!nwb || nwb.length < 4) {
                        console.error(`\nERROR: Invalid NWB value in file ${file}, tab ${kpiName}`);
                        console.error(`NWB value '${nwb}' is invalid. NWB must be at least 4 characters long.`);
                        console.error(`This must be fixed in the source file before proceeding.\n`);
                        process.exit(1);
                    }

                    // Clean up product name
                    const productName = row['Product/Application (agile products only)'];
                    const cleanProductName = productName?.split('\r\n')[0] || productName;

                    // Create a unique key for each product
                    const productKey = JSON.stringify({
                        nwb: row['NWB'],
                        product: cleanProductName.split('[')[0].trim(), // Remove any [...] suffixes
                        period: row['Reference Period']
                    });

                    // Initialize product data if not exists
                    if (!productKPIs.has(productKey)) {
                        const baseData = {};
                        baseData['Source File'] = file;  // Add source filename
                        baseData['Source Tab'] = kpiName;  // Add source tab name
                        COLUMN_ORDER.forEach(col => {
                            if (col === 'Source File' || col === 'Source Tab') return;  // Skip source columns
                            let value = row[col];
                            if (col === 'Product/Application (agile products only)') {
                                value = cleanProductName;
                            }
                            baseData[col] = value;
                        });
                        baseData.Quarter = metadata.quarter;
                        baseData.Year = metadata.year;
                        productKPIs.set(productKey, baseData);
                    }

                    // Add KPI value
                    const kpiData = productKPIs.get(productKey);
                    const kpiColumn = KPI_COLUMNS[kpiName];
                    
                    // Get the KPI value based on the current tab
                    let value = null;
                    if (row['Product/Application (agile products only)']?.includes('Athena')) {
                        console.log('Found Athena row:', JSON.stringify(row, null, 2));
                    }
                    switch(kpiName) {
                        case 'Deployment Frequency':
                            value = row['Depolyment Frequency \r\n[# of deployments for reported quarter]'];
                            break;
                        case 'Cycle Time for Changes':
                            value = row['Cycle Time for Changes [in calendar days]'];
                            break;
                        case 'Change Failure Rate':
                            // Calculate failure rate as (failures / total) * 100
                            const totalDeployments = Number(row['Total Number of deplyoments in reported quarter \r\n[# of deployments]']) || 0;
                            const failedDeployments = Number(row['# of deployments that require remedy in reported quarter\r\n[# of deployments]']) || 0;
                            value = totalDeployments > 0 ? (failedDeployments / totalDeployments) * 100 : 0;
                            break;
                        case 'Mean Time to Repair':
                            value = row['Mean Time to Repair (time in days, that is needed to bring service back to full operation)'];
                            // Convert days to hours
                            if (value !== null && value !== undefined && value !== 'no deployment failures last Q') {
                                value = Number(value) * 24; // Convert days to hours
                            } else {
                                value = 0; // No failures means 0 hours to repair
                            }
                            break;
                        case 'CICD Pipeline':
                            value = row['Product is shipped with a CI/CD pipeline\r\n[yes/no]'];
                            // Convert yes/no to percentage
                            value = value?.toLowerCase() === 'yes' ? 100 : 0;
                            break;
                        case 'Test automation':
                            value = row['Fullfillment of test automation ambition in the product \r\n[%]'];
                            // Convert decimal to percentage
                            if (value !== null && value !== undefined) {
                                value = Number(value) * 100;
                            }
                            break;
                        case 'DevOps':
                            value = row['Product team is responsible for Development and IT Operations (DevOps)\r\n[yes/no]'];
                            // Convert yes/no to score
                            value = value?.toLowerCase() === 'yes' ? 100 : 0;
                            break;
                    }
                    
                    const numericValue = value === null ? 0 : Number(value);
                    kpiData[kpiColumn] = numericValue;
                    productKPIs.set(productKey, kpiData); // Update the Map with the new KPI value
                    if (cleanProductName?.includes('Athena')) {
                        console.log(`Setting ${kpiColumn} to ${numericValue} for ${cleanProductName}`);
                    }
                });
            }
        });
    });

    // Convert Map to array and clean up data
    return Array.from(productKPIs.values()).map(row => {
        // Clean up each value in the row
        const cleanedRow = {};
        Object.entries(row).forEach(([key, value]) => {
            // Clean strings
            if (typeof value === 'string') {
                value = value.replace(/\r\n/g, ' ').trim();
                if (value.toLowerCase() === 'yes') value = 'Yes';
                if (value.toLowerCase() === 'no') value = 'No';
            }
            // Convert KPI values to numbers with 2 decimal places
            if (Object.values(KPI_COLUMNS).includes(key)) {
                value = typeof value === 'number' ? Number(value.toFixed(2)) : 0;
            }
            cleanedRow[key] = value;
        });

        // Ensure all KPI columns exist with default value 0
        Object.values(KPI_COLUMNS).forEach(kpiCol => {
            if (!(kpiCol in cleanedRow)) {
                cleanedRow[kpiCol] = 0;
            }
        });

        return cleanedRow;
    });
}

// Function to prepare data for Grafana
function prepareGrafanaData(data) {
    const grafanaData = [];
    const teamsByNWB = {};

    data.forEach(row => {
        const nwb = row['NWB'];
        const team = row['Team (if applicable)'];
        const timestamp = new Date(`${row['Year']}-${row.Quarter.replace('Q', '')}-01`).getTime();

        // Count unique teams per NWB
        if (!teamsByNWB[nwb]) {
            teamsByNWB[nwb] = new Set();
        }
        if (team) {
            teamsByNWB[nwb].add(team);
        }

        // Add KPI measurements
        Object.entries(KPI_COLUMNS).forEach(([kpiName, columnName]) => {
            const value = parseFloat(row[columnName]) || 0;
            grafanaData.push({
                target: `${nwb} - ${kpiName}`,
                datapoints: [[value, timestamp]],
                tags: {
                    nwb: nwb,
                    team: team || 'No Team',
                    tribe: row['GPTS tribe name (Initiative name)'] || 'No Tribe',
                    kpi: kpiName,
                    product: row['Product/Application (agile products only)'] || 'No Product'
                }
            });
        });
    });

    // Add team count metrics
    Object.entries(teamsByNWB).forEach(([nwb, teams]) => {
        grafanaData.push({
            target: `${nwb} - Team Count`,
            datapoints: [[teams.size, Date.now()]],
            tags: {
                nwb: nwb,
                metric: 'team_count'
            }
        });
    });

    return grafanaData;
}

// Function to save combined data to Excel and Grafana JSON
function saveCombinedData(data, outputPath) {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Get all columns (base columns + KPI columns)
    const allColumns = [...COLUMN_ORDER, ...Object.values(KPI_COLUMNS), 'Quarter', 'Year'];

    // Debug: check data before creating worksheet
    const athenaRows = data.filter(row => row['Product/Application (agile products only)']?.includes('Athena'));
    console.log('\nAthena rows before Excel creation:', JSON.stringify(athenaRows, null, 2));

    // Convert data to simple array format
    const rows = data.map(row => allColumns.map(col => {
        const value = row[col];
        // Convert all values to strings
        if (value === null || value === undefined) return '';
        if (typeof value === 'number') return String(value);
        return String(value);
    }));

    // Add headers as first row
    rows.unshift(allColumns);

    // Create worksheet from array with no formatting
    const worksheet = XLSX.utils.aoa_to_sheet(rows, { raw: true });

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, outputPath, { bookType: 'xlsx', bookSST: false, type: 'binary' });

    // Save Grafana JSON data
    const grafanaData = prepareGrafanaData(data);
    const jsonOutputPath = path.join(path.dirname(outputPath), `grafana_kpis_${Date.now()}.json`);
    fs.writeFileSync(jsonOutputPath, JSON.stringify(grafanaData, null, 2));
    console.log(`\nGrafana data saved to: ${jsonOutputPath}`);
}

// Main execution
const filesDirectory = path.join(__dirname, '..', 'files');
const outputPath = path.join(__dirname, '..', 'output', `combined_kpis_${Date.now()}.xlsx`);
const metadataPath = path.join(__dirname, '..', 'output', 'metadata.json');

// Create output directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, '..', 'output'))) {
    fs.mkdirSync(path.join(__dirname, '..', 'output'));
}

try {
    console.log('Reading Excel files...');
    const combinedData = readExcelFiles(filesDirectory);
    console.log(`Found ${combinedData.length} rows of data`);
    
    // Extract and save metadata
    const metadata = extractUniqueValues(combinedData);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log('Metadata extracted and saved to:', metadataPath);
    console.log('Unique values found:', {
        'Teams': metadata.teams.length,
        'Quarters': metadata.quarters.length,
        'Years': metadata.years.length,
        'Network Banks': metadata.networkBanks.length,
        'Tribes': metadata.tribes.length,
        'Products': metadata.products.length
    });
    
    console.log('\nSaving combined data...');
    saveCombinedData(combinedData, outputPath);
    console.log(`Combined data saved to: ${outputPath}`);
} catch (error) {
    console.error('Error:', error.message);
}
