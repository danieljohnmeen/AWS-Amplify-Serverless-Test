/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/



const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const CognitoUserAttribute = AmazonCognitoIdentity.CognitoUserAttribute;
const AuthenticationDetails = AmazonCognitoIdentity.AuthenticationDetails;
const CognitoUser = AmazonCognitoIdentity.CognitoUser;
require('dotenv').config();

const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});


/**********************
 * Get method *
 **********************/

app.get('/auth', function (req, res) {
  // Add your code here
  res.json({ success: 'get call succeed!', url: req.url });
});


/****************************
* Post method *
****************************/

app.post('/auth', async function (req, res) {
  try {
    const { action, username, password, email } = req.body;
    switch (action) {
      case 'signup':
        await signUp(username, password, email);
        res.json({ statusCode: 200, body: 'User signed up successfully' });
        break;
      case 'signin':
        const signInResponse = await signIn(username, password);
        res.json({ statusCode: 200, body: signInResponse });
        break;
      default:
        res.json({ statusCode: 400, body: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.json({ statusCode: 500, error: error });
  }
});

async function signUp(username, password, email) {
  const poolData = {
    UserPoolId: process.env.USER_POOL_ID,
    ClientId: process.env.USER_POOL_CLIENT_ID
  };
  const userPool = new CognitoUserPool(poolData);
  const attributeList = [
    new CognitoUserAttribute({ Name: 'email', Value: email })
  ];
  return new Promise((resolve, reject) => {
    userPool.signUp(username, password, attributeList, null, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}
async function signIn(username, password) {
  const authenticationData = {
    Username: username,
    Password: password
  };
  const authenticationDetails = new AuthenticationDetails(authenticationData);
  const poolData = {
    UserPoolId: process.env.USER_POOL_ID,
    ClientId: process.env.USER_POOL_CLIENT_ID
  };
  console.log(poolData)
  const userPool = new CognitoUserPool(poolData);
  const userData = {
    Username: username,
    Pool: userPool
  };
  const cognitoUser = new CognitoUser(userData);
  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => resolve(result),
      onFailure: (error) => reject(error)
    });
  });
}
app.listen(3000, function () {
  console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
