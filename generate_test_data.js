const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Create files directory if it doesn't exist
const filesDir = path.join(__dirname, 'files');
if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir);
}

// Define NWUs and their teams
const nwus = [
    { code: 'NWU1', name: 'Network Unit 1', teams: ['Team Alpha', 'Team Beta', 'Team Gamma'] },
    { code: 'NWU2', name: 'Network Unit 2', teams: ['Team Delta', 'Team Epsilon'] },
    { code: 'NWU3', name: 'Network Unit 3', teams: ['Team Zeta', 'Team Eta', 'Team Theta'] },
    { code: 'NWU4', name: 'Network Unit 4', teams: ['Team Iota', 'Team Kappa'] },
    { code: 'NWU5', name: 'Network Unit 5', teams: ['Team Lambda', 'Team Mu', 'Team Nu'] }
];

// Define tribes
const tribes = ['Digital Banking', 'Payments', 'Lending', 'Core Banking', 'Customer Experience'];

// Define products
const products = [
    'Mobile Banking App',
    'Online Banking Portal',
    'Payment Gateway',
    'Loan Processing System',
    'Customer Onboarding',
    'Account Management',
    'Card Services',
    'Wealth Management',
    'Business Banking',
    'ATM Services'
];

// Define quarters and years
const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
const years = [2023, 2024];

// Helper function to get random item from array
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random number between min and max
function getRandomNumber(min, max, decimals = 0) {
    const num = Math.random() * (max - min) + min;
    return Number(num.toFixed(decimals));
}

// Helper function to get random boolean
function getRandomBoolean() {
    return Math.random() > 0.5;
}

// Create workbook for each NWU, quarter, and year
nwus.forEach(nwu => {
    quarters.forEach(quarter => {
        years.forEach(year => {
            const workbook = XLSX.utils.book_new();
            
            // Create Deployment Frequency tab
            const deploymentFrequencyData = [];
            nwu.teams.forEach(team => {
                const product = getRandomItem(products);
                const tribe = getRandomItem(tribes);
                const deployments = getRandomNumber(1, 20);
                
                deploymentFrequencyData.push({
                    'NWB': nwu.code,
                    'GPTS tribe name (Initiative name)': tribe,
                    'Team (if applicable)': team,
                    'Product/Application (agile products only)': product,
                    'Reference Period': `${quarter} ${year}`,
                    'Contact Person': 'John Doe',
                    'Comment': '',
                    'Customer facing\r\nY/N': getRandomBoolean() ? 'Yes' : 'No',
                    'Depolyment Frequency \r\n[# of deployments for reported quarter]': deployments
                });
            });
            
            const deploymentFrequencyWS = XLSX.utils.json_to_sheet(deploymentFrequencyData);
            XLSX.utils.book_append_sheet(workbook, deploymentFrequencyWS, 'Deployment Frequency');
            
            // Create Cycle Time for Changes tab
            const cycleTimeData = [];
            nwu.teams.forEach(team => {
                const product = getRandomItem(products);
                const tribe = getRandomItem(tribes);
                const cycleTime = getRandomNumber(1, 30, 1);
                
                cycleTimeData.push({
                    'NWB': nwu.code,
                    'GPTS tribe name (Initiative name)': tribe,
                    'Team (if applicable)': team,
                    'Product/Application (agile products only)': product,
                    'Reference Period': `${quarter} ${year}`,
                    'Contact Person': 'John Doe',
                    'Comment': '',
                    'Customer facing\r\nY/N': getRandomBoolean() ? 'Yes' : 'No',
                    'Cycle Time for Changes\r\n[in days]': cycleTime
                });
            });
            
            const cycleTimeWS = XLSX.utils.json_to_sheet(cycleTimeData);
            XLSX.utils.book_append_sheet(workbook, cycleTimeWS, 'Cycle Time for Changes');
            
            // Create Change Failure Rate tab
            const changeFailureRateData = [];
            nwu.teams.forEach(team => {
                const product = getRandomItem(products);
                const tribe = getRandomItem(tribes);
                const totalDeployments = getRandomNumber(5, 30);
                const failedDeployments = getRandomNumber(0, Math.floor(totalDeployments * 0.3)); // Max 30% failure rate
                
                changeFailureRateData.push({
                    'NWB': nwu.code,
                    'GPTS tribe name (Initiative name)': tribe,
                    'Team (if applicable)': team,
                    'Product/Application (agile products only)': product,
                    'Reference Period': `${quarter} ${year}`,
                    'Contact Person': 'John Doe',
                    'Comment': '',
                    'Customer facing\r\nY/N': getRandomBoolean() ? 'Yes' : 'No',
                    'Total Number of deplyoments in reported quarter \r\n[# of deployments]': totalDeployments,
                    '# of deployments that require remedy in reported quarter\r\n[# of deployments]': failedDeployments
                });
            });
            
            const changeFailureRateWS = XLSX.utils.json_to_sheet(changeFailureRateData);
            XLSX.utils.book_append_sheet(workbook, changeFailureRateWS, 'Change Failure Rate');
            
            // Create Mean Time to Repair tab
            const mttrData = [];
            nwu.teams.forEach(team => {
                const product = getRandomItem(products);
                const tribe = getRandomItem(tribes);
                const mttr = getRandomNumber(0.1, 5, 2);
                
                mttrData.push({
                    'NWB': nwu.code,
                    'GPTS tribe name (Initiative name)': tribe,
                    'Team (if applicable)': team,
                    'Product/Application (agile products only)': product,
                    'Reference Period': `${quarter} ${year}`,
                    'Contact Person': 'John Doe',
                    'Comment': '',
                    'Customer facing\r\nY/N': getRandomBoolean() ? 'Yes' : 'No',
                    'Mean Time to Repair (time in days, that is needed to bring service back to full operation)': mttr
                });
            });
            
            const mttrWS = XLSX.utils.json_to_sheet(mttrData);
            XLSX.utils.book_append_sheet(workbook, mttrWS, 'Mean Time to Repair');
            
            // Create CICD Pipeline tab
            const cicdData = [];
            nwu.teams.forEach(team => {
                const product = getRandomItem(products);
                const tribe = getRandomItem(tribes);
                
                cicdData.push({
                    'NWB': nwu.code,
                    'GPTS tribe name (Initiative name)': tribe,
                    'Team (if applicable)': team,
                    'Product/Application (agile products only)': product,
                    'Reference Period': `${quarter} ${year}`,
                    'Contact Person': 'John Doe',
                    'Comment': '',
                    'Customer facing\r\nY/N': getRandomBoolean() ? 'Yes' : 'No',
                    'Product is shipped with a CI/CD pipeline\r\n[yes/no]': getRandomBoolean() ? 'Yes' : 'No'
                });
            });
            
            const cicdWS = XLSX.utils.json_to_sheet(cicdData);
            XLSX.utils.book_append_sheet(workbook, cicdWS, 'CICD Pipeline');
            
            // Create Test automation tab
            const testAutomationData = [];
            nwu.teams.forEach(team => {
                const product = getRandomItem(products);
                const tribe = getRandomItem(tribes);
                const automationPercentage = getRandomNumber(0.1, 1, 2); // 10% to 100%
                
                testAutomationData.push({
                    'NWB': nwu.code,
                    'GPTS tribe name (Initiative name)': tribe,
                    'Team (if applicable)': team,
                    'Product/Application (agile products only)': product,
                    'Reference Period': `${quarter} ${year}`,
                    'Contact Person': 'John Doe',
                    'Comment': '',
                    'Customer facing\r\nY/N': getRandomBoolean() ? 'Yes' : 'No',
                    'Fullfillment of test automation ambition in the product \r\n[%]': automationPercentage
                });
            });
            
            const testAutomationWS = XLSX.utils.json_to_sheet(testAutomationData);
            XLSX.utils.book_append_sheet(workbook, testAutomationWS, 'Test automation');
            
            // Create DevOps tab
            const devOpsData = [];
            nwu.teams.forEach(team => {
                const product = getRandomItem(products);
                const tribe = getRandomItem(tribes);
                
                devOpsData.push({
                    'NWB': nwu.code,
                    'GPTS tribe name (Initiative name)': tribe,
                    'Team (if applicable)': team,
                    'Product/Application (agile products only)': product,
                    'Reference Period': `${quarter} ${year}`,
                    'Contact Person': 'John Doe',
                    'Comment': '',
                    'Customer facing\r\nY/N': getRandomBoolean() ? 'Yes' : 'No',
                    'Product team is responsible for Development and IT Operations (DevOps)\r\n[yes/no]': getRandomBoolean() ? 'Yes' : 'No'
                });
            });
            
            const devOpsWS = XLSX.utils.json_to_sheet(devOpsData);
            XLSX.utils.book_append_sheet(workbook, devOpsWS, 'DevOps');
            
            // Save the workbook
            const fileName = `${nwu.code}_${quarter}_${year}.xlsx`;
            const filePath = path.join(filesDir, fileName);
            XLSX.writeFile(workbook, filePath);
            console.log(`Generated ${fileName}`);
        });
    });
});

console.log('All test data files generated successfully!');
