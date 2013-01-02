rev=`git rev-parse HEAD`
echo $rev
pattern="s/[0-9a-f]\\b\{5,40\}\\b/$rev/"
echo $pattern

# Replace values
cat public/config.json | sed "s/[0-9a-f]\{5,40\}/$rev/" > public/config-mod.json 
cat public/config-mod.json > public/config.json
rm -rf public/config-mod.json

# Push to Github
git push origin master

# Push to Heroku
git push heroku master