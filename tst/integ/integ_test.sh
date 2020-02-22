CURRENT_DIRECTORY=`dirname $0`
node $CURRENT_DIRECTORY/generate-pdf-cli -u 'https://www.wikipedia.org/' -r -o $CURRENT_DIRECTORY/options.json -w $CURRENT_DIRECTORY/integ-test-out.pdf
if [ -f $CURRENT_DIRECTORY/integ-test-out.pdf ]; then
  rm $CURRENT_DIRECTORY/integ-test-out.pdf
  echo "integ test succeded"
  exit 0
else
  echo "integ test failed"
  exit 1
fi
