import { check } from "k6";
import http from "k6/http";

/**
 * 
 * @param {import("k6/http").RefinedResponse<ResponseType | undefined>} k6response 
 * @param {import("k6").Checkers} conditions 
 */
export function assert(k6response, featureName, isDebug, conditions, requestPayload) {
    const checks = {}

    if (isDebug) {
        console.log(featureName + " | request payload:", requestPayload);
        console.log(featureName + " | response payload:", k6response.body);
    }
    Object.keys(conditions).forEach(k => {
        let condition = conditions[k]
        let testName = featureName + " | " + k
        if (isDebug) {
            condition = () => {
                const res = conditions[k](k6response)
                console.log(testName + " | assert result:", res);
                return res
            }
        }
        checks[testName] = condition
    });

    return check(k6response, checks)
}

/**
 * Checks wether k6 response have the data that query asks
 * @param {import("k6/http").RefinedResponse<ResponseType | undefined>} v 
 * @param {string} query 
 */
export function isExists(v, query) {
    const splittedQuery = query.split(".")
    try {
        const json = v.json()
        let val;
        if (json) {
            val = json
            splittedQuery.forEach(query => {
                const v = val[query]
                if (!v) {
                    return false
                }
                if (typeof v === "boolean") {
                    val = v.toString()
                } else {
                    val = v
                }
            });
            return val
        }
    } catch (error) { /* empty */ }
    return false
}
/**
 * validate ISO date string
 * @param {string} dateString 
 * @returns {Boolean}
 */
export function isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime()); // getTime() returns NaN for 'Invalid Date'
}

/**
 * Checks whether k6 response has the data that the query asks and matches it
 * @param {import("k6/http").RefinedResponse<ResponseType | undefined >} v 
 * @param {string} query 
 * @param {any} expected 
 * @returns 
 */
export function isEqual(v, query, expected) {
    const i = isExists(v, query);
    let e = expected;
    if (typeof expected === "boolean") {
        e = e.toString();
    }
    return i === e;
}

export function generateRandomImageUrl() {
    return `http://${generateRandomDomain()}/image.png`
}

export function generateRandomPhoneNumber(addPlusPrefix) {
    const callingCodes = [
        '1', '44', '49', '61', '81', '86', '93', '355', '213', '376', '244', '54', '374', '297', '61', '43', '994', '973', '880', '375', '32', '501', '229', '975', '591', '387', '267', '55', '673', '359', '226', '257', '855', '237', '238', '236', '235', '56', '86', '57', '269', '242', '243', '682', '506', '385', '53', '357', '420', '45', '253', '670', '593', '20', '503', '240', '291', '372', '251', '500', '298', '679', '358', '33', '689', '241', '220', '995', '49', '233', '350', '30', '299', '502', '224', '245', '592', '509', '504', '852', '36', '354', '91', '62', '98', '964', '353', '972', '39', '225', '81', '962', '7', '254', '686', '965', '996', '856', '371', '961', '266', '231', '218', '423', '370', '352', '853', '389', '261', '265', '60', '960', '223', '356', '692', '222', '230', '262', '52', '691', '373', '377', '976', '382', '212', '258', '95', '264', '674', '977', '31', '687', '64', '505', '227', '234', '683', '850', '47', '968', '92', '680', '507', '675', '595', '51', '63', '48', '351', '974', '40', '7', '250', '590', '685', '378', '239', '966', '221', '381', '248', '232', '65', '421', '386', '677', '252', '27', '82', '34', '94', '249', '597', '268', '46', '41', '963', '886', '992', '255', '66', '228', '690', '676', '216', '90', '993', '688', '256', '380', '971', '44', '598', '998', '678', '58', '84', '681', '967', '260', '263'
    ];
    const callingCode = callingCodes[Math.floor(Math.random() * callingCodes.length)];
    const phoneNumber = Math.floor(Math.random() * 10000000).toString().padStart(8, '0');

    return addPlusPrefix ? "+" + callingCode + phoneNumber : callingCode + phoneNumber;
}

function generateRandomDomain() {
    const domain = generateUniqueName().replace(/\s/g, "").toLowerCase();
    const tlds = ['com', 'net', 'org', 'io', 'co', 'xyz']; // Add more TLDs if needed
    const tld = tlds[Math.floor(Math.random() * tlds.length)];
    return `${domain}.${tld}`
}

export function generateRandomEmail() {
    const username = generateUniqueUsername();
    const domain = generateRandomDomain()

    const email = `${username}@${domain}`;

    return email;
}


export function generateRandomPassword() {
    const length = Math.floor(Math.random() * 11) + 5; // Random length between 5 and 15
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters.charAt(randomIndex);
    }

    return password;
}

export function generateUniqueUsername() {
    // Define parts of names for generating random names
    const prefixes = ['An', 'Ben', 'Jon', 'Xen', 'Lor', 'Sam', 'Max', 'Jen', 'Leo', 'Kay', 'Alex', 'Eva', 'Zoe'];
    const middles = ['dra', 'vi', 'na', 'lo', 'ki', 'sa', 'ra', 'li', 'mo', 'ne', 'ja', 'mi', 'ko'];
    const suffixes = ['son', 'ton', 'ly', 'en', 'er', 'an', 'ry', 'ley', 'leigh', 'sie', 'den', 'leya', 'vin', 'lyn', 'ley', 'don'];

    let username = '';
    while (username.length < 5 || username.length > 15) {
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const middle = middles[Math.floor(Math.random() * middles.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        username = prefix + middle + suffix + Math.floor(Math.random() * 10000);
    }

    return username;
}
export function generateUniqueName() {
    // Define parts of names for generating random names
    const prefixes = ['An', 'Ben', 'Jon', 'Xen', 'Lor', 'Sam', 'Max', 'Jen', 'Leo', 'Kay'];
    const middles = ['dra', 'vi', 'na', 'lo', 'ki', 'sa', 'ra', 'li', 'mo', 'ne'];
    const suffixes = ['son', 'ton', 'ly', 'en', 'er', 'an', 'ry', 'ley', 'leigh', 'sie'];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const middle = middles[Math.floor(Math.random() * middles.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const name = prefix + " " + middle + " " + suffix;

    return name;
}
/**
 * Generates a random number between the specified minimum and maximum values.
 * @param {number} min - The minimum value for the random number.
 * @param {number} max - The maximum value for the random number.
 * @returns {number} - The generated random number.
 */
export function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Sends a Get request with JSON data to the specified route.
 * @param {string} route - The route to send the request to.
 * @param {object} params - The params that will be parsed into the URL.
 * @param {string[]} options - Additional options for the request. 
 *                             Available options: `"noContentType"`
 * @returns {import("k6/http").RefinedResponse} - k6 http response.
 */
export function testGet(route, params, headersObj, tags = {}) {
    const queryParams = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
    const modifiedRoute = route + "?" + queryParams;

    return http.get(modifiedRoute, { headers: headersObj, tags });
}

/**
 * Sends a POST request with JSON data to the specified route.
 * @param {string} route - The route to send the request to.
 * @param {object} body - The JSON data to send in the request body.
 * @param {object} headersObj - External headers other than `Content-Type`
 * @param {string[]} options - Additional options for the request. 
 *                             Available options: `"noContentType"`, `"plainBody"`
 * @returns {import("k6/http").RefinedResponse} - k6 http response.
 */
export function testPostJson(route, body, headersObj, tags = {}, options = [],) {
    const headers = options.includes("noContentType") ? Object.assign({}, headersObj) : Object.assign({ "Content-Type": "application/json" }, headersObj)
    const parsedBody = options.includes("plainBody") ? body : JSON.stringify(body);

    return http.post(route, parsedBody, { headers, tags });
}


/**
 * Sends a Patch request with JSON data to the specified route.
 * @param {string} route - The route to send the request to.
 * @param {object} body - The JSON data to send in the request body.
 * @param {string[]} options - Additional options for the request. 
 *                             Available options: `"noContentType"`, `"plainBody"`
 * @param {object} headersObj - External headers other than `Content-Type`
 * @returns {import("k6/http").RefinedResponse} - k6 http response.
 */
export function testPatchJson(route, body, headersObj, tags = {}, options = []) {
    const headers = options.includes("noContentType") ? Object.assign({}, headersObj) : Object.assign({ "Content-Type": "application/json" }, headersObj)
    const parsedBody = options.includes("plainBody") ? body : JSON.stringify(body);

    return http.patch(route, parsedBody, { headers, tags });
}


/**
 * @typedef {Object} Schema
 * @property {boolean} [isPhoneNumber] - If true, the property must be a valid international phone number.
 * @property {boolean} [addPlusPrefixPhoneNumber] - If true, the property must start with a plus sign.
 * @property {boolean} [notNull] - If true, the property cannot be null.
 * @property {boolean} [isUrl] - If true, the property must be a valid URL.
 * @property {boolean} [isEmail] - If true, the property must be a valid email.
 * @property {('string'|'number'|'boolean'|'object'|'array')} [type] - The type of the property.
 * @property {number} [minLength] - The minimum length of the property (for strings).
 * @property {number} [maxLength] - The maximum length of the property (for strings).
 * @property {Array} [enum] - The property must be one of these values.
 * @property {number} [min] - The minimum value of the property (for numbers).
 * @property {number} [max] - The maximum value of the property (for numbers).
 * @property {Schema} [items] - The schema for each item (for arrays).
 * @property {Object.<string, Schema>} [properties] - The schema for each property (for objects).
 */

/**
 * Generates test objects based on a given schema and a valid template.
 * The function creates a list of violations, which are test cases that violate the rules defined in the schema.
 * 
 * @param {Schema} schema - An object that defines the rules for each property. 
 * Each property in the schema object can have rules like `notNull`, `isUrl`, `type`, `minLength`, `maxLength`, `enum`, `min`, `max`, `items`, and `properties`.
 * 
 * @param {Object} validTemplate - An object that adheres to the rules defined in the schema. 
 * This object is used as a base to generate the test cases (violations).
 * 
 * @returns {Array} violations - An array of test cases that violate the rules defined in the schema. 
 * Each test case is a clone of the validTemplate, with one property modified to violate a rule.
 */
export function generateTestObjects(schema, validTemplate) {
    const violations = [];

    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function addViolation(path, violation) {
        const testCase = clone(validTemplate);
        let parts = path.split('.');
        let subObject = testCase;
        for (let i = 0; i < parts.length - 1; i++) {
            if (parts[i].endsWith(']')) {
                let index = parts[i].match(/\[(\d+)\]/)[1];
                parts[i] = parts[i].replace(/\[\d+\]/, '');
                subObject = subObject[parts[i]][index];
            } else {
                subObject = subObject[parts[i]];
            }
        }
        let lastPart = parts[parts.length - 1];
        if (lastPart.endsWith(']')) {
            let index = lastPart.match(/\[(\d+)\]/)[1];
            lastPart = lastPart.replace(/\[\d+\]/, '');
            subObject[lastPart][index] = violation;
        } else {
            subObject[lastPart] = violation;
        }
        violations.push(testCase);
    }

    function generateDataTypeViolations(propPath, type) {
        const dataTypes = {
            'string': ["", 123, true, {}, []],
            'string-param': [123, true, {}, []],
            'number': ["notANumber", true, {}, []],
            'boolean': ["notABoolean", 123, {}, []],
            'object': ["notAnObject", 123, true, []], // Assuming a non-empty object is valid
            'array': ["notAnArray", 123, true, {}]
        };

        dataTypes[type].forEach(violation => {
            addViolation(propPath, violation);
        });
    }

    function generateViolationsForProp(propPath, propRules, parentValue) {
        if (propRules.notNull) {
            addViolation(propPath, null);
        }
        if (propRules.isUrl) {
            addViolation(propPath, "notAUrl");
            addViolation(propPath, "http://incomplete");
        }

        if (propRules.isEmail) {
            addViolation(propPath, "notAnEmail");
            addViolation(propPath, "missingdomain.com");
        }

        if (propRules.isPhoneNumber) {
            addViolation(propPath, "notAPhoneNumber");
            addViolation(propPath, "1234567890");
        }

        if (propRules.addPlusPrefixPhoneNumber) {
            addViolation(propPath, "1234567890");
        }

        if (propRules.type) {
            generateDataTypeViolations(propPath, propRules.type);
        }
        switch (propRules.type) {
            case 'string', 'string-param':
                if (propRules.minLength !== undefined) {
                    addViolation(propPath, 'a'.repeat(propRules.minLength - 1));
                }
                if (propRules.maxLength !== undefined) {
                    addViolation(propPath, 'a'.repeat(propRules.maxLength + 1));
                }
                if (propRules.enum !== undefined) {
                    addViolation(propPath, 'notAnEnumValue');
                }
                break;
            case 'number':
                if (propRules.min !== undefined) {
                    addViolation(propPath, propRules.min - 1);
                }
                if (propRules.max !== undefined) {
                    addViolation(propPath, propRules.max + 1);
                }
                break;
            case 'array':
                if (propRules.items && propRules.items.notNull) {
                    addViolation(`${propPath}[0]`, null); // Violates notNull for array items
                }
                if (propRules.items && propRules.items.type === 'string') {
                    // Already handled by generateDataTypeViolations
                }
                break;
            case 'object':
                if (propRules.properties) {
                    Object.entries(propRules.properties).forEach(([nestedProp, nestedRules]) => {
                        generateViolationsForProp(`${propPath}.${nestedProp}`, nestedRules, parentValue[nestedProp]);
                    });
                }
                break;
        }
    }

    Object.entries(schema).forEach(([prop, propRules]) => {
        generateViolationsForProp(prop, propRules, validTemplate[prop]);
    });

    return violations;
}