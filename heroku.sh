rev=`git log --pretty=format:"%h" -1`
dt=`git log --pretty=format:"%cd" -1 --date=short`

# Replace revision
cat public/config.json | sed "s/[0-9a-f]\{7\}/$rev/" > public/config-mod.json 
cat public/config-mod.json > public/config.json
rm -rf public/config-mod.json

# Replace last edited date
cat public/config.json | sed "s/[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}/$dt/" > public/config-mod.json 
cat public/config-mod.json > public/config.json
rm -rf public/config-mod.json

# Commit changes to Github
git commit public/config.json -m "Automated deployment to Heroku with updated date and revision."

# Push to Github
git push origin master

# Push to Heroku
git push heroku master