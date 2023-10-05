const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('faq')
		.setDescription('misaka faq')
		.setDMPermission(false)
		.addSubcommand(command =>
			command.setName('show')
			.setDescription('show faq')
			.addStringOption(option =>
				option.setName('title')
				.setDescription('faq you want to see')
				.setAutocomplete(true)
				.setRequired(true)
			)
			.addUserOption(option =>
				option.setName('target')
				.setDescription('select the member you want to mention')
			)
		)
		.addSubcommand(command => 
			command.setName('add')
			.setDescription('add faq')
		),
	/**
	 * 
	 * @param {ChatInputCommandInteraction} interaction 
	 * @returns 
	 */
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'show') {
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
		} else if (interaction.options.getSubcommand() === 'add') {
			const allowedUsers = ['1108416506716508190', '783305816702844990', '921378081229393980', '795556607445696533', '850370781456367688'];
			if (!allowedUsers.includes(interaction.user.id)) return interaction.reply({ content: 'This operation is not permitted', ephemeral: true });
			const title_input = new TextInputBuilder()
			.setCustomId('faq_title_input')
			.setPlaceholder('How to import icon themes')
			.setLabel('FAQ Title')
			.setRequired(true)
			.setStyle(TextInputStyle.Short)

			const link_input = new TextInputBuilder()
			.setCustomId('faq_link_input')
			.setLabel('FAQ Link')
			.setPlaceholder('https://discord.com/channels/1074625970029477919/1149315458600812554/1149315458600812554')
			.setRequired(true)
			.setStyle(TextInputStyle.Short)

			const modal = new ModalBuilder()
			.setTitle('Submit FAQ')
			.setCustomId('submit_faq')
			.addComponents(
				new ActionRowBuilder().addComponents(title_input),
				new ActionRowBuilder().addComponents(link_input)
			);
			
			await interaction.showModal(modal);
		}
    }
}