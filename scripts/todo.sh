#!/bin/sh
echo "Files having TODOs and FIXMEs:"
files=$(grep -ro -n 'TODO\|FIXME' *.js . --exclude-dir={node_modules,test,scripts})
for FILE in $files; do echo $FILE; done

