const request = require("supertest");
const app = require("../index");
const db = require('../src/models');

afterAll(async () => {
  await db.sequelize.sync({ force: true })
});

describe("POST /api/urlshort/submit", () => {  
  
  //Negative Test
  it("should return a 400 err with Invalid URL message for the given long URL", async () => {

    const res = await request(app).post("/api/urlshort/submit")
                      .send({
                          originalURL: 'test-1',
                          desiredShortCode: ''
                      });

    expect(res.statusCode).toEqual(400);    
    expect(res.body.msg).toEqual("Invalid URL.");
    
    return;
  });

  //Happy Path
  it("should return a exact 6 character short code for the given long URL", async () => {

    const res = await request(app).post("/api/urlshort/submit")
                      .send({
                          originalURL: 'https://www.google-test-1.com/',
                          desiredShortCode: ''
                      });

    expect(res.statusCode).toEqual(201);    
    expect(res.body).toMatch(/^[a-z0-9]+$/gi);
    expect(res.body).toHaveLength(6);    
    return;
  });

  //Negative Test
  it("should return a 400 err with Invalid URL message for the given long URL and desired ShortCode", async () => {

    const res = await request(app).post("/api/urlshort/submit")
                      .send({
                          originalURL: 'test-2',
                          desiredShortCode: 'MyTest2'
                      });

    expect(res.statusCode).toEqual(400);    
    expect(res.body.msg).toEqual("Invalid URL.");    
    return;
  });

  // Negative Test
  it("should return a 400 err with message ... atleast 4 characters ... for the given long URL and desired ShortCode", async () => {

      const res = await request(app).post("/api/urlshort/submit")
                        .send({
                            originalURL: 'https://www.google-test-2.com/',
                            desiredShortCode: 'My3'
                        });

      expect(res.statusCode).toEqual(400);    
      expect(res.body.msg).toEqual("Desired Short Code should be atleast 4 characters long.");
    return;
  });

  // Negative Test 
  it("should return a 400 err with message ... no special characters ... for the given long URL and desired ShortCode", async () => {

      const res = await request(app).post("/api/urlshort/submit")
                        .send({
                            originalURL: 'https://www.google-test-3.com/',
                            desiredShortCode: 'MyS3@rch'
                        });
  
      expect(res.statusCode).toEqual(400);    
      expect(res.body.msg).toEqual("Special characters not allowed in Desired Short Code.");
    return;
  });

  // Happy Path
  it("should return the requested custom code after creating a short code for the given long URL and desired ShortCode", async () => {

    const res = await request(app).post("/api/urlshort/submit")
                      .send({
                          originalURL: 'https://www.google.com/',
                          desiredShortCode: 'MySearch'
                      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual("MySearch");
    return;
  });
    
  // Negative Test 
  it("should return a 400 err with message ... desired code is taken ... for the given long URL and desired ShortCode", async () => {
      
      await request(app).post("/api/urlshort/submit")
                      .send({
                          originalURL: 'https://www.google.com/',
                          desiredShortCode: 'MySearch'
                      });

      const res = await request(app).post("/api/urlshort/submit")
                        .send({
                            originalURL: 'https://www.google-test-4.com/',
                            desiredShortCode: 'MySearch'
                        });

      expect(res.statusCode).toEqual(400);    
      expect(res.body.msg).toEqual("Desired Short Code is taken. Please try a new one.");
    return;
  });

});



describe("GET /api/urlshort/:shortcode", () => {  
  
  // Negative Test 
  it("should get 400 err Invalid Code for system generated code", async () => {

    const response = await request(app).post("/api/urlshort/submit")
                      .send({
                          originalURL: 'http://www.amazon.com',
                          desiredShortCode: ''
                      });
    const shortCode = 'y2X22Test';

    const res = await request(app).get("/api/urlshort/" + shortCode)
    
    expect(res.statusCode).toEqual(400);        
    expect(res.body.msg).toEqual("Invalid Code.");
    return;
  })

  // Negative Test 
  it("should get 400 err Invalid Code for user generated code", async () => {

    const response = await request(app).post("/api/urlshort/submit")
                      .send({
                          originalURL: 'http://www.amazon.com',
                          desiredShortCode: 'ecommerce'
                      });

    const res = await request(app).get("/api/urlshort/ecrce")
    
    expect(res.statusCode).toEqual(400);        
    expect(res.body.msg).toEqual("Invalid Code.");
    return;
  })

  //Happy Path
  it("should redirect to original url for system generated code", async () => {

    const response = await request(app).post("/api/urlshort/submit")
                      .send({
                          originalURL: 'https://www.amazon.com/',
                          desiredShortCode: ''
                      });
    const shortCode = response.body;

    const res = await request(app).get("/api/urlshort/" + shortCode)
    
    expect(res.statusCode).toEqual(302);        
    return;
  })
  
  //Happy Path
  it("should redirect to original url for user generated code", async () => {

    const response = await request(app).post("/api/urlshort/submit")
                      .send({
                          originalURL: 'https://www.amazon.com/',
                          desiredShortCode: 'ecommerce'
                      });
    
    const res = await request(app).get("/api/urlshort/ecommerce")
    
    expect(res.statusCode).toEqual(302);        
    return;
  })
  
});


describe("GET /api/urlshort/:shortcode/stats", () => {

  // Negative Test 
  it("should get 400 err Invalid Code for system generated code", async () => {

    const response = await request(app).post("/api/urlshort/submit")
                      .send({
                          originalURL: 'http://www.amazon.com',
                          desiredShortCode: ''
                      });
    const shortCode = 'y2KTest';

    const res = await request(app).get(`/api/urlshort/${shortCode}/stats`);
        
    expect(res.statusCode).toEqual(400);        
    expect(res.body.msg).toEqual("Invalid Code.");
    return;
  })

  // Negative Test 
  it("should get 400 err Invalid Code for user generated code", async () => {

      const response = await request(app).post("/api/urlshort/submit")
                        .send({
                            originalURL: 'http://www.amazon.com',
                            desiredShortCode: 'mytest'
                        });
      const shortCode = 'my2KTest';
  
      const res = await request(app).get(`/api/urlshort/${shortCode}/stats`);
          
      expect(res.statusCode).toEqual(400);        
      expect(res.body.msg).toEqual("Invalid Code.");
      return;
  })
    
  //Happy Path
  it("should get the stats for the given system generated shortcode", async () => {

    //Arrange
    const response = await request(app).post("/api/urlshort/submit")
                      .send({
                          originalURL: 'https://www.amazon.com/',
                          desiredShortCode: ''
                      });
    const shortCode = response.body;
    await request(app).get("/api/urlshort/" + shortCode);
    await request(app).get("/api/urlshort/" + shortCode);

    //Act
    const res = await request(app).get(`/api/urlshort/${shortCode}/stats`);

    //Assert
    expect(res.statusCode).toBe(200);       
    expect(res.body).toHaveProperty('RegisteredOn');
    expect(res.body).toHaveProperty('AccessCount');
    expect(res.body).toHaveProperty('LastAccessedOn');  
    expect(res.body.AccessCount).toEqual(2);     
    return;
  })

  //Happy Path
  it("should get the stats for the given user generated shortcode", async () => {

    //Arrange
    const response = await request(app).post("/api/urlshort/submit")
                      .send({
                          originalURL: 'https://www.amazon.com/',
                          desiredShortCode: 'epay'
                      });    
    await request(app).get("/api/urlshort/epay");
    await request(app).get("/api/urlshort/epay");

    //Act
    const res = await request(app).get(`/api/urlshort/epay/stats`);

    //Assert
    expect(res.statusCode).toBe(200);       
    expect(res.body).toHaveProperty('RegisteredOn');
    expect(res.body).toHaveProperty('AccessCount');
    expect(res.body).toHaveProperty('LastAccessedOn');  
    expect(res.body.AccessCount).toEqual(2);     
    return;
  })

});
