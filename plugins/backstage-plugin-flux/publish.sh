#!/usr/bin/env bash

set -e
set -x

NEW_VERSION=$(git describe --always --tags --match "v*")
STRIPPED_NEW_VERSION=$(echo $NEW_VERSION | sed -e 's/^v//')

yarn clean
yarn tsc
yarn build
# don't git commit or push
yarn publish --new-version $STRIPPED_NEW_VERSION --no-git-tag-version
