#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 output_file"
    exit 1
fi

output_file=$1

railwind -o dist/railwind-temp.css --include-preflight

# XXX: hack to make railwind act like "darkMode"
sed -e '/@media (prefers-color-scheme: dark) {/,/}/ {
        /@media (prefers-color-scheme: dark) {/d
        /}/d
        s/^\(\s*\)\(\.dark\)/\1.dark \2/g
    }' dist/railwind-temp.css > "$output_file"

rm dist/railwind-temp.css

scrollbar_reset="
*::-webkit-scrollbar {
  width: 3px;
}
 
*::-webkit-scrollbar-thumb {
  background: #0c4a6e;
  border-radius: 6px;
}

.dark *::-webkit-scrollbar-thumb {
  background: #e0f2fe;
}

*::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0);
}

body::-webkit-scrollbar {
  display: none;
}
"
echo "$scrollbar_reset" >> $output_file

# add fonts
# adds to top of file
sed -i $'1i@import url(\'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap\');' $output_file

fonts="
.font-mono {
  font-family: \"Space Mono\", monospace;   
}
"
echo "$fonts" >> $output_file

