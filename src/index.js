const fs = require('fs');
const path = require('path');

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

function transform(data) {
    return data.map((item) => {return { 'symbol': item.symbol, 'amount': item.market_value.amount, 'date': new Date(item.effective_date)}});
}

function fetchDividendsByYear(data, year) {
    return data.filter((item) => {if (item.date.getFullYear() == year) return item;})
}

function sumDividends(data) {
    return data.reduce((total, current) => total + current.amount, 0);
}

function summarizeDividends(err, data) {
    var separator = `\n${'='.repeat(50)}`;
    
    var fileData = JSON.parse(data).results;
    var dividends = transform(fileData);    

    console.log(separator)
    console.log('DIVIDENDS BY SYMBOL')
    console.log(`${JSON.stringify(fetchDividendsBySymbol(dividends), null, 2)}`);
    
    console.log(separator);
    var dividends2021 = fetchDividendsByYear(dividends, 2021);
    var dividends2022 = fetchDividendsByYear(dividends, 2022);    
    var dividends2023 = fetchDividendsByYear(dividends, 2023);
    var total2021 = sumDividends(dividends2021);
    var total2022 = sumDividends(dividends2022);
    var total2023 = sumDividends(dividends2023)
    console.log(`Total in 2021: ${total2021}`);
    console.log(`Total in 2022: ${total2022}`);
    console.log(`Total in 2023: ${total2023}`);
    console.log(`Total Increase from 2021 to 2022: ${total2022 - total2021}`);

    console.log(separator)    
    console.log(`Total Amount: ${sumDividends(dividends)}`);    
}



pullData('./data.json', summarizeDividends);
