import { sleep } from 'k6';
import { TestAddBalance, TestBalance, TestGetBalance } from './testCases/balanceTest.js';
import { TestLogin } from './testCases/loginTest.js';
import { TestRegistration } from './testCases/registerTest.js'
import { TestTransaction } from './testCases/transactionTest.js';
import { TestUpload } from './testCases/uploadFileTest.js';
import { generateRandomNumber } from './helper.js';

export const options = {
  // A number specifying the number of VUs to run concurrently.
  vus: 1,
  // A string specifying the total duration of the test run.
  iterations: 1,
};

// The function that defines VU logic.
//
// See https://grafana.com/docs/k6/latest/examples/get-started-with-k6/ to learn more
// about authoring k6 scripts.
//
export default function () {
  // eslint-disable-next-line no-undef
  const DEBUG_ALL = __ENV.DEBUG_ALL ? true : false
  // eslint-disable-next-line no-undef
  const ONLY_POSITIVE_CASE = __ENV.ONLY_POSITIVE ? true : false
  // eslint-disable-next-line no-undef
  const REAL_WORLD_CASE = __ENV.REAL_WORLD_CASE ? true : false;

  let usr
  if (!REAL_WORLD_CASE) {
    usr = TestRegistration(!ONLY_POSITIVE_CASE, DEBUG_ALL, { test: "register" })
    sleep(1)
    usr = TestLogin(usr, !ONLY_POSITIVE_CASE, DEBUG_ALL, { test: "login" })
    sleep(1)
    usr = TestUpload(usr, !ONLY_POSITIVE_CASE, { test: "upload" })
    sleep(1)
    const latestBalance = TestBalance(usr, !ONLY_POSITIVE_CASE, DEBUG_ALL, { test: "balance" })
    sleep(1)
    usr = TestTransaction(usr, latestBalance, !ONLY_POSITIVE_CASE, DEBUG_ALL, { test: "transaction" })
  } else {
    usr = TestRegistration(!ONLY_POSITIVE_CASE, DEBUG_ALL, { test: "register" })
    sleep(1)
    usr = TestLogin(usr, !ONLY_POSITIVE_CASE, DEBUG_ALL, { test: "login" })
    sleep(1)

    // Do transaction 10 times
    let prevBalance = 0
    for (let i = 0; i < 5; i++) {
      console.log("begin loop");
      let addBalanceRes = TestAddBalance(usr, !ONLY_POSITIVE_CASE, DEBUG_ALL, { test: "addBalance" })
      // sleep(generateRandomNumber(1, 3))
      let latestBalance = TestGetBalance(usr, addBalanceRes, prevBalance, !ONLY_POSITIVE_CASE, DEBUG_ALL, { test: "getBalance" })
      // sleep(generateRandomNumber(1, 3))

      for (let j = 0; j < 10; j++) {
        latestBalance = TestTransaction(usr, latestBalance, !ONLY_POSITIVE_CASE, DEBUG_ALL, { test: "transaction" })
        // sleep(generateRandomNumber(1, 3))
        prevBalance = latestBalance
      }
    }
  }
}
