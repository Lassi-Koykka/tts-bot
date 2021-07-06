const Discord = require('discord.js');
const fs = require('fs');
const util = require('util');
const path = require('path');
const play = require('./play')
const gTTS = require('gtts');


const promisifiedPlay = util.promisify(play)

const client = new Discord.Client();

const commandsList = ["help - Get info about all available commands", "say [text] - Say the text out loud", "[clip name] - Play a specific audio clip", "saveclip [clip name] [text] - ADMIN ONLY Save a new audio clip", "deleteclip [clip name] - ADMIN ONLY Delete audio clip"]

const audioDir = path.join(__dirname, 'audio');
//Create dir for audio directory if it doesn't already exist;
if(!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir);
    console.log(`Audio directory did not exist so one was created at: ${audioDir}\n`+ 
    "Add the audioFiles you want available there.")
} 
let files = fs.readdirSync(audioDir).map(file => { return file.split('.')[0] })

const { prefix, token, adminID } = require('./config.json');

client.once('ready', async () => console.log('Ready!'));

client.login(token);

client.on('message', async message => {
    
    //If the message doesn't start with a prefix, is sent by a bot, or is a direct message.
    if (!message.content.startsWith(prefix)
        || message.author.bot
        || message.channel.type != 'text') return;

    //Get arguments after prefix
    const args = message.content.slice(prefix.length).trim().split(/ +/);

    //Get the first argument as command
    const commandName = args.shift().toLowerCase();
    const filePath = path.join(audioDir, commandName + '.mp3')

    // HELP: List available commands
    // Or play the file with the same name as the command if it exists
    if (commandName === 'help') {
        let commandStr = "***Available commands:***\n``" + commandsList.join("\n") + "``";
        message.channel.send(commandStr);
        if(files.length > 0) {
            let clipStr = "***Available clips:***\n``" + files.join("\n") + "``";
            message.channel.send(clipStr);
        }

    } else if (commandName === 'say' && (!message.guild.voice || !message.guild.voice.connection)) {

        const text = message.content
        .slice(prefix.length).trim()
        .slice(commandName.length).trim()

        var gtts = new gTTS(text, 'fi');

        var tempFilePath = path.join(__dirname, "audio", "temp.mp3");

        gtts.save(tempFilePath, (err) => {
            if (err) console.log(err) 
            else {
                const vc = message.member.voice.channel;
                const promisifiedPlay = util.promisify(play)

                promisifiedPlay(tempFilePath, vc).then(() => {
                    fs.rmSync(tempFilePath);
                });
            } 
        })

    } else if (commandName === 'saveclip' && args.length > 1 && message.author.id === adminID) {
        const newFileName = args.shift().toLowerCase()     
        const text = message.content
        .slice(prefix.length).trim()
        .slice(commandName.length).trim()
        .slice(newFileName.length).trim();
        console.log("Saving clip. Text: " + text)

        var gtts = new gTTS(text, 'fi');

        gtts.save(path.join(__dirname, "audio", newFileName + ".mp3"), (err) => {
            if (err) console.log(err) 
            else {
                message.channel.send("New text-to-speech audioclip saved: " + newFileName)
                files = fs.readdirSync(audioDir).map(file => { return file.split('.')[0] })
            } 
        })

    } else if (commandName === 'deleteclip' && args.length === 1 && message.author.id === adminID) {
        const fileName = args.shift().toLowerCase()
        const deletePath = path.join(__dirname, "audio", fileName + ".mp3");
        if(fs.existsSync(deletePath)) {
            console.log("Deleting: " + deletePath)
            fs.rmSync(deletePath);
            message.channel.send("Audio clip \"" + fileName + "\" deleted!")
            files = fs.readdirSync(audioDir).map(file => { return file.split('.')[0] })
        }

    } else if (files.includes(commandName) && fs.existsSync(filePath) && (!message.guild.voice || !message.guild.voice.connection)){
        const vc = message.member.voice.channel;
        play(filePath, vc);
    }
    
})    

