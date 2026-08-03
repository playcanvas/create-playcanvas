#!/bin/bash -e

TYPE=$1

if [[ ! " major minor patch " =~ " $TYPE " ]]; then
    echo "Usage: $0 (major|minor|patch)"
    exit 1
fi

git fetch --tags

npm version "$TYPE" --no-git-tag-version >> /dev/null
NEXT_VERSION=$(npm pkg get version | sed 's/"//g')
git reset --hard >> /dev/null

read -p "About to release 'v$NEXT_VERSION'. Continue? (y/N) " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Release cancelled."
    exit 1
fi

npm version "$TYPE"
