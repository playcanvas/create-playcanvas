#!/bin/bash -e

TYPE=$1

if [[ ! " major minor patch " =~ " $TYPE " ]]; then
    echo "Usage: $0 (major|minor|patch)"
    exit 1
fi

git fetch --tags

read -p "About to create a $TYPE release. Continue? (y/N) " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Release cancelled."
    exit 1
fi

npm version "$TYPE"
