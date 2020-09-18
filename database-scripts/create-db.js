// From terminal - Create a new database or switch to an existing one:
// use curbside-pickup-app;

// Connect to curbside database
conn = new Mongo();
db = conn.getDB("curbside-pickup-app-dev");

// Create Users colleciton
// With options: db.createCollection("users", options)
db.createCollection("users")

// Insert user
db.users.insert({
    email:"dlarrivee@shawscott.com",password:"$2a$08$BJrRCsxoYM15TmoHsNra4OU4P3cNRhWNQMSr/4GMGZW7KZulAyjlO",isDeleted:true,
    signUpDate:"2020-06-10",
    username:"dlarrivee",
    companyId:"shawScott",
    storeId:"1",
    resetPasswordToken:"",
    resetPasswordExpires:"",
    fullName:"Dylan Update",
    userRoleType:"superUser"
})



// Create Users colleciton
// With options: db.createCollection("users", options)
db.createCollection("store-info")

// Insert user
db.users.insert({
    "storeId":"1337","__v":"0",
    "storeStatus":true,
    "companyId":"shawScott"
})

// Create Users colleciton
// With options: db.createCollection("users", options)
db.createCollection("company-info")

// Insert user
db.users.insert({
    "companyId":"shawScott",
    "tableColumnCopy":{"name":"Name","orderId":"Order Number","parkingSpotNum":"Parking Spot Number","carDescription":"Car Description","jobStatus":"Job Status"},
    "tableColumnIds":["name","orderId","parkingSpotNum","carDescription","jobStatus"],
    "maxUsers":"5"
})