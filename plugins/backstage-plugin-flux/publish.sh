#!/usr/bin/env bash

set -e

STRIPPED_NEW_VERSION=$(echo $NEW_VERSION | sed -e 's/^v//')

yarn clean
yarn tsc
yarn build
yarn publish --new-version $STRIPPED_NEW_VERSION
