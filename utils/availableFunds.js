const getAvailableFunds = async (client, mainLogger) => {
    const accounts = await client.rest.account.listAccounts();
    const availableFunds = new Map();
    accounts.forEach((account) => {
        if (account.balance > 0) {
            mainLogger.info(`    Currency: ${account.currency}  Balance: ${account.balance} Available: ${account.available}`);
            availableFunds.set(account.currency, account.available);
        }
    });
    return availableFunds;
}
exports.getAvailableFunds = getAvailableFunds;