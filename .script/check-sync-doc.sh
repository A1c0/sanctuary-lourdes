yarn sync-doc
output=$(git diff --name-only)
echo $output
if [ -z "$output" ]
then
      echo "Done"
      exit 0
else
      echo "The doc is not sync with your code"
      exit 1
fi
