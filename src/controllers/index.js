const validate = require("validate.js");
const { nanoid, customAlphabet } = require('nanoid')
const { alphanumeric, lowercase } = require('nanoid-dictionary');

const db = require('../models');
const ShortURL = db.ShortURL;
const CustomCode = db.CustomCode;
const isAlphaNumeric = str => /^[a-z0-9]+$/gi.test(str);

async function getValidShortCode(shortenedCode){

    let result = await CustomCode.findAll({ 
        attributes: ['shortCode'],
        where: { customCode: shortenedCode } 
    });        

    if(result.length != 0)
        shortenedCode = result[0].dataValues.shortCode;
    else {
        // check in auto short code
        const shortCodeCount = await ShortURL.count({ where: { shortCode: shortenedCode } });           
        if (shortCodeCount == 0){ 
            shortenedCode = 0;                        
        } // else we have right shorten code supplied by user
    } 

    return shortenedCode;
}

module.exports.GetShortCodeStats = async (req, res) => {
    try{
        let shortenedCode = req.params.shortcode;       
        shortenedCode = await getValidShortCode(shortenedCode);
        if(shortenedCode == 0)
            return res.status(400).send({ msg: "Invalid Code." });

        result = await ShortURL.findAll({ 
            attributes: ['createdAt', 'lastRequestedOn' ,'clickCount'],
            where: { shortCode: shortenedCode } 
        });     

        if(result.length != 0)        
            res.status(200).json({ 
                RegisteredOn: result[0].dataValues.createdAt, 
                LastAccessedOn: result[0].dataValues.lastRequestedOn, 
                AccessCount: result[0].dataValues.clickCount 
            })               
               
    } catch(ex) {
        throw ex;
    }    
}

module.exports.RedirectToWebsite = async (req, res) => {

    try{
        let shortenedCode = req.params.shortcode;       
        shortenedCode = await getValidShortCode(shortenedCode);
        if(shortenedCode == 0)
            return res.status(400).send({ msg: "Invalid Code." });

        // Stats        
        await ShortURL.increment('clickCount', {by: 1,  where: { shortCode: shortenedCode }})
        await ShortURL.update({ lastRequestedOn: new Date() }, { where: {shortCode: shortenedCode }});
                
        result = await ShortURL.findAll({ 
            attributes: ['longURL'],
            where: { shortCode: shortenedCode } 
        });     

        res.redirect(302, result[0].dataValues.longURL);
        
    } catch(ex) {
        throw ex;
    }    
}

module.exports.CreateShortURLCode = async (req, res) => {

    try{
        
        const { originalURL, desiredShortCode } = req.body;       
        let isValidDesiredShortCode = false;

        // Check and Validate Original URL
        if (validate({ website: originalURL }, {  website: { url: { allowLocal: true }}}))
          return res.status(400).send({ msg: "Invalid URL." });

        // Check and Validate Desired Short Code
        if (desiredShortCode) {

            if(desiredShortCode.length < 4)
                return res.status(400).send({ msg: "Desired Short Code should be atleast 4 characters long."});

            // check for special characters
            if(!isAlphaNumeric(desiredShortCode))
                return res.status(400).send({ msg: "Special characters not allowed in Desired Short Code."});

            // check availability        
            const desiredCodeCount = await CustomCode.count({ where: { customCode: desiredShortCode } })            
            if (desiredCodeCount > 0)           
                return res.status(400).send({ msg: "Desired Short Code is taken. Please try a new one."});         
            
            isValidDesiredShortCode = true;
        }                     
        
        const shortenedCode = customAlphabet(alphanumeric, 6)();        
        const shortenedURL = process.env.BASE_URL + '/' + shortenedCode;

        const shortURL = {
            shortCode: shortenedCode,
            longURL: originalURL,
            shortURL: shortenedURL
        }     

        // Original URL already exist ?
        const originalURLCount = await ShortURL.count({ where: { longURL: originalURL } })            
        if (originalURLCount > 0) {
            const result = await ShortURL.destroy({ where: { longURL: originalURL } });
        }
        
        ShortURL.create(shortURL).then(created => { 
            if(isValidDesiredShortCode){                          
                const customCode = {
                    customCode: desiredShortCode,
                    shortCode: shortenedCode
                }

                CustomCode.create(customCode).then(associted => {
                    res.status(201).json(desiredShortCode);                
                })
            }
            else{
                res.status(201).json(shortenedCode);                
            }
        })               
    } catch(ex) {
        throw ex;
    }
}
