/**
 * function retrieving the available funds on each account
 */

const getAvailableFunds = async (client) => {
  const accounts = await client.rest.account.listAccounts();
  const availableFunds = new Map();
  accounts.forEach((account) => {
    if (account.balance > 0) {
      availableFunds.set(account.currency, account.available);
    }
  });
  return availableFunds;
};
exports.getAvailableFunds = getAvailableFunds;
