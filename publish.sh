#!/bin/bash
(cd ts_controller && tsc)
#cargo build --release
cp target/release/keywords ./
tar -cfz game controller/ resources/ keywords meta.txt
gsutil cp game gs://gamenite-games-testing/keywords/game
gsutil setmeta -h "Cache-Control:no-cache, max-age=0" gs://gamenite-games-testing/keywords/game
