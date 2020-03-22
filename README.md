# vote_for_quote
A simple web app so I could learn Firebase and EJS templating.
The point is for users to upload original quotes and other users can upvote/downvote quotes

## IMPORTANT 3-22-2020
So it has just occured to me that I have been using the Firebase Auth client on the server, which results in the server signing everybody in as the same user. What I should have done was manage the current user on the frontend and send the necessary data to the backend to update Firebase Firestore.
This debacle also explains why I was able to make requests from Postman even though I had not yet logged in using the Postman client, and this project is essentially now just one big mistake.

I realize now that Firebase is usually used *as* the backend, and my Express backend was simply acting as a proxy, which is fine. What is not fine is the usage of [`firebase.auth.Auth.currentUser`](https://firebase.google.com/docs/reference/node/firebase.auth.Auth#currentuser) on the backend. As stated above, the frontend should keep track of the current user as the frontend is run on each end-user's machine separately, and the backend should handle allowing or denying access to certain operations and pages depending on whether or not the user ID is valid.

Something I could have done was sign in on the frontend and send the user's ID to the backend then check if the user ID exists in Firebase Auth instead of sending email/password logins to the backend and signing in the user on the backend. In short, I would no longer check the [`firebase.auth.Auth.currentUser`](https://firebase.google.com/docs/reference/node/firebase.auth.Auth#currentuser) property and instead validate the user ID sent from the frontend. As this would still require sending sensitive data to/from the backend it *should be encrypted*, which is something I never got around to doing for the current system employed by this project (i.e., I did not encrypt email/password logins).

I will return to this project under a new repository some other day when I am more competent, but for now I will explore new horizions with app development.

### Setup
```
npm install
```

### Development
```
npm run dev
```
#### Note
The .scss in client/scss must be compiled. Use whatever method you desire, but I have provided an npm script to accomplish this in a compressed style: `npm run client-sass`

### Build
```
npm run build
```