const fs = require('fs');
const path = require('path');

const separator = `\n${'='.repeat(50)}`;
const years = [ 2021, 2022, 2023 ];

function pullData(file, action) {
    var filePath = path.join(__dirname, file);    
    fs.readFile(filePath, {encoding: 'utf-8'}, action);
}

function fetchDividendsBySymbol(data) {
    var result = {};
    data.map((item) => {
        if (result[item.symbol]) {
            result[item.symbol] += item.amount;                        
        } else {
        result[item.symbol] = item.amount;
        }
    });
    return result;
}

function transformDividends(data) {
    return data.map((item) => {return { 'symbol': item.symbol, 'amount': item.market_value.amount, 'date': new Date(item.effective_date)}});
}

function fetchDataByYear(data, year) {
    return data.filter((item) => {if (item.date.getFullYear() == year) return item;})
}

function generateDataAmountByYear(data) {
    years.forEach(element => {
        console.log(`Total in ${element}: ${calculateAmount(fetchDataByYear(data, element))}`);
    });
}

function calculateAmount(data) {
    return data.reduce((total, current) => total + current.amount, 0).toFixed(2);
}

function summarizeDividends(err, data) {
    var fileData = JSON.parse(data).results;
    var dividends = transformDividends(fileData);    

    console.log(separator)
    console.log('DIVIDENDS BY SYMBOL')
    console.log(`${JSON.stringify(fetchDividendsBySymbol(dividends), null, 2)}`);
    
    console.log(separator);
    console.log('DIVIDENDS BY YEAR');
    generateDataAmountByYear(dividends);

    console.log(separator);    
    console.log(`TOTAL AMOUNT: ${calculateAmount(dividends)}`);    
}

function transformFunds(data) {
    return data.map((item) => { return { 'date': new Date(item.post_dated), 'amount': item.value.amount }; })
}

function summarizeFunds(err, data) {
    const fileData = JSON.parse(data).results;
    const funds = transformFunds(fileData);

    console.log(separator);
    console.log(`TOTAL FUNDED: ${calculateAmount(funds)}`);

    console.log(separator);
    console.log('FUNDED BY YEAR')
    generateDataAmountByYear(funds);
}

function transformPurchases(data) {
    const fullFilledPurchases = data.filter((item) => item.status == 'posted');
    return fullFilledPurchases.map((item) => { return { 'symbol': item.symbol, 'date': new Date(item.completed_at), 'amount': item.account_value.amount, 'quantity': item.quantity, 'marketValue': item.market_value.amount, 'fxRate': item.fill_fx_rate }; })
}

function summarizePurchases(err, data) {
    const fileData = JSON.parse(data).results;
    const purchases = transformPurchases(fileData);

    console.log(separator);
    console.log(JSON.stringify(fetchDividendsBySymbol(purchases), null, 2));
}

pullData('./fund_data.json', summarizeFunds);
pullData('./dividend_data.json', summarizeDividends);
pullData('./purchases_data.json', summarizePurchases);
