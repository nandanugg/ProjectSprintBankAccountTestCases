import { generateTestObjects, generateRandomPassword, isEqual, isExists, testPostJson, generateRandomEmail, assert } from "../helper.js";

const loginNegativePayloads = generateTestObjects({
    email: { type: "string", notNull: true, isEmail: true },
    name: { type: "string", minLength: 5, maxLength: 50, notNull: true },
    password: { type: "string", minLength: 5, maxLength: 15, notNull: true }
}, {
    email: generateRandomEmail(),
    password: generateRandomPassword()
})


const TEST_NAME = "(login test)"

export function TestLogin(user, doNegativeCase, debug = false, tags = {}) {
    if (!user) return null

    let res
    // eslint-disable-next-line no-undef
    let route = __ENV.BASE_URL + "/v1/user/login"
    const currentFeature = TEST_NAME + " | post login"
    const positivePayload = {
        email: user.email,
        name: user.name,
        password: user.password
    }

    if (doNegativeCase) {
        // Negative case, no body
        res = testPostJson(route, {}, {}, tags, ["noContentType"])
        assert(res, currentFeature, debug, {
            ["no payload should return 400"]: (r) => r.status === 400
        })


        // Negative case, invalid payload
        loginNegativePayloads.forEach(payload => {
            res = testPostJson(route, payload, {}, tags)
            assert(res, currentFeature, debug, {
                ['invalid payload should return 400']: (r) => r.status === 400,
            }, payload)
        });
    }

    // Positive case
    res = testPostJson(route, positivePayload, {}, tags)
    const positivePayloadPassAssertTest = assert(res, currentFeature, debug, {
        ['valid payload should return 200']: (r) => r.status === 200,
        ['valid payload should have user name']: (r) => isEqual(r, 'data.name', positivePayload.name),
        ['valid payload should have user email']: (r) => isEqual(r, 'data.email', positivePayload.email),
        ['valid payload should have user accessToken']: (r) => isExists(r, 'data.accessToken'),
    }, positivePayload)


    if (!positivePayloadPassAssertTest) return null
    return Object.assign(positivePayload, {
        accessToken: res.json().data.accessToken
    })
}
