# Saddle Up!
### Use a RAML definition to put a Saddle on your API!

(very early dev).

Who likes creating test harnesses for their APIs? *Not this guy.*
It's a fuss, and such a pain to keep in line with your actual API.

Saddle Up hopes to change this. Saddle Up uses a RAML definition to
create a light front-end webapp to sit on top of your API. All the pain of creating
the test harness is removed! More time for ~~beer~~ developing.

RAML is a [RESTful API Modeling Language](http://raml.org) - or simply a really neat way for you to describe your API.

### Get Started
SaddleUp is a static single page application, use NGINX or your favourite alternative to serve these files (however using `file://` locations can be problematic with CORS, watch out). The `github-api-v3.raml` is included as a demo, you do not need this file. All other files are required for proper use.

Add your API RAML to the same directory as the repo: the file should be named `api.raml`. Open up the `index.html` and SaddleUp will do the rest! 

### Feedback and Contributing
If you find any bugs then please raise them on the GitHub bugtracker. Any contributions will be greatly accepted :)
