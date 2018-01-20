#!/bin/sh

./halite -d "240 160" "node MyBot.js" "node defaultBot.js" && mv ./*.log ./output/logs && mv ./*.hlt ./output/replays
