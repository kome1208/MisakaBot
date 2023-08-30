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
		const faq_id = interaction.options.getString('title');
		const user = interaction.options.getUser('target');
		const faq_channel = await interaction.guild.channels.fetch('1136675951997104270');
		const faq_thread = await faq_channel.threads.fetch(faq_id);
		const faq_message = await faq_thread.messages.fetch(data[faq_id].content_id);
		const embed = new EmbedBuilder()
		.setTitle(faq_thread.name)
		.setURL(faq_thread.url)
		.setDescription(faq_message.content || null)
		.setColor('Random');
		await interaction.editReply({ content: user ? `${user}, please read this!` : null, embeds: [embed] });
    }
}