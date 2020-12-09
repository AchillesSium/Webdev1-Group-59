# Group 

Member1:  Mohammad Aqib Hassan, mohammad.hassan@tuni.fi, 050457535 
Resposible for:  
- Connect front-end and back-end
- Implement Es-lint and funtional programming rules
- Handle API calls

Member2:  Talha Manj, talha.manj@tuni.fi, 050365148
Resposible for: 
- Create entity models(order, product, user)
- Implement Heroku 
- Create own test



# WebDev1 coursework assignment

A web shop with vanilla HTML, CSS.


### The project structure

```
.
├── index.js                --> Receive client requests
├── package.json            --> Build file that contains testing and debuging scripts
├── routes.js               --> Route all requests for client
├── auth                    --> Contains authentication related files
│   └──  auth.js            --> Authenticate current user
├── controllers             --> Contains all the controller files for models
│   ├── orders.js           --> Controller to communicate with order model
│   ├── products.js         --> Controller to communicate with product model
│   └── users.js            --> Controller to communicate with user model
├── models                  --> All models for database
│   ├── db.js               --> Database model
│   ├── oder.js             --> Order model
│   ├── product.js          --> Product model
│   └── user.js             --> User model     
│                               
├── public                  --> Contains all the public files for clients
│   ├── img                 --> All diagram images
│   ├── css                 --> Project's css files
│   │    └── styles.css     --> Contains CSS that are used in the project                
│   └── js                  --> Necessary scripts for html files
│       ├── addProduct.js   --> Script for addProduct.html
│       ├── adminUsers.js   --> Script for users.html
│       ├── cart.js         --> Script for cart.html
│       ├── products.js     --> Script for products.html
│       ├── register.js     --> Script for register.html
│       └── utils.css       --> All other unitility functions
├── setup                   --> Contains files for database           
│   ├── create-orders.js    --> Script for creating orders
│   ├── products.json       --> Json file for used products
│   ├── reset-db.js         --> File that resets database
│   └── users.json          --> Primary users
├── utils                   --> All other unitility files       
│   ├── products.js         --> get products data                  
│   ├── render.js           --> Render public files  
|   ├── requestUtils.js     --> Handles client requests               
│   ├── responsetUtils.js   --> Handles server request
│   └── users.js            --> Save, update or retrive user data
└── test                    --> Contain all test files        
│   ├── auth                --> Aunthentication tests
│   ├── controllers         --> Controller tests
│   ├── own                 --> Our own tests
│   ├── utils               --> Request and response tests
│   ├── routes.test.js      --> Routing tests
│   ├── setup.test.js       --> Setup tests
└── └── ui.test.js          --> UI tests

## The architecture 

TODO: describe the system, important buzzwords include MVC and REST.
UML diagrams would be highly appreciated.

## Data Models

Model: Order
  Attributes:
    _id: String
    cutomerId: String
    items: Array[
      product:
        _id: String
        name: String
        price: Number
        description: String
      quantity: Number
    ]
  Description: Model to store orders from customers.
  Connections: Connected with product attributes.

Model: Product
  Attributes:
    _id: String
    name: String
    price: Number
    image: String
    description: String
  Description: Model to store products.
  Connections: Connected to order model.

Model: User
  Attributes:
    _id: String
    name: String
    role: String(customer or admin)
    email: String
    password: String(encrypted vith bcrypt)
  Description: All kind of user action model.
  Connections: Independent model.

## Tests and documentation

TODO: Links to at least 10 of your group's GitLab issues, and their associated Mocha tests and test files.

## Security concerns

TODO: list the security threats represented in the course slides.
Document how your application protects against the threats.
You are also free to add more security threats + protection here, if you will.

