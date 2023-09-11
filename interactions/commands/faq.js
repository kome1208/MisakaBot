const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('faq')
		.setDescription('misaka faq')
		.addStringOption(option =>
			option.setName('title')
			.setDescription('faq you want to see')
			.setAutocomplete(true)
			.setRequired(true)
		)
		.addUserOption(option =>
			option.setName('target')
			.setDescription('select the member you want to mention')
		),
	async execute(interaction) {
		await interaction.deferReply();
		const { data } = await axios.get('https://raw.githubusercontent.com/shimajiron/Misaka_Network/main/FAQ.json');
		const faq = data.find((element) => element.link === interaction.options.getString('title'));
		const faq_ids = faq?.link?.split('/');
		if (!faq || interaction.guildId !== faq_ids.at(-3)) return interaction.editReply({ content: 'invalid data' });
		const user = interaction.options.getUser('target');
		const faq_channel = await interaction.guild.channels.fetch(faq_ids.at(-2));
		const faq_message = await faq_channel.messages.fetch(faq_ids.at(-1));
		const embed = new EmbedBuilder()
		.setTitle(faq.title)
		.setURL(faq.link)
		.setDescription(faq_message.content || null)
		.setImage(faq_message?.attachments?.filter((file) => file?.contentType?.startsWith('image'))?.first()?.url || null)
		.setColor('Random');
		await interaction.editReply({ content: user ? `${user}, please read this!` : null, embeds: [embed] });
    }
}