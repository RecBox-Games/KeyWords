#!/bin/bash
set -e

os_name=$(../bin/os-name.sh)
if [[ ! "$os_name" =~ "Debian GNU/Linux 11 (bullseye)" ]]; then
    echo "must build from a build machine"
    echo "Exiting"
    exit
fi

(cd ts_controller && tsc)
cargo build --release
cp target/release/keywords ./
tar -czf game.tar controller/ resources/ keywords meta.txt
gsutil cp game.tar gs://gamenite-games-testing/keywords/game
gsutil setmeta -h "Cache-Control:no-cache, max-age=10" gs://gamenite-games-testing/keywords/game
#gsutil setmeta -h "Cache-Control:no-store" gs://gamenite-games-testing/keywords/game
