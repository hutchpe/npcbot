const jsonfile = require('jsonfile')
const fileLoc = `${__dirname}/../storage.json`

const readFromFile = async () => {
  return await jsonfile.readFile(fileLoc)
    .then(obj => {return obj})
    .catch(e => console.log(e))
}

const writeToFile = async newData => {
  return await jsonfile.writeFile(fileLoc, newData)
    .then(res => {return true})
    .catch(e => console.log(e))
}

module.exports = {
  readFromFile,
  writeToFile
}