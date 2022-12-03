#include <iostream>
// Class header
#include "crypto_exchanges.h"

namespace Exchange
{
    // Constructor
    CryptoExchanges::CryptoExchanges(void)
    {
        this->g_my_float = (float)1.001;
        this->g_my_int[0] = (int)-99;
        this->g_my_int[1] = (int)42;
    }
    // Public Reference
    float &CryptoExchanges::my_float(void)
    {
        return this->g_my_float;
    }
    // Public Reference
    int &CryptoExchanges::my_int(int index)
    {
        return this->g_my_int[index];
    }
} 
