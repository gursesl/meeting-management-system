MeetMe Meeting Scheduling System
========================================

System Setup
----------------------------------------
* Install Node.js - http://nodejs.org
* Install Meteor `curl https://install.meteor.com | /bin/sh`
* Install Meteorite `npm install -g meteorite`
	* If the setup fails run `sudo chown -R YOURUSER  /usr/local/lib/node_modules`
	* Rerun `npm install -g meteorite`
* Clone git repo `git clone https://github.com/gursesl/64clicks.git meetme`
* Optional: Set your default remote origin `git config remote.origin.url git@github.com:YOURUSERNAME/64clicks.git`
* `cd meetme`
* `mrt add`
* `mrt run`
* Launch a browser and navigate to [http://localhost:3000](http://localhost:3000)

Production Setup
----------------------------------------
* Create Heroku app `heroku create maria-app --stack cedar --buildpack https://github.com/oortcloud/heroku-buildpack-meteorite.git`
* Add required env variable `heroku config:add ROOT_URL=maria-app.herokuapp.com`
* Create remote git repo for Heroku `git remote add heroku git@heroku.com:maria-app.git`
* Verify git remotes `git remote -v`
* Commit changes `git commit * -m "comment"`
* Push to default git repo `git push origin`
* Deploy to Heroku `git push heroku master`
