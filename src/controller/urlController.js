const urlModel = require("../models/urlModel");
const mongoose = require('mongoose');
const shortid = require('shortid');
const { default: validator } = require("validator");
const validUrl = require('valid-url');
const validate = require("../validations/validate")
const { urlRegex } = require("../validations/validate")
const redis = require("redis");
const { promisify } = require("util");

//Connection to Redis
const redisClient = redis.createClient({ host: 'redis-11742.c212.ap-south-1-1.ec2.cloud.redislabs.com', port: 11742, username: 'atif-free-db', password: '42XcKyM1AM90MiLuBznfu58ENBJ5AEEw' });

//Successful connection to redis
redisClient.on('connect', () => {
    console.log('connected to redis successfully!');
})

//unsuccesfull connection to redis
redisClient.on('error', (error) => {
    console.log('Redis connection error :', error);
})

//Connection setup for redis
const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


const shorten = async function (req, res) {
    try {
        let host = "http:localhost:3000";
        const data = req.body;
        let longUrl = data.longUrl;
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "Please provide data" })
        };
        if (Object.keys(longUrl).length == 0) {
            return res.status(400).send({ status: false, msg: "Please provide longUrl" })
        };
        if(!urlRegex(longUrl)){
            return res
            .status(400)
            .send({ status: false, message: "Url is not valid!!" })}

        let isValidUrl= await urlModel.findOne({longUrl})
        if(isValidUrl ){
          return  res.status(400).send({status: false, message: "longUrl is alredy present"})
        }
        //checking base url

        if (!validUrl.isUri(longUrl)) {
            return res
                .status(401)
                .send({ status: false, msg: "Invalid url" });
        }
        else {
            const urlCode = shortid.generate();
            const shortUrl = host + '/' + urlCode;
            data.urlCode = urlCode;
            data.shortUrl = shortUrl;


            let datafull = {
                urlCode: urlCode,
                shortUrl: shortUrl,
                longUrl: longUrl
            };

            const createdURL = await urlModel.create(datafull);
            return res
                .status(200)
                .send({ status: true, data: data });

        }
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}

const getUrl = async function (req, res) {
    try {
      let urlCode = req.params.urlCode.trim();

      let cahcedUrlCode = await GET_ASYNC(`${urlCode}`)

      if (cahcedUrlCode) {

          return res.status(200).redirect(JSON.parse(cahcedUrlCode))

      }
      else {
        const url = await urlModel.findOne({
            urlCode: urlCode
        }).select({ longUrl: 1, urlCode: 1, shortUrl: 1, _id: 0 });
        if (!url) {
            return res.status(404).send({ status: false, message: "No URL found" })
        }
        else {
            let seturl=url.longUrl
            await SET_ASYNC(`${seturl}`, JSON.stringify(url))
            return res.status(302).redirect(seturl)
        }
    }
}

catch (error) {
    return res.status(500).send({ status: false, Message: error.message });
}
};

module.exports={getUrl, shorten};