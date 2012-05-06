var zlib = require('zlib'),
    fs = require('fs'),
    out = fs.createWriteStream('out'),

// Fetch http://example.com/foo.zip, unzip it and store the results in 'out'
readStream = fs.createReadStream("source.zip");

  // This will wait until we know the readable stream is actually valid before piping
  readStream.on('open', function () {
    // This just pipes the read stream to the response object (which goes to the client)
    readStream.pipe(zlib.createUnzip()).pipe(out);
  });