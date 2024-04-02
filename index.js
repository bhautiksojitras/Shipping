const express = require('express');
const axios = require('axios')
const app = express();
const cors = require('cors')
app.use(cors());
app.use(express.json());


const fs = require('fs')

const auth =(req,res,next)=>{
    const authHeader = req.headers['x-auth-token'];
    if(authHeader == '12fdAEI0nd' ){
        next()
}
else{
    res.status(400).json({
        messages:'Authorization Error',
        type:'ERROR'
    })
}
}

const client_id ='';
const client_secreat='';
const provider_id ='';
app.get('/app/auth',  async (req,res)=>{

    fs.writeFileSync('auth.json',JSON.stringify(req.query))
    res.send(200).send('OK')
    const requestBody = {
           client_id: client_id,
           client_secret: client_secreat,
           code: req.query.code,
           context: req.query.context,
           scope: req.query.scope,
           grant_type: 'authorization_code',
           redirect_uri: req.url,
    };

const data = await axios.post('https://login.bigcommerce.com/oauth2/token', requestBody, {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})
fs.writeFileSync('./token.json',JSON.stringify(data.data))



})

app.get('/app/load',(req,res)=>{
    res.status(200).sendFile((__dirname +'/index.html'))
})


app.put('/update_connection',async (req,res)=>{
  const {access_token,context} = require('./token.json');
  const requestData = {
    username: 'MyTaxProviderAccount',
    password: 'h6eSgKLN72q7jYTW',
    profile: 'test-profile'
  };
  
  const config = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Auth-Token': access_token,
    }
  };
  
 await axios.put(`https://api.bigcommerce.com/${context}/v3/tax/providers/${provider_id}/connection`, requestData, config)
 res.status(200).send('ok')

})

app.post('/check_connection_options',(req,res)=>{

    res.status(200).json(
        {
            "valid": true,
            "messages": [
              {
                "text": "test",
                "type": "INFO"
              }
            ]
          }
    )
})

app.post('/rate',(req,res)=>{

    res.status(200).json(
        {
            "quote_id": "Test_123",
            "messages": [
              {
                "text": "This is a test message",
                "type": "INFO"
              }
            ],
            "carrier_quotes": [
              {
                "quotes": [
                  {
                    "code": "GND_001",
                    "display_name": "Express Shipping",
                    "cost": {
                      "currency": "USD",
                      "amount": 100.0
                    },
                    "messages": [
                      {
                        "text": "No additional notes",
                        "type": "INFO"
                      }
                    ],
                    "description": "Fast delivery",
                    "rate_id": "Rate_001",
                    "discounted_cost": {
                      "currency": "USD",
                      "amount": 90.0
                    },
                    "dispatch_date": new Date((new Date()).valueOf() + (3 * 24 *3600*1000)).toISOString(),
                    "transit_time": {
                      "units": "DAYS",
                      "duration": 3
                    }
                  },
                  {
                    "code": "GND_002",
                    "display_name": "Standard Shipping",
                    "cost": {
                      "currency": "USD",
                      "amount": 50.0
                    },
                    "messages": [
                      {
                        "text": "Delivery may take longer than express",
                        "type": "WARNING"
                      }
                    ],
                    "description": "Reliable delivery",
                    "rate_id": "Rate_002",
                    "discounted_cost": {
                      "currency": "USD",
                      "amount": 45.0
                    },
                    "dispatch_date": new Date((new Date()).valueOf() + (3 * 24 *3600*1000)).toISOString(),
                    "transit_time": {
                      "units": "DAYS",
                      "duration": 5
                    }
                  }
                ],
                "carrier_info": {
                  "code": "Carrier_001",
                  "display_name": "FastShipping Inc."
                }
              },
              
            ]
          }
          
    )
})

app.post('/estimate', (req, res) => {
  // Extracting relevant data from the request body
  const { id, documents } = req.body;

  const response = {
      id: id,  
      documents: documents.map(document => {
          const { id, items, shipping, handling } = document;
          return {
              id: id , 
              items: items.map(item => {
                  
                  const { id, price, type, wrapping } = item;
                  return {
                      id: id , 
                      price: {
                          amount_inclusive: price.amount + (price.amount * 0.5), 
                          amount_exclusive: price.amount, 
                          total_tax: price.amount * 0.5, 
                          tax_rate:  0.5, 
                          sales_tax_summary:[{ 
                              name: "Brutal Tax",
                              rate: 0.5,
                              amount:  price.amount * 0.5,
                              tax_class: {
                                  class_id: "0",
                                  name: "Brutal Tax",
                                  code: "US"
                              },
                              id: "Brutal Tax"
                          }]
                      },
                      type,
                      wrapping:  { // Default wrapping if not provided
                          id: wrapping.id,
                          price: {
                              amount_exclusive: 5,
                              amount_inclusive: 7.5,
                              sales_tax_summary: [
                                  {
                                      amount: 2.5,
                                      id: "1",
                                      name: "BRUTAL TAX",
                                      rate: 0.5,
                                      tax_class: {
                                          class_id: "6",
                                          code: "US",
                                          name: "Wrapping"
                                      }
                                  }
                              ],
                              tax_rate: 0.5,
                              total_tax: 2.5
                          },
                          type: "wrapping"
                      }
                  };
              }),
              shipping: { // Default shipping if not provided
                  id: shipping.id,
                  price: {
                      amount_inclusive: 15,
                      amount_exclusive: 10,
                      total_tax: 5,
                      tax_rate: 0.5,
                      sales_tax_summary: [
                          {
                              name: "Brutal Tax",
                              rate: 0.5,
                              amount: 5,
                              tax_class: {
                                  class_id: "0",
                                  name: "Brutal Tax",
                                  code: "US"
                              },
                              id: "Brutal Tax"
                          }
                      ]
                  },
                  type: "shipping"
              },
              handling:  { // Default handling if not provided
                  id: handling.id,
                  price: {
                      amount_inclusive: 0,
                      amount_exclusive: 0,
                      total_tax: 0,
                      tax_rate: 0.5,
                      sales_tax_summary: [
                          {
                              name: "Brutal Tax",
                              rate: 0.5,
                              amount: 0,
                              tax_class: {
                                  class_id: "0",
                                  name: "Brutal Tax",
                                  code: "US"
                              },
                              id: "Brutal Tax"
                          }
                      ]
                  },
                  type: "handling"
              }
          };
      })
  };

  // Sending the response
  res.json(response);
});

app.post('/void',(req,res)=>{
  res.status(200).send('OK')
})

app.post('/commit', (req, res) => {
  const { id, documents } = req.body;
  const response = {
      id: id , 
      documents: documents.map(document => {
          const { id, items, shipping, handling } = document;
          return {
              external_id: "123456789"+  Math.floor( Math.random()*1000), // Static external ID
              id, 
              items: items.map(item => {
                  
                  const { id, price, type, wrapping } = item;
                  return {
                      id, // Reusing the ID from the request body
                      price: {
                          amount_inclusive: price.amount + price.amount * 0.5,
                          amount_exclusive: price.amount,
                          total_tax:  price.amount * 0.5,
                          tax_rate:  0.5, 
                          sales_tax_summary:  [{ // Default sales tax summary
                              name: "Brutal Tax",
                              rate: 0.5,
                              amount: price.amount * 0.5,
                              tax_class: {
                                  class_id: "0",
                                  name: "Brutal Tax",
                                  code: "US"
                              },
                              id: "Brutal Tax"
                          }]
                      },
                      type,
                      wrapping: { 
                          id: wrapping.id,
                          price: {
                              amount_exclusive: 5,
                              amount_inclusive: 7.5,
                              sales_tax_summary: [
                                  {
                                      amount: 2.5,
                                      id: "1",
                                      name: "BRUTAL TAX",
                                      rate: 0.5,
                                      tax_class: {
                                          class_id: "6",
                                          code: "US",
                                          name: "Wrapping"
                                      }
                                  }
                              ],
                              tax_rate: 0.5,
                              total_tax: 2.5
                          },
                          type: "wrapping"
                      }
                  };
              }),
              shipping: { 
                  id: shipping.id,
                  price: {
                      amount_inclusive: 15,
                      amount_exclusive: 10,
                      total_tax: 5,
                      tax_rate: 0.5,
                      sales_tax_summary: [
                          {
                              name: "Brutal Tax",
                              rate: 0.5,
                              amount: 5,
                              tax_class: {
                                  class_id: "0",
                                  name: "Brutal Tax",
                                  code: "US"
                              },
                              id: "Brutal Tax"
                          }
                      ]
                  },
                  type: "shipping"
              },
              handling:  {
                  id: handling.id,
                  price: {
                      amount_inclusive: 0,
                      amount_exclusive: 0,
                      total_tax: 0,
                      tax_rate: 0.5,
                      sales_tax_summary: [
                          {
                              name: "Brutal Tax",
                              rate: 0.5,
                              amount: 0,
                              tax_class: {
                                  class_id: "0",
                                  name: "Brutal Tax",
                                  code: "US"
                              },
                              id: "Brutal Tax"
                          }
                      ]
                  },
                  type: "handling"
              }
          };
      })
  };

  res.json(response);
});

app.post('/adjust', (req, res) => {
  const { id, documents } = req.body;

  const response = {
      documents: documents.map(document => {
          const { id, items, shipping, handling } = document;
          return {
              id,
              items: items.map(item => {
                  const { id, price, type, wrapping } = item;
                  return {
                      id,
                      price: {
                          amount_inclusive: price.amount +  price.amount * 0.5,
                          amount_exclusive: price.amount,
                          total_tax:  price.amount * 0.5,
                          tax_rate:  0.5, // Default tax rate
                          sales_tax_summary:  [{ // Default sales tax summary
                              name: "Brutal Tax",
                              rate: 0.5,
                              amount: price.total_tax || (price.amount_inclusive - price.amount_exclusive),
                              tax_class: {
                                  class_id: "0",
                                  name: "Brutal Tax",
                                  code: "US"
                              },
                              id: "Brutal Tax"
                          }]
                      },
                      type,
                      wrapping:  { // Default wrapping if not provided
                          id: wrapping.id,
                          price: {
                              amount_exclusive: 5,
                              amount_inclusive: 7.5,
                              sales_tax_summary: [
                                  {
                                      amount: 2.5,
                                      id: "1",
                                      name: "BRUTAL TAX",
                                      rate: 0.5,
                                      tax_class: {
                                          class_id: "6",
                                          code: "US",
                                          name: "Wrapping"
                                      }
                                  }
                              ],
                              tax_rate: 0.5,
                              total_tax: 2.5
                          },
                          type: "wrapping"
                      }
                  };
              }),
              shipping: { // Default shipping if not provided
                  id: shipping.id,
                  price: {
                      amount_inclusive: 15,
                      amount_exclusive: 10,
                      total_tax: 5,
                      tax_rate: 0.5,
                      sales_tax_summary: [
                          {
                              name: "Brutal Tax",
                              rate: 0.5,
                              amount: 5,
                              tax_class: {
                                  class_id: "0",
                                  name: "Brutal Tax",
                                  code: "US"
                              },
                              id: "Brutal Tax"
                          }
                      ]
                  },
                  type: "shipping"
              },
              handling:  { 
                  id: handling.id,
                  price: {
                      amount_inclusive: 0,
                      amount_exclusive: 0,
                      total_tax: 0,
                      tax_rate: 0.5,
                      sales_tax_summary: [
                          {
                              name: "Brutal Tax",
                              rate: 0.5,
                              amount: 0,
                              tax_class: {
                                  class_id: "0",
                                  name: "Brutal Tax",
                                  code: "US"
                              },
                              id: "Brutal Tax"
                          }
                      ]
                  },
                  type: "handling"
              }
          };
      }),
      id: id  
  };

  // Sending the response
  res.json(response);
});



app.listen(8081,()=>{
    console.log('app listing on 8081')
})