The easiest way to run DocuMatcher is to clone our GitHub repository, then use Docker to create a container (running instance of DocuMatcher)


# Docker

A guide to install `Docker Desktop` can be found [here](https://docs.docker.com/desktop/install/windows-install/).


# Git

`GitHub Desktop` can be installed from [the official site](https://desktop.github.com/download/)


# Instructions

Once both [Docker Desktop](#Docker) and [GitHub Desktop](#Git) have been installed you can clone our repository from [normit581/cits3200-proj](https://github.com/normit581/cits3200-proj).
Inside Docker Desktop, and with `cits3200-proj` cloned down, you should now be ready to start a container.


## Things To Note

- Ensure that there is an `app.env` file within the `deployment` directory of the project.
    - `app.env` can be an empty file, however it is required to be present


## Steps

1. Open a terminal inside Docker Desktop (There should be a button in the bottom right)
2. Navigate to the `cits3200-proj` project directory that you cloned down
    - `cd <directory>` will allow you to move into a directory
    - `cd ..` will allow you to move back out of a directory
    - `ls` will allow you to see all directories available from the current
3. from the `cits3200-proj` run the command `docker compose build`
4. once that command has completed, use the search bar at the top to search for `DocuMatcher` and select the result (you may need to select the `local` filter option if there are multiple)
5. click the `Run` button to start the container
    - If an error like 'cannot bind to port 80' appears, try re-running but in the `optional settings`, set `port` to `8080`
6. Wait for text to appear in the logs tab of the container (text should contain `Starting gunicorn 23.0.0` in the first line)
7. Open a browser and type `localhost` into the url (if you had to set port to 8080 type `localhost:8080`) and enter


## Stopping the container

- The square icon in the container page to stop the container
- use the bin icon to delete any containers (will require [steps](##Steps) 1-3 to rebuild the container for any more uses)
