import { generateTestObjects, isExists, testPostJson, assert, generateUniqueName, testGet, generateRandomNumber } from "../helper.js";

const postBalanceNegativePayloads = generateTestObjects({
    senderBankAccountNumber: { type: "string", notNull: true, minLength: 5, maxLength: 50 },
    senderBankName: { type: "string", notNull: true, minLength: 5, maxLength: 30 },
    addedBalanceRes: { type: "number", notNull: true, min: 1 },
    currency: { type: "string", notNull: true, minLength: 1, maxLength: 3 },
    transferProofImg: { type: "string", notNull: true, isUrl: true },
}, {
    senderBankAccountNumber: generateUniqueName(),
    senderBankName: "BNI",
    addedBalance: 1000,
    currency: "USD",
    transferProofImg: "https://www.google.com",
})

const TEST_NAME = "(balance test)"

export function TestBalance(user, doNegativeCase, debug = false, tags = {}) {
    if (!user) return null

    let addBalanceRes = TestAddBalance(user, doNegativeCase, debug, tags)
    const latestBalance = TestGetBalance(user, addBalanceRes, 0, doNegativeCase, debug, tags)
    TestGetBalanceHistory(user, addBalanceRes, doNegativeCase, debug, tags)

    return latestBalance
}

export function TestAddBalance(user, doNegativeCase, debug, tags) {
    if (!user) return null

    let res
    // eslint-disable-next-line no-undef
    let route = __ENV.BASE_URL + "/v1/balance"
    const currentFeature = TEST_NAME + " | post balance"
    const headers = { "Authorization": "Bearer " + user.accessToken }

    const positivePayload = {
        senderBankAccountNumber: generateUniqueName(),
        senderBankName: "BNI",
        addedBalance: generateRandomNumber(100, 10000),
        currency: "USD",
        transferProofImg: "https://www.google.com",
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
        postBalanceNegativePayloads.forEach(payload => {
            res = testPostJson(route, payload, headers, tags)
            assert(res, currentFeature, debug, {
                ['invalid payload should return 400']: (r) => r.status === 400,
            }, payload)
        });
    }

    // Positive case
    res = testPostJson(route, positivePayload, headers, tags)
    assert(res, currentFeature, debug, {
        ['valid payload should return 200']: (r) => r.status === 200,
    }, positivePayload)

    return positivePayload
}

export function TestGetBalance(user, addedBalanceRes, prevBalance = 0, doNegativeCase, debug, tags) {
    if (!user) return null
    if (!addedBalanceRes) return null

    let res
    // eslint-disable-next-line no-undef
    let route = __ENV.BASE_URL + "/v1/balance"
    const currentFeature = TEST_NAME + " | get balance"
    const headers = { "Authorization": "Bearer " + user.accessToken }

    if (doNegativeCase) {
        // Negative case, no auth
        res = testGet(route, {}, {}, tags)
        assert(res, currentFeature, debug, {
            ["no auth should return 401"]: (r) => r.status === 401
        })

        // Negative case, invalid body
        res = testGet(route, {}, headers, tags)
        assert(res, currentFeature, debug, {
            ["no payload should return 400"]: (r) => r.status === 400
        })
    }

    // Positive case
    res = testGet(route, {}, headers, tags)
    let newLatestBalance = 0
    assert(res, currentFeature, debug, {
        ['valid payload should return 200']: (r) => r.status === 200,
        ['valid payload should have the correct balance']: (r) => {
            let res = isExists(r, 'data')
            if (!res) return false
            if (!Array.isArray(res)) return false
            if (res.length !== 1) return false
            if (res.some(s => s.balance === prevBalance + addedBalanceRes.addedBalance)) {
                newLatestBalance = prevBalance + addedBalanceRes.addedBalance
                return true
            }
            return false
        },
    })
    return newLatestBalance
}

export function TestGetBalanceHistory(user, prevBalance, doNegativeCase, debug, tags) {
    if (!user) return null
    if (!prevBalance) return null

    let res
    // eslint-disable-next-line no-undef
    let route = __ENV.BASE_URL + "/v1/balance/history"
    const currentFeature = TEST_NAME + " | get balance history"
    const headers = { "Authorization": "Bearer " + user.accessToken }

    if (doNegativeCase) {
        // Negative case, no auth
        res = testGet(route, {}, {}, tags)
        assert(res, currentFeature, debug, {
            ["no auth should return 401"]: (r) => r.status === 401
        })

        // Negative case, invalid body
        res = testGet(route, {}, headers, tags)
        assert(res, currentFeature, debug, {
            ["no payload should return 400"]: (r) => r.status === 400
        })
    }

    // Positive case
    res = testGet(route, {}, headers, tags)
    assert(res, currentFeature, debug, {
        ['valid payload should return 200']: (r) => r.status === 200,
        ['valid payload should have the history balance']: (r) => {
            let res = isExists(r, 'data')
            if (!res) return false
            if (!Array.isArray(res)) return false
            if (res.length !== 1) return false

            return res.some(s => {
                return (s.balance === prevBalance.addedBalance) &&
                    (s.currency === prevBalance.currency) &&
                    (s.source && s.source.bankAccountNumber === prevBalance.senderBankAccountNumber) &&
                    (s.source && s.source.bankName === prevBalance.senderBankName)
            })
        },
    })
}