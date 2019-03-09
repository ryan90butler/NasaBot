const Twit = require('twit')
const request = require('request')
const fs = require('fs')
const config = require('./config')
const path = require('path')

const bot = new Twit(config)

function getPhoto() {
  const parameters = {
    url: 'https://api.nasa.gov/planetary/apod',
    qs: {
      api_key: process.env.NASA_KEY
    },
    encoding: 'binary'
  }
  request.get(parameters, (err, response, body) => {
    body = JSON.parse(body)
    saveFile(body, 'nasa.jpg')
  })
}

function saveFile(body, fileName) {
  const file = fs.createWriteStream(fileName)
  request(body).pipe(file).on('close', err => {
    if (err) {
      console.log(err)
    } else {
      console.log('Media saved!')
      const explain = body.explanation.split(".")[0];
      const descriptionText = body.title + '\n' + '\n'+ explain +"." + '\n' + '\n' + " #NASA #space"
      uploadMedia(descriptionText, fileName)
    }
  })
}

function uploadMedia(descriptionText, fileName) {
  const filePath = path.join(__dirname, `../${fileName}`)
  console.log(`file PATH ${filePath}`)
  bot.postMediaChunked({
    file_path: filePath
  }, (err, data, response) => {
    if (err) {
      console.log(err)
    } else {
      console.log(data)
      const params = {
        status: descriptionText,
        media_ids: data.media_id_string
      }
      postStatus(params)
    }
  })
}

function postStatus(params) {
  bot.post('statuses/update', params, (err, data, response) => {
    if (err) {
      console.log(err)
    } else {
      console.log('Status posted!')
    }
  })
}

getPhoto()