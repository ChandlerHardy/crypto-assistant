# Sample Portfolio Data Scripts

This directory contains scripts and data files for populating the Crypto Portfolio Analyzer with sample data for testing and demonstration purposes.

## Files

### 📊 `sample-portfolio-data.json`
Comprehensive JSON file containing 5 different portfolio strategies:

1. **Diversified Portfolio** - Balanced mix of major cryptocurrencies
2. **DeFi Focus Portfolio** - DeFi tokens and smart contract platforms
3. **Layer 1 Competitors** - Alternative blockchain platforms
4. **Meme & Speculative** - High-risk meme coins and speculative assets
5. **Blue Chip Holdings** - Conservative positions in established cryptos

**Features Demonstrated:**
- Multiple buy/sell transactions per asset
- Realized P&L calculations (FIFO cost basis)
- Historical transaction preservation
- Diverse asset types and risk profiles
- Realistic price points and timeframes

### 🐍 `populate_sample_data.py`
Full-featured Python script that reads the JSON data and creates portfolios via GraphQL.

**Features:**
- Complete error handling
- Progress reporting
- Flexible user authentication
- Detailed transaction logging

**Usage:**
```bash
python3 scripts/populate_sample_data.py --user-email admin@cryptassist.com
```

**Requirements:**
```bash
pip install requests
```

### ⚡ `quick_populate.sh`
Lightweight bash script for quick testing setup.

**Features:**
- No dependencies (uses curl)
- Creates 2 sample portfolios
- Fast execution for development

**Usage:**
```bash
./scripts/quick_populate.sh
```

## Sample Data Overview

### Asset Coverage
- **Major Cryptos**: BTC, ETH, BNB
- **DeFi Tokens**: UNI, AAVE, LINK
- **Layer 1s**: SOL, AVAX, DOT, NEAR, ADA
- **Meme Coins**: DOGE, SHIB, PEPE

### Transaction Types
- **Buy transactions** with different prices over time
- **Sell transactions** demonstrating realized P&L
- **Multiple entries** showing DCA (Dollar Cost Averaging)
- **Profit-taking scenarios** for testing

### Testing Scenarios

1. **Portfolio Diversification Analysis**
   - Compare different investment strategies
   - Risk assessment across asset classes

2. **P&L Calculations**
   - Realized vs unrealized gains/losses
   - FIFO cost basis tracking
   - Performance over different timeframes

3. **Transaction History**
   - Complete audit trail preservation
   - Historical data integrity
   - Asset lifecycle management

4. **Risk Profiles**
   - Conservative (Blue Chip)
   - Moderate (Diversified)
   - Aggressive (Meme & Speculative)
   - Focused (DeFi, Layer 1)

## Quick Start

1. **Ensure backend is running** and admin user exists
2. **Run quick population**:
   ```bash
   ./scripts/quick_populate.sh
   ```
3. **View results** at https://cryptassist.chandlerhardy.com

## Customization

### Modify Asset Holdings
Edit `sample-portfolio-data.json` to:
- Change asset symbols
- Adjust amounts and prices
- Add/remove transactions
- Create new portfolio strategies

### Add New Assets
Include any supported cryptocurrency symbol from CoinGecko API.

### Adjust Timeframes
Modify transaction timestamps to test different scenarios:
- Recent vs historical performance
- Bull vs bear market entries
- DCA timing strategies

## Development Tips

- **Reset database** before running for clean slate
- **Test with different user accounts** for multi-user scenarios
- **Verify portfolio calculations** match expected P&L
- **Check transaction ordering** for FIFO accuracy

## Support

For issues or questions about sample data:
1. Check GraphQL endpoint connectivity
2. Verify user authentication
3. Review backend logs for errors
4. Ensure all required assets are supported by price API