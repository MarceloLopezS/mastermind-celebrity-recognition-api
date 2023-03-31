# **Mastermind - Face Detection App: Back-End**

This is the Back-End part of the face detection app project, developed as a REST API, using *Node.js* and *Express.js*; written with clean, organized and up to date code; utilizing best practices for optimal understanding and readability, as well as the latest tools available.

## **Simple sumary**

This part of the project allows the user to register, perform account activation through email verification, get authenticated, get authorized, upload an image that may contain a celebrity face to detect, using an AI model trained by [Clarifai](https://www.clarifai.com/); and increment it's entries while doing the last.

All the user data is recieved from the Front-End, filtered, stored and processed in the server to then return a response according to the request requirements and authorization.

## **Technical summary**

The Back-End part handles the core functionality of the app. For this, several libraries were added as project dependencies and PostgreSQL was chosen as relational database.

### **Database**

Regarding the database, two tables were created. One is intended to store the user information (id, name, email, entries, joined), with premeditated data types and attributes (serial PRIMARY KEY, varchar, varchar UNIQUE, bigint DEFAULT 0, date) that can not be null. The other table is intended to store the user authentication data (id, email, hash, activation, expiration), also with premeditated data types and attributes (serial PRIMARY KEY, varchar UNIQUE, char, varchar, timestamp) that can not be null. Notice as well that the foreign key to relate tables is the email.

### **User registration**

Starting the server logic from the user registration. For this request, The API has a dedicated POST handler and parsing middleware that allows the correct reading of the user data sent from the Front-End in JSON format.
The handler filters and validates all the information, acting as a security layer, to then prepare the data to be stored in the database. As many tables will be updated, this process is made using an SQL Transaction. The users table recieves the data without any aditional process, but the auth table stores a *hashed password*; and for that, the [Bcrypt](https://www.npmjs.com/package/bcrypt) library is used to encrypt the password async. Also, a unique token is generated for the account activation using [Json Web Token](https://www.npmjs.com/package/jsonwebtoken) as well as it's expiration date. After all this data is generated, it's queried into the database and a verification email is sent to the user (using [nodemailer](https://www.npmjs.com/package/nodemailer)) containing a link with the unique token. If some error happens during this process, the transaccion becomes invalid and the changes are not commited.

### **Account activation**

The next step in the logic is the account activation. This is triggered when the user clicks on the activation link that was sent to it's email in the previous step, before it expires. This link sends a request to the server, which has a dedicated GET request handler. The handler decodes the token to get the user and modify it's corresponding row in the auth table. Two columns are modified in this process: The activation column's value is updated to 'active' and the expiration column's value is updated to 'infinity', efectively activating the account as every activation check logic will be focused on those two values.

### **User login**

Next on, the login logic. There is a dedicated POST request handler for this route that parses, filters and validates all the information. After that, the user is selected from the database and it's password is compared to the hash using Bcrypt. If there is a password match, a unique access token is created and sent back in the response (using [cookie-parser](https://www.npmjs.com/package/cookie-parser)) to be stored in a cookie. This will be useful for the next step in the logic.

### **User authorization middleware**

Continuing with the logic steps, the authorization middleware is an important part that is present in every protected route. It is in charge of validating and authorizing every request that the user does to the protected routes. As mentioned before, once the user is authenticated, a unique token is stored as a cookie. This cookie is present in every request the user does, and it contains some user information within it as it's a Json Web Token. This token will be verified inside this middleware and an authorization will be granted or rejected. If it's granted, a new `authorizedUser` property will be added to the `req` object for further use where user authorization is required.

### **User information**

When the user information is requested, the dedicated GET request handler will return the user information if it's authorized (previously defined in the authorization middleware).

### **User logout**

This step is very simple. It just unsets the token cookie so the user no longer has authorization.


### **Password reset**

This feature has three main steps: The recieval of the user email that forgot it's password, the generation of a unique reset token that will be sent via email, and the actual update of the hash in the auth table once the user submits the new password, get's verified using the reset token and gets authorized to make the update. For this, two route handlers are created. The first one recives the user email, signs a token using Json Web Token and then sends a link to the email containig the token. This link redirects the user to a form (handled by the Front-End) where the user will enter and confirm it's password. The Front-End will then send the user password as well as the unique reset token as a POST request, which will be handled by the second handler in the Back-End. This handler will verify the token and update the user password if the first is valid. After that, a response will be send to the Front-End for this to handle the display of success or fail to the user.

### **Face detection**

Now the main logic. There is a dedicated POST request handler for this special case, as the user sends a file (image). This means that a special middleware is required for parsing the multipart/form-data sent in the request. This middleware is provided by the [Multer](https://www.npmjs.com/package/multer) library, which is used to parse and process the request to then save the image in the server storage as the first step. Then, an image link (URL) is explicitly generated so it can then be used to send a request to the Clarifai API. This means that the server also needs to be able to serve static files, so the proper express static middleware configuration is performed. Once the link is generated, and the server is always ready to serve an image, it's time to connect to the Clarifai API and send the request. The connection and authorization needed, as well as the request, is handled by the [clarifai-nodejs-grpc](https://www.npmjs.com/package/clarifai-nodejs-grpc) package. It allows the user to send a request to evaluate with an specified AI model; in this case, the *celebrity-face-detection* model. After the evaluation, a response is sent back. This response contains all the data generated by the model. The dedicated server logic will filter this data and prepare the bounding box coordinates, celebrity name and correct prediction probability to be sent as a response to the Front-End. With this information, the Front-End will be able to display all the intended information from the detection.

### **User entry increment**

Finally, when the user recieves a positive response from the server once it has sent an image and recieved a detection, it makes a request that will be processed by a dedicated PUT request handler. This handler selects the database information from the authorized user and increments it's entries; finally sendind a success status as a response to the Front-End, which will refresh it's state to display the latest user entries.

### **Note**

All the requests send back a response, whether it's a redirection or information in JSON format containing the status and additional information to be displayed in the Front-End.

## **Conclusion**

In order to correctly and optimally process all requests and data, this part of the project is built using Node.js, Express.js, enviromental variables, PostgreSQL, CORS, Bcrypt, Json Web Token, Nodemailer, Cookie Parser, Multer and Clarifai API.

## **Useful info**

- Front-End code can be found in [this repository.](https://github.com/MarceloLopezS/face-detection-app-front-end)