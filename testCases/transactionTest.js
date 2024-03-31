import { generateTestObjects, isExists, testPostJson, assert, generateUniqueName, testGet, generateRandomNumber } from "../helper.js";

const postTransactionNegativePayloads = generateTestObjects({
    recipientBankAccountNumber: { type: "string", notNull: true, minLength: 5, maxLength: 50 },
    recipientBankName: { type: "string", notNull: true, minLength: 5, maxLength: 30 },
    balances: { type: "number", notNull: true, min: 1 },
    fromCurrency: { type: "string", notNull: true, minLength: 1, maxLength: 3 },
}, {
    recipientBankAccountNumber: generateUniqueName(),
    recipientBankName: "Bank Central Asia",
    balances: 1000,
    fromCurrency: "USD",
})

const TEST_NAME = "(transaction test)"

export function TestTransaction(user, latestBalance, doNegativeCase, debug, tags) {
    if (!user) return null
    if (!latestBalance) return null

    let res
    // eslint-disable-next-line no-undef
    let route = __ENV.BASE_URL + "/v1/transaction"
    // eslint-disable-next-line no-undef
    let balanceRoute = __ENV.BASE_URL + "/v1/balance"
    // eslint-disable-next-line no-undef
    let balanceHistoryRoute = __ENV.BASE_URL + "/v1/balance/history"

    const currentFeature = TEST_NAME + " | post transaction"
    const headers = { "Authorization": "Bearer " + user.accessToken }

    const positivePayload = {
        recipientBankAccountNumber: generateUniqueName(),
        recipientBankName: "Bank Central Asia",
        balances: generateRandomNumber(1, latestBalance / 10), // to make sure that transaction can be executed up to 10 times
        fromCurrency: "USD",
    }

    if (doNegativeCase) {
        // Negative case, no auth
        res = testPostJson(route, {}, {}, tags, ["noContentType"])
        assert(res, currentFeature, debug, {
            ["no auth should return 401"]: (r) => r.status === 401
        })

        // Negative case, invalid body
        res = testPostJson(route, {}, headers, tags, ["noContentType"])
        assert(res, currentFeature, debug, {
            ["no payload should return 400"]: (r) => r.status === 400
        })

        // Negative case, invalid payload
        postTransactionNegativePayloads.forEach(payload => {
            res = testPostJson(route, payload, headers, tags)
            assert(res, currentFeature, debug, {
                ['invalid payload should return 400']: (r) => r.status === 400,
            }, payload)
        });
    }

    // Positive case, do a transaction
    res = testPostJson(route, positivePayload, headers, tags)
    assert(res, currentFeature, debug, {
        ['valid payload should return 200']: (r) => r.status === 200,
    }, positivePayload)

    // Positive case, get balance
    res = testGet(balanceRoute, {}, headers, tags)
    let newLatestBalance = 0
    assert(res, currentFeature, debug, {
        'get balance should return 200': (r) => r.status === 200,
        'get balance should have reduced value': (r) => {
            let res = isExists(r, 'data')
            if (!res) return false
            if (!Array.isArray(res)) return false
            if (res.length !== 1) return false
            if (res.some(s => s.balance === latestBalance - positivePayload.balances)) {
                newLatestBalance = latestBalance - positivePayload.balances
                return true
            }
            return false
        },
    })

    // Positive case, get balance history
    res = testGet(balanceHistoryRoute, {}, headers, tags)
    assert(res, currentFeature, debug, {
        'get balance history should return 200': (r) => r.status === 200,
        'get balance history should have the history balance': (r) => {
            let res = isExists(r, 'data')
            if (!res) return false
            if (!Array.isArray(res)) return false
            if (res.length !== 1) return false

            return res.some(s => s.balance === positivePayload.balances)
            // return res.some(s => {
            //     return (s.balance === positivePayload.balances)
            // (s.currency === positivePayload.fromCurrency) &&
            // (s.source && s.source.bankAccountNumber === positivePayload.recipientBankAccountNumber) &&
            // (s.source && s.source.bankName === positivePayload.recipientBankName)
            // })
        },
    })

    return newLatestBalance
}

