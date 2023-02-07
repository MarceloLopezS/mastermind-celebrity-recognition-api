This is the Back-end part of Mastermind - Face Detection App.

This part of the project allows the app to register users (perfoming email verification) and login to their accounts (using Jason Web Tokens to create a session); 
to then be able to use the face detection functionality which is provided by Clarifai.com API (also performed via Back-End), as well as display the user information and update his/her number of face detection entries every time they provide and request an image detection that contains a face.

This projects is built using Node.js, Express.js, CORS, Json Web Token and Nodemailer.