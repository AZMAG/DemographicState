This directory has the following structure:
```
test/
    js/functional/ - Functional tests
    js/unit/ - Unit tests
```
## Setup

Install the [JRE](https://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html) or [JDK](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html). Selenium requires Java to run WebDriver tests.

Chrome will needs to be at version 78 or higher.

Run the following command in the root directory.

```
npm install
```

This will install Intern and some supporting libraries in `node_modules`.

## Running the tests locally

Once installed, intern tests may be tested with a `grunt` script issued
from the root of the repository. To run the unit and functional test suites in headless chrome, run the
following command:

```
grunt test
```

## Writing tests

For information on how to write Intern tests, see
https://theintern.io/docs.html#Intern/4/docs/docs%2Fwriting_tests.md.