const Discord = require('discord.js')
const path = require('path')

/**
 * @param {string} fileName
 * @param {Discord.VoiceChannel} vc
 */
const play = (fileName, vc) => {
    if (vc) {
        fileBaseName = path.basename(fileName);
        console.log("FILENAME", fileName)
        try {     
            vc.join().then(connection => {
                const dispatcher = connection.play(fileName);
    
                dispatcher.on('start', () => {
                    console.log(fileBaseName + ' is now playing!');
                });
    
                console.log(fileBaseName + ' has finished playing!');
                dispatcher.on('finish', () => {
                    vc.leave();
                });
    
                // Always remember to handle errors appropriately!
                dispatcher.on('error', (error) => {
                    console.log(error);
                });
    
            });
        } catch (error) {
            console.log(error)
            vc.leave()
        }
    } else {
        message.reply('You need to join a voice channel first!');
    }
}

module.exports = play;
