#!/bin/zsh
set -eu

target="public/cards/rws"
mkdir -p "$target"

download() {
  local output="$1"
  local source_name="$2"
  if [[ -s "$target/$output" ]]; then
    return
  fi
  local encoded="${source_name// /%20}"
  encoded="${encoded//\?/%3F}"
  curl -L --fail --silent --show-error --retry 4 --retry-delay 2 \
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/${encoded}?width=600" \
    -o "$target/$output"
  echo "$output"
}

major_names=(
  "RWS Tarot 00 Fool.jpg" "RWS Tarot 01 Magician.jpg" "RWS Tarot 02 High Priestess.jpg"
  "RWS Tarot 03 Empress.jpg" "RWS Tarot 04 Emperor.jpg" "RWS Tarot 05 Hierophant.jpg"
  "RWS Tarot 06 Lovers.jpg" "RWS Tarot 07 Chariot.jpg" "RWS Tarot 08 Strength.jpg"
  "RWS Tarot 09 Hermit.jpg" "RWS Tarot 10 Wheel of Fortune.jpg" "RWS Tarot 11 Justice.jpg"
  "RWS Tarot 12 Hanged Man.jpg" "RWS Tarot 13 Death.jpg" "RWS Tarot 14 Temperance.jpg"
  "RWS Tarot 15 Devil.jpg" "RWS Tarot 16 Tower.jpg" "RWS Tarot 17 Star.jpg"
  "RWS Tarot 18 Moon.jpg" "RWS Tarot 19 Sun.jpg" "RWS Tarot 20 Judgement.jpg" "RWS Tarot 21 World.jpg"
)

for number in {0..21}; do
  padded=$(printf "%02d" "$number")
  case "$number" in
    0) output="00-fool.jpg";; 1) output="01-magician.jpg";; 2) output="02-priestess.jpg";;
    6) output="06-lovers.jpg";; 9) output="09-hermit.jpg";; 10) output="10-wheel.jpg";;
    13) output="13-death.jpg";; 14) output="14-temperance.jpg";; 17) output="17-star.jpg";;
    *) output="major-${padded}.jpg";;
  esac
  download "$output" "${major_names[$((number + 1))]}"
done

for suit in wands cups swords pentacles; do
  case "$suit" in
    wands) prefix="Wands";; cups) prefix="Cups";; swords) prefix="Swords";; pentacles) prefix="Pents";;
  esac
  for number in {1..14}; do
    padded=$(printf "%02d" "$number")
    download "${suit}-${padded}.jpg" "${prefix}${padded}.jpg"
  done
done
