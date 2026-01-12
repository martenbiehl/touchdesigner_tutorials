#!/opt/homebrew/bin/fish
for file in (find . -type f -name "*.mov" -not -name "*_c.mov")
    set output (string replace -r '\.mov$' '_c.mov' $file)
    ffmpeg -i $file -c:v libx264 -crf 23 -c:a aac $output
end
