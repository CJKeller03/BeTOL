# BeTOL

The online counterpart to the Bag 'n Tag data tagging application: Bag n Tag OnLine

**Note: This is _not_ a complete guide to setting up the BeTOL API**

## How do I get it working?

1. Download Node for your operating system [here] (https://nodejs.org/en/download/).
2. Use `git clone` or the "download" button to save this code to a folder on your computer.
3. Open a terminal and use `cd` to change your working directory to the folder you cloned this code to in the previous step.
4. Run `npm install` to download the necessary dependencies.
5. Once the dependencies have finished installing, use `npm start run` to start running the server. By default, it opens on port 3000.

Please contact me if these instructions don't work.

## What do I do with it?

Currently, the only endpoint that does anything is `/api/tag`.
If you open this in a browser, the server will send your browser an image from one of the two matches that come with this API by default,
but you won't be able to do anything with it. For testing this API, I used [Postman] (https://www.getpostman.com/downloads/),
which allows significantly more flexibility with sending http requests to the server. 

The BeTOL API uses signed cookies to keep track of user sessions to make sure a cliant always gets the correct image.
When a client sends a GET request to the API, it checks for a session cookie. If it doesn't exist, a cookie is created and the client is
assigned a random match to tag. Then, the API reads the cookie to find out what match the client is tagging images from,
gets the next untagged image from that match, and sends it to the client.

When a client sends a POST request to the API, it reads the match from client's session cookie (if there is no cookie or the cookie is expired,
the client is redirected to the GET route), saves the json data the client sent into a new folder with the match's name,
deletes the old image, and sends the client the next image for that match. If there is no next image, the client is redirected to the
`/` route, which currently just sends "Thanks!".
