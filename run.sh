#!/bin/bash

set -e

# kill old keywords
grep_kill -f keywords

# build controller
cd ts_controller
tsc

# run web server and controlpad server
cd ../..
./bin/run-server.sh KeyWords/controller/ &

# open controller webpages
if [[ "$1" == "--chrome" ]]; then
    google-chrome http://localhost:3000?subid=0 --new-window 
    google-chrome http://localhost:3000?subid=1 
    google-chrome http://localhost:3000?subid=2 
    google-chrome http://localhost:3000?subid=3 
fi

# run game
cd KeyWords
cargo run
