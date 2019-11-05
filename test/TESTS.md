This directory has the following structure:
```
test/
    js/functional/ - Functional tests
    js/unit/ - Unit tests
```
## Running the tests locally

To get started, run the following command in the root directory:
```
npm install
```

This will install Intern and some supporting libraries in `node_modules`.

Once complete, intern tests may be tested with a `grunt` script issued
from the root of the repository. To run the unit and functional test suites in headless chrome, run the
following command:
```
grunt test
```

## Writing tests

For information on how to write Intern tests, see
https://theintern.io/docs.html#Intern/4/docs/docs%2Fwriting_tests.md.