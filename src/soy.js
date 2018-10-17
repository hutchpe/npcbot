const config = require('../config/production')
const file = require('./file')

const randomInt = (lower, upper) => {
  return Math.floor(Math.random() * (upper - lower)) + lower
}

const getTimeStamp = () => {
  return Math.round((new Date()).getTime() / 1000)
}

const isSoyTriggered = message => {
  let words = message.split(' ')
  return words.some(word =>
    config.triggers.some(trigger => trigger === word.toLowerCase())
  )
}

const generateSoy = () => {
  let soyRes = ['```cs\n'] // make this code
  let quip = config.messageLength.quips
  for (let i = 0; i < randomInt(quip.lower, quip.upper); i++) {
    soyRes.push(config.quips[randomInt(0, config.quips.length)])
  }
  soyRes.push('```') // finish code
  return soyRes.join('')
}

const querySoy = async name => {
  let storage = await file.readFromFile()
  let bigots = storage.bigots
  for (let i in bigots) {
    if (bigots[i].name === name) {
      return bigots[i]
    }
  }
  return null
}

const validateUser = async user => {
  let userId = user.id
  if (config.wrangledNibbas.some(nibba => nibba === userId)) { // fuck off jack
    console.log(`wrangled`)
    return false
  }

  let storage = await file.readFromFile()

  let nibba = storage.bigots[userId]
  if (!nibba) { // if we dont have this user, insert them
    storage.bigots[userId] = { bigotry: 1, cutoff: 0, name: user.username }
  } else {
    storage.bigots[userId].bigotry += 1
    storage.bigots[userId].name = user.username // reset name so if user changes their name we can still query them
  }

  if (storage.bigots[userId].cutoff > getTimeStamp()) {
    console.log(`spamming!`)
    return false
  }

  storage.bigots[userId].cutoff = getTimeStamp() + config.cooldownSeconds
  file.writeToFile(storage)

  return true
}

const runSoy = async msg => {
  let qcheck = msg.content.split(' ')
  if (qcheck[0] === '?bigot') {
    let query = qcheck.slice(1, qcheck.length).join(' ')
    let result = await querySoy(query)
    if (!result) {
      msg.reply(`They're not a bigot... but I'm always watching. Just like I watch Jamal take my wife.`)
      return
    }

    msg.reply(`${result.name} is a level ${result.bigotry} facist! PUNCH NAZIS`); 
    return
  }

  if (!isSoyTriggered(msg.content)) { // check if message is triggering
    return
  }

  let userValid = await validateUser(msg.author)
  if (!userValid) { // check if user is allowed to trigger 
    return
  }

  let count = config.messageLength.count
  for (let i = 0; i < randomInt(count.lower, count.upper); i++) { // i am soy incarnate
    msg.reply(generateSoy()); 
  }
}

module.exports = {
  runSoy
}
