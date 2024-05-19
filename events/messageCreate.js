const { Message, EmbedBuilder } = require('discord.js');
const tweakSearch = require('../utils/tweakSearch.js');

module.exports = {
	name: 'messageCreate',
    /**
     * 
     * @param {Message} message 
     */
	async execute(message) {
        let result;
		if (message.content.match(/\[\[([\w-._+ぁ-んァ-ヶｱ-ﾝﾞﾟ一-龠 ]+)]]/)) {
            tweakSearch.run(message);
        } else if (message.content.match(/\[(.*?)\]\((https?:\/\/(?!(?:www\.|cdn\.)?(?:discord\.com|discordapp\.com))[^\s]+)\)/)) {
            if (message.member.roles.cache.hasAll(['1156843198954618958', '1156843198954618956'])) return;
            const embed = new EmbedBuilder()
            .setDescription(`**${message.member.displayName}** has been timed out for 1h\n**Reason**: Sent a message containing a hyperlink`)
            .setFooter(`${message.member.user.username} | ${message.member.id}`);

            await message.member.timeout(3600000);
            await message.delete();
            await message.channel.send({ embeds: [ embed ] });
        }
        const MSGLINK_PATTERN = /http(?:s)?:\/\/(?:.*)?discord(?:app)?.com\/channels\/(?<guildId>\d+)\/(?<channelId>\d+)\/(?<messageId>\d+)/g;
        while ((result = MSGLINK_PATTERN.exec(message.content)) !== null) {
            const { guildId, channelId, messageId } = result.groups;
            if (message.guildId !== guildId) return;
            try {
                const channel = await message.client.channels.fetch(channelId);
                const msg = await channel.messages.fetch(messageId);
                const embed = new EmbedBuilder()
                .setAuthor({ name: msg.author.username, iconURL: msg.author.displayAvatarURL() })
                .setDescription(msg.content.slice(0, 4096) || null)
                .addFields(
                    { name: 'Original', value: `[CLICK TO JUMP](${msg.url})` }
                )
                .setTimestamp(msg.createdTimestamp);

                await message.reply({ embeds: [embed] });
            } catch (err) {
                console.log(err);
            }
        }
	}
};