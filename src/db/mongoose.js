if (typeof TextEncoder === 'undefined') {
    global.TextEncoder = require('util').TextEncoder;
    global.TextDecoder = require('util').TextDecoder;
}

const mongoose = require("mongoose")

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    autoIndex: true
})

