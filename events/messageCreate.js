const axios = require('axios');
const { tweakEmbed } = require('../utils/embedGenerator.js');
const { Message, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
	name: 'messageCreate',
    /**
     * 
     * @param {Message} message 
     */
	async execute(message) {
		if (message.content.match(/\[\[([\w\s-]+)]]/)) {
            const matches = message.content.match(/\[\[(?<query>[\w\s-]+)]]/);
            if (matches.groups.query.length < 2) return;
            await message.channel.sendTyping();
            const { data } = await axios.get(`https://misaka-search-ydkr.koyeb.app/api/v1/tweaks/search?q=${encodeURIComponent(matches.groups.query)}&limit=25`);
            if (data.tweaks.length == 0) return message.reply({ content: 'No tweak found.'});
            const embeds = data.tweaks.slice(0,25).map((pkg) => {
                return tweakEmbed(pkg);
            })
            const options = embeds.map((embed, i) => ({label:`${embed.data.title.slice(0, 99)}`, value:`${i}`}));
            const menu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                .setCustomId('select_tweak')
                .setPlaceholder('Select Tweak')
                .addOptions(options)
            );
            const reply = await message.reply({
                embeds:[embeds[0]],
                components:[menu]
            });
            const filter = ({customId, user}) => {
                return customId === 'select_tweak' && user.id === message.author.id;
            };
            const collector = reply.createMessageComponentCollector({filter, time:900000});
            collector.on('collect', async (interaction) => {
                await interaction.update({
                    embeds:[embeds[interaction.values[0]]]
                });
            })
            .on('end', async () => {});
        }
	}
};