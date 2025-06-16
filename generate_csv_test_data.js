const fs = require('fs');
const path = require('path');

// Define header
const header = 'Source File;Source Tab;NWB;GPTS tribe name (Initiative name);Team (if applicable);Product/Application (agile products only);Reference Period;Contact Person;Comment;Customer facing Y/N;Deployment Frequency [# per quarter];Cycle Time [days];Change Failure Rate [%];Failed Deployments [#];MTTR [days];CICD Pipeline [%];Test Automation [%];DevOps Score;Quarter;Year';

// Define arrays for random data generation
const nwbs = ['NWU1', 'NWU2', 'NWU3', 'NWU4', 'NWU5', 'NWU6', 'NWU7', 'NWU8', 'NWU9', 'NWU10'];
const tribes = ['Digital Banking', 'Payments', 'Lending', 'Core Banking', 'Customer Experience', 'Enterprise Services', 'Data & Analytics', 'Security', 'Infrastructure', 'Mobile'];
const teams = [
    'Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta', 'Team Epsilon', 
    'Team Zeta', 'Team Eta', 'Team Theta', 'Team Iota', 'Team Kappa',
    'Team Lambda', 'Team Mu', 'Team Nu', 'Team Xi', 'Team Omicron',
    'Team Pi', 'Team Rho', 'Team Sigma', 'Team Tau', 'Team Upsilon'
];
const products = [
    'Mobile Banking App', 'Online Banking Portal', 'Payment Gateway', 'Loan Processing System',
    'Customer Onboarding', 'Account Management', 'Card Services', 'Wealth Management',
    'Business Banking', 'ATM Services', 'Fraud Detection', 'Credit Scoring',
    'Investment Platform', 'Mortgage System', 'Personal Finance Manager',
    'Chatbot Assistant', 'API Gateway', 'Transaction Monitor', 'Identity Verification',
    'Regulatory Reporting'
];
const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
const years = [2022, 2023, 2024, 2025];
const contactPersons = [
    'John Doe', 'Jane Smith', 'Robert Johnson', 'Emily Davis', 'Michael Brown',
    'Sarah Wilson', 'David Miller', 'Jennifer Taylor', 'Richard Anderson', 'Lisa Thomas'
];
const sourceTabs = [
    'Deployment Frequency', 'Cycle Time for Changes', 'Change Failure Rate',
    'Mean Time to Repair', 'CICD Pipeline', 'Test automation', 'DevOps'
];
const yesNo = ['Yes', 'No'];

// Helper function to get random item from array
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random number between min and max
function getRandomNumber(min, max, decimals = 0) {
    const num = Math.random() * (max - min) + min;
    return Number(num.toFixed(decimals));
}

// Generate 1000 rows of test data
const rows = [];
for (let i = 0; i < 1000; i++) {
    const nwb = getRandomItem(nwbs);
    const tribe = getRandomItem(tribes);
    const team = getRandomItem(teams);
    const product = getRandomItem(products);
    const quarter = getRandomItem(quarters);
    const year = getRandomItem(years);
    const sourceTab = getRandomItem(sourceTabs);
    const sourceFile = `${nwb}_${quarter}_${year}.xlsx`;
    const referencePeriod = `${quarter} ${year}`;
    const contactPerson = getRandomItem(contactPersons);
    const customerFacing = getRandomItem(yesNo);
    
    // Generate KPI values
    const deploymentFrequency = getRandomNumber(1, 30);
    const cycleTime = getRandomNumber(1, 45, 1);
    
    // For change failure rate and failed deployments, ensure they're related
    const totalDeployments = getRandomNumber(5, 50);
    const failedDeployments = getRandomNumber(0, Math.floor(totalDeployments * 0.4));
    const changeFailureRate = totalDeployments > 0 ? Number((failedDeployments / totalDeployments * 100).toFixed(2)) : 0;
    
    const mttr = getRandomNumber(0.1, 7, 2);
    const cicdPipeline = getRandomItem([0, 100]); // Yes/No converted to 100/0
    const testAutomation = getRandomNumber(10, 100);
    const devOpsScore = getRandomItem([0, 100]); // Yes/No converted to 100/0
    
    // Build the row
    const row = [
        sourceFile,
        sourceTab,
        nwb,
        tribe,
        team,
        product,
        referencePeriod,
        contactPerson,
        '', // Comment is usually empty
        customerFacing,
        deploymentFrequency,
        cycleTime,
        changeFailureRate,
        failedDeployments,
        mttr,
        cicdPipeline,
        testAutomation,
        devOpsScore,
        quarter,
        year
    ].join(';');
    
    rows.push(row);
}

// Combine header and rows
const csvContent = [header, ...rows].join('\n');

// Write to file
const outputPath = path.join(__dirname, 'output', `test_data_1000_rows_${Date.now()}.csv`);
fs.writeFileSync(outputPath, csvContent);

console.log(`CSV file with 1000 rows generated at: ${outputPath}`);
