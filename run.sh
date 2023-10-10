#!/bin/bash

set -e

# build controller
cd ts_controller
tsc

# run web server and controlpad server
cd ../..
./bin/run-server.sh KeyWords/controller/ &

# run game
cd KeyWords
cargo run &

# open controller webpages
google-chrome http://localhost:3000?subid=0 --new-window
google-chrome http://localhost:3000?subid=1
google-chrome http://localhost:3000?subid=2
google-chrome http://localhost:3000?subid=3
