#!/bin/bash
(cd ts_controller && tsc)
tar -cf game controller/ resources/ target/debug/keywords meta.txt
gsutil cp game gs://gamenite-games-testing/keywords/game
