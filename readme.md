# ProjectSprint! Social Media Test Cases

### Prerequisites
- [K6](https://k6.io/docs/get-started/installation/)
- A linux environment (WSL / MacOS should be fine)


### Environment Variables
- `BASE_URL` fill this with your backend url (eg: `http://localhost:8080`)

### How to run
#### For regular testing
```bash
BASE_URL=http://localhost:8080 make run
```
#### For load testing
```bash
BASE_URL=http://localhost:8080 make runAllTestCases
```