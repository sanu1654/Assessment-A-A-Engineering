const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/potatoes', async (req, res) => {
    try {
        const { pounds } = req.query;

        // Download CSV file using Axios
        const response = await axios.get('http://eportal.aa-engineers.com/assessment/potatoQ12024.csv');

        // Parse CSV data
        const csvData = response.data.split('\n');
        const results = [];
        csvData.forEach((row) => {
            const [supplierName, weight, unitPrice, quantityAvailable] = row.split(',');
            if (parseInt(quantityAvailable) >= parseInt(pounds)) {
                results.push({
                    name: supplierName,
                    weight: parseFloat(weight),
                    unitPrice: parseFloat(unitPrice),
                    quantityAvailable: parseInt(quantityAvailable)
                });
            }
        });

        // Sort the results by price per pound and available quantity
        results.sort((a, b) => {
            const pricePerPoundA = a.unitPrice / a.weight;
            const pricePerPoundB = b.unitPrice / b.weight;
            return pricePerPoundA - pricePerPoundB || a.quantityAvailable - b.quantityAvailable;
        });

        // Send the three cheapest suppliers as JSON response
        res.json(results.slice(0, 3));
    } catch (error) {
        console.error('Error fetching and processing potato data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
