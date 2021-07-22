#!/bin/bash
yarn workspace ani-cursor build
yarn workspace webamp build
yarn workspace webamp build-library
yarn workspace webamp-modern-2 build
mv packages/webamp-modern-2/src/build packages/webamp/demo/built/modern