(cd ts_controller && tsc)
cargo build
tar -cf game controller/ resources/ target/debug/keywords meta.txt
gcloud storage cp game gs://gamenit-games-testing/keywords
