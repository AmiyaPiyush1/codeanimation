JS Interpreter
==============

**Note:** This is *NOT* an official package from Neil Fraser or Google, it is just a way to publish the package on NPM with some effort to comply with semver standards, I am not the owner of the original source-code of JS Interpreter.

An npm package for the [Neil Fraser's JS-Interpreter](https://github.com/NeilFraser/JS-Interpreter)

For license and pretty much any other information (except for the NPM package itself) refer to the [original repo](https://github.com/NeilFraser/JS-Interpreter)

This repository is not a fork of the original repository anymore, instead it
clones it as a `gitmodule` and packs it using `webpack` to an npm package.

Additional to the original library, this package contains a cli version which
can be used for testing the interpreter from terminal.

Changes are recorded on a best effort basis in [CHANGELOG.md](CHANGELOG.md).

# Installation

```
npm install js-interpreter
```

or

```
yarn add js-interpreter
```

# Usage

## Using require

```
var Interpreter = require('js-interpreter');
var myInterpreter = new Interpreter('2 * 2');
```

## Using ES6 import

```
import Interpreter from 'js-interpreter';
const myInterpreter = new Interpreter('2 * 2');
```

## Using command line interface

```
js-interpreter path/to/my/file.js
```

or

```
echo 'console.log(1 + 2)' | js-interpreter 
```

# Updating the submodules

## Initialization

After the first time cloning this repository you would need to pull the `original-repo` from GitHub using the following command:

```bash
git submodule update --init --recursive
```

## Updating the submodule

If you've already initialized the repository and you want to fetch the latest changes use the following command:

```
git submodule foreach git pull origin master
```

- Check all the commits on the origin to identify the changes and update `CHANGELOG.md`
- Bump the version according to semver rules
- After PR is merged:
  - Run `yarn install` to install the dependencies
  - Run `yarn publish` to publish the package
  - Push the version as a tag to Github
