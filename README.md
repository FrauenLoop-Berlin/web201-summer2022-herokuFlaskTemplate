# Heroku / Flask / PostGres app template

## What is this template for?

As part of our course, we want to build a location-based web application. We know we will need a database to store some data, and that we want special support for geospatial data (latitude and longitude storage, searches based on distance, etc). Eventually we want to deploy our app somewhere!

This teamplate is a guide on how to setup your application. All steps are described on this Readme file.
You can clone / fork this repo to get the contents of some of the files, but otherwise, you will not build directly on top of this, as part of the guide you will create your own Github repo from scratch.

Also, through this guide:

- You setup a Heroku account and can deploy your project there, also from the start.
- You will create a Postgres DB within Heroku, so you do not need to run a DB engine locally on your machine.
- The template includes sample code to show a Google Map and some markers in it
- The template also includes a sample model with some prestored locations, just to test out the map functionality and make sure PostGis extension works too.

The idea is you use this to get a first working version of these basic functionalities, and then start changing things to build your own app.

## Disclaimer

The instructions and the commands below were run on an Ubuntu WSL inside Windows 10/11. Then I added the commands for Windows (ran those on Windows 11 Home)
If you are a Windows user, I totally recommend going the WSL route, altough it can be a little messy to setup.
If you are running on a Mac or some different setup, some stuff might be slightly different!

## Prerequisites

- A GitHub account and a [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) so you can commit stuff from the command line
- Git installed in your machine so you can execute git commands
- Python installed in your machine so you can execute Python commands and run Pyton scripts. Make sure you have version **3.6 or superior**. You also need to use pip, can't remember if that needed to be installed separately.
- A Google Maps API Key
- Might be needed: A local installation of [Postgres](https://www.postgresql.org/download/): The instructions given here will allow you to connect to the DB hosted in Heroku, even when you are running locally. Regardless, there are a few steps that may not work if you have no local Postgres installed. These are: 
  - the install of dependency `psycopg2` (you can workaround this one by installing `psycopg2-binary` instead)
  - Connecting to the Heroku db by using `heroku pg:psql`. To ensure this step will work fine, try executing the command `psql` from your command line. If the command is found, even when you see some error in connection to server or similar, you are OK. Only if the command is not found / recognized, then you might need to install Postgres / add this to your PATH. 

## Initializing the Project

Start by creating a new directory for your new app. You can do it by running these commands:
(I will use 'web-201-heroku-flask-template' as my app name)

**Mac / Linux / Windows**
```
mkdir web-201-heroku-flask-template
cd web-201-heroku-flask-template
```

Create a Python virtual environment:

**Mac / Linux**
```
python3 -m venv venv
source venv/bin/activate
```

**Windows**
You need to figure out [where is your Python executable](https://mothergeo-py.readthedocs.io/en/latest/development/how-to/venv-win.html#where-is-python) first, that for me is (you will at least have to put your own username there instead of mduha): 
```
virtualenv --python C:\Users\mduha\AppData\Local\Programs\Python\Python39\python.exe venv
.\venv\Scripts\activate
```

## Installing Dependencies

We want to get a bunch of libraries to get us started:
(execute these commands one by one in case some error / warning comes)

**Mac / Linux / Windows**
```
pip3 install Flask
pip3 install gunicorn
pip3 install psycopg2
pip3 install Flask-SQLAlchemy
pip3 install Geoalchemy2
pip3 install shapely
pip3 install flask_cors
pip3 install flask_wtf
```

More info about installing Flask can be found on their installation guide: https://flask.palletsprojects.com/en/2.0.x/installation/

We need a way to tell Heroku what are our app dependencies so they get also installed there.
We will use a requirements.txt file for that:

Once we got all the dependencies in our local, we put them into our requirements file:
(we need to be on the root directory of our project so the file gets created there)

**Mac / Linux**
```
python3 -m pip freeze > requirements.txt
```

**Windows**
```
pip freeze > requirements.txt
```

Verify that requirements.txt is created.

:eight_pointed_black_star: If later on you install more libraries on your local virtual env, remember to generate the requirements.txt file again and push that change so the next time you deploy to Heroku it gets installed there as well.

## Writing the initial Application Code

You can copy the code from this template into your project. Files and folders to copy:
(Also at this point it might be easier to open your project folder from VSCode, and start creating and editing files from there)

- static/
- templates/
- app.py
- forms.py
- models.py
- Procfile

## Sync your changes to Github

The best is to setup a git repo and start commiting changes there from the beginning. You will be able to go back to previous versions if needed, and also we will deploy to Heroku what is on the git repo at any given time.

To sync your app project with Github:

1. From the GitHub site / console, create a new empty repository (+ sign next to your uername > New Repository). Note down / copy your repo URL, it will look like *https://github.com/your-username/your-repo-name.git*
2. From your command line, run:

(replace 'https://github.com/mduhagon/web-201-heroku-flask-template.git' with YOUR repo URL from 1.)
(running the commands one by one makes it easier to follow in case something fails)

**Mac / Linux / Windows**
```
git init
echo venv > .gitignore
echo __pycache__ >> .gitignore
git add .gitignore app.py forms.py models.py requirements.txt Procfile
git add static
git add templates
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/mduhagon/web-201-heroku-flask-template.git <<< replace this
git push -u origin main
```

At this point, if you browse your Git repo via your browser, you will see something like this:

![First version of your repo](/_readme_assets/Repo-first-version.png)

## Setting up the Heroku cli and creating a Heroku app with a Posgres DB

[Setup a Heroku account](https://signup.heroku.com/) if you don't have one already.

The Heroku command-line interface (CLI) is a tool that allows you to create and manage Heroku applications from the terminal. It’s the quickest and the most convenient way to deploy your application.To install the Heroku CLI:

**Mac / Linux**
```
curl https://cli-assets.heroku.com/install.sh | sh
```

**Windows**
Download the cli executable from here: https://devcenter.heroku.com/articles/heroku-cli#install-the-heroku-cli
Install the CLI following the setup steps of the .exe file you downloaded (you can leave all default options suggested).

Next, you have to log in by running the following command:

**Mac / Linux**
(for me the 'heroku' command always needs to be run with sudo, otherwise it fails. You may not need sudo on your local env)
```
sudo heroku login
```

**Windows**
```
heroku login
```

This command promots you to press any key to go login on the browser. Do that.
This opens a website with a button to complete the login process. Click Log In to complete the authentication process and start using the Heroku CLI:

![heroku login browser window](/_readme_assets/Heroku-login.png)

If you were not already logged in Heroku's website, then you will have to enter username and password instead to login now. Once you do either of these,
in your command line interface, the heroku cli should say something like:

```
Logging in... done
Logged in as mduhagon@gmail.com <<< here you see your username, course
```

In order to run any command with the heroku cli to control your apps, deploy, etc, you first need to do the above login step. After a while the authentication expires, so if at some point you run a heroku client command and it starts asking for username / pass, rerun the login command and you should be back in business.

Now we will create a new app inside your Heroku account. For that you need a unique name. I chose 'mduhagon-web-201-heroku-flask' for mine. Wherever you see this name in my commands, replace it with **your app name**.

To create the app, run:

**Mac / Linux / Windows**
(might need to add sudo for Mac/Linux)
```
heroku create mduhagon-web-201-heroku-flask
```

if it works, you will see an output like this:

```
Creating ⬢ mduhagon-web-201-heroku-flask... done
https://mduhagon-web-201-heroku-flask.herokuapp.com/ | https://git.heroku.com/mduhagon-web-201-heroku-flask.git
```

Now, we want to add a PostGres database to our app (hobby-dev is the free version):

**Mac / Linux / Windows**
(might need to add sudo for Mac/Linux)
```
heroku addons:create heroku-postgresql:hobby-dev
```

You should see an output similar to this:

```
Creating heroku-postgresql:hobby-dev on ⬢ mduhagon-web-201-heroku-flask... free
Database has been created and is available
 ! This database is empty. If upgrading, you can transfer
 ! data from another database with pg:copy
Created postgresql-parallel-63698 as DATABASE_URL
Use heroku addons:docs heroku-postgresql to view documentation
```

As the last step in setting up our database, we want to install PostGis, the extendion library to deal with geolocated data.
To be able to do this we need our database name, in my example that is 'postgresql-parallel-63698' (notice that is mentioned on the output when we created the db, otherwise you can see the db name from the Heroku web console)

**Mac / Linux / Windows**
(might need to add sudo for Mac/Linux)
```
heroku pg:psql postgresql-parallel-63698  <<< replace with your db name
```

If you see this error, you will need to install / troubleshoot installation for Postgres:

```
--> Connecting to postgresql-trapezoidal-55663
 !    The local psql command could not be located. For help installing psql, see
 !    https://devcenter.heroku.com/articles/heroku-postgresql#local-setup
```
For windows: 
- [Install Postgress via executable](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads) The latest version / 14.x is OK.
- If you re-open your Porwershell window, type `psql`, and still see an error that says `psql : The term 'psql' is not recognized as ....` you need to add this to your PATH by running this command (Assuming you installed Postgres version 14):

```
$env:Path += ";C:\Program Files\PostgreSQL\14\bin"
```
Now you should be ready to try again:
```
heroku pg:psql postgresql-parallel-63698  <<< replace with your db name
```

Once the `pg:sql` command works, you will find yourself 'inside' a psql command line where you can run commands against your database. Run the following:

```
CREATE EXTENSION postgis;
```

You should see the following output if the install went fine:

```
CREATE EXTENSION
```

Use 'exit' to get out of the db command line.

At this point you have an app, and a database in Heroku, but they are empty. You can look a bit around what you have created by using the [Heroku dashboard](https://devcenter.heroku.com/articles/heroku-dashboard):

https://dashboard.heroku.com/

Next steps are making sure your app runs locally, then deploying it for the first time to Heroku:

## Running the app locally

First, you want to get the app running locally, because if something did not work, it is easier to see what the issue is on your own machine than it is to do many Heroku deploys for each problem. This will continue to be true as you make changes and develop new features, you first run them locally and when they work, you will deploy an update to Heroku.

To run the sample code you copied from this template, two environment variables need to be set:

- DATABASE_URL: this is the connection string for the PostGres database. Because the DB is hosted by Heroku, it also defines the user / password / etc for us. And these are 'ephemeral' credentials that heroku will rotate periodically to make your db more secure. We don't know how often the credentials change, but we should assume they will, so no hardcoding these anywhere. To get the proper value you can use the heroku cli, and below you get a bit of command line magic to directly put that into a local env variable.
- GOOGLE_MAPS_API_KEY: You need to get this for yourself (via the Google app console). It will be sent to the Google Maps API to render the map on the initial page of the sample app.

To get the data you need to set DATABASE_URL, run:

**Mac / Linux / Windows**
```
heroku pg:credentials:url postgresql-parallel-63698 <<<< replace this with YOUR database name from previous steps
```

This will output something like this:

```
Connection information for default credential.
Connection info string:
   "dbname=xxxxxxxxxxxxxx host=ec2-XXX-XXX-XXX-XXX.compute-X.amazonaws.com port=XXXX user=XXXXXXX password=XXXXXXXXXXXXXX sslmode=XXXXXX"
Connection URL:
   postgres://XXXXXXX:YYYYYYYYYYYYYYYYYYYYYYY@ec2-XXX-XXX-XXX-XXX.compute-X.amazonaws.com:XXXX/XXXXXXXXXXXXXXX
```

What we want to set as `DATABASE_URL` is the value shown as Connection URL, that starts with 'postgres://'
You can copy that value from the output and use it to set the variable. 

To set the environment variables run:

**Mac / Linux**
```
export DATABASE_URL=postgres://XXXXXXX:YYYYYYYYYYYYYYYYYYYYYYY@ec2-XXX-XXX-XXX-XXX.compute-X.amazonaws.com:XXXX/XXXXXXXXXXXXXXX <<< replace this with your string from above
export GOOGLE_MAPS_API_KEY=ssdfsdfsAAqfdfsuincswdfgcxhmmjzdfgsevfh  <<<<< replace this with your API key from Google Maps
```

**Windows / Option 1**
```
SET DATABASE_URL=postgres://XXXXXXX:YYYYYYYYYYYYYYYYYYYYYYY@ec2-XXX-XXX-XXX-XXX.compute-X.amazonaws.com:XXXX/XXXXXXXXXXXXXXX <<< replace this with your string from above
SET GOOGLE_MAPS_API_KEY=ssdfsdfsAAqfdfsuincswdfgcxhmmjzdfgsevfh  <<<<< replace this with your API key from Google Maps
```

**Windows / Option 2**
(In the PowerShell the above commands were not really working, `echo %DATABASE_URL%` returned just %DATABASE_URL% which is not OK, and the bellow commands worked )
```
$env:DATABASE_URL = "postgres://XXXXXXX:YYYYYYYYYYYYYYYYYYYYYYY@ec2-XXX-XXX-XXX-XXX.compute-X.amazonaws.com:XXXX/XXXXXXXXXXXXXXX" <<< replace this with your string from above
$env:GOOGLE_MAPS_API_KEY = "ssdfsdfsAAqfdfsuincswdfgcxhmmjzdfgsevfh" <<<<< replace this with your API key from Google Maps
```

:eight_pointed_black_star: The environment variables you are setting now only 'exist' for as long as you keep the terminal / Powershell session open. When you close it and start again, the variables are gone, and you have to set them again! So you will do this step every time you start working on your app.

The value for GOOGLE_MAPS_API_KEY in my sample is just a dummy value, you need to get the real api key value from your Google Apps console and use that value instead.
Remember never to commit this API key to your repo because that is public and the key could get exploited / used by other people. Use of Google Maps API costs money after some limits, so be careful. If you publish your key by mistake you can invalidate it and create a new one.

If you want to verify the values of the env variables, use:

**Mac / Linux**
```
echo $DATABASE_URL
echo $GOOGLE_MAPS_API_KEY
```

**Windows / Option 1**
```
echo %DATABASE_URL%
echo %GOOGLE_MAPS_API_KEY%
```

**Windows / Option 2**
```
$env:DATABASE_URL
$env:GOOGLE_MAPS_API_KEY
```

Finally, to run the app:

**Mac / Linux / Windows **
```
flask run
```

You should see something like this on the output of the console:
```
 * Environment: production
   WARNING: This is a development server. Do not use it in a production deployment.
   Use a production WSGI server instead.
 * Debug mode: off
 * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
```

If you access ```http://127.0.0.1:5000/``` or ```http://localhost:5000/``` you should see:

![sample app](/_readme_assets/Sample-app.png)

Bonus: during development, you normally want to reload your application automatically whenever you make a change to it. You can do this by passing an environment variable, FLASK_ENV=development, to flask run:

```
FLASK_ENV=development flask run
```

You can also run your app locally from VSCode in debug mode, following the setup steps we did in https://github.com/FrauenLoop-Berlin/web201-summer2022-helloFlask

Use Ctrl+C to quit / shut down the flask app.

## Deploying the app to Heroku

Now that you verified the app runs locally, you can deploy it to Heroku!

Make sure you do not have any local changes not commited to main branch at this point:

**Mac / Linux / Windows **
```
git status
```

Should only show local files that are not meant to be commited like `__pycache__/` (you do not need to commit this directory ever, you can add it to .gitignore later)

```
On branch main
Your branch is ahead of 'origin/main' by 1 commit.
  (use "git push" to publish your local commits)

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        __pycache__/

nothing added to commit but untracked files present (use "git add" to track)
```

If there are other things, add them and push them to main.

```
git add XXXXX
git commit -m "Some more changes"
git push
```

Now all your code is up-to-date with GitHub. This is important because you push to Heroku whatever is in the main branch of your repo. 

Before deploy, a small extra step. Remember we need 2 environment variables for the sample code to work. DATABASE_URL is by default provided by Heroku because we have a DB attached to our app. The second env variable is something we define, so we need to set it manually as a Heroku config variable:

**Mac / Linux / Windows **
```
heroku config:set GOOGLE_MAPS_API_KEY=ssdfsdfsAAqfdfsuincswdfgcxhmmjzdfgsevfh <<<<< replace this with your API key from Google Maps
```

Now all is ready. To deploy that current state of your main branch into your Heroku app, run:

**Mac / Linux / Windows **
```
git push heroku main
```

This will output a lot of things as heroku installs all components. By the end if all is OK you will see the URL of your launched app:

```
remote: -----> Launching...
remote:        Released v5
remote:        https://mduhagon-web-201-heroku-delete.herokuapp.com/ deployed to Heroku
remote:
remote: Verifying deploy... done.
```

If all went well, your sample app is now running in Heroku as well! Check the provided URL to verify.

## What now?

The sample code has some useful functionality: it is taking the database connection string from the already set Heroku env variable, it is using another config variable for the Google Maps key so that is not hardcoded in your source code (because the Google API key cannot be commited to GitHub!). It is also storing some sample data with lat / long and querying for it when you zoom / reposition the map. You can take a closer look at all this, so you then decide how to extend it.

You will keep making changes to the app, adding the functionality of your project. Everything in the template is just a sample, you can change / remove things as you wish.
Each time you have some new functionality working commit it to GitHub, and then to Heroku, so you make sure it works there as well.

In a nutshell, this process will look like this:

1. Use git status to see all the files you added or changed:

```
git status
```

2. Use git add to stage all the above changes that should go to your repo (you may need to do this for multiple paths or you can also list many together)

```
git add xxxxx
```

3. Commit the changes and push to GitHub

```
git commit -m "a short description of your changes so others know what you did / is also a future reference for yourself"
git push
```

4. Deploy the changes to Heroku:

```
heroku login
git push heroku main
```

Happy coding!
