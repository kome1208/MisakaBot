const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('download')
		.setDescription('Get the latest release of misaka'),
	async execute(interaction) {
        await interaction.deferReply();
        const { data } = await axios.get('https://api.github.com/repos/straight-tamago/misaka/releases/latest', {
            headers: {
                "Accept": "application/vnd.github+json",
                "Authorization": "Bearer " + process.env['GITHUB_TOKEN'],
                "X-GitHub-Api-Version": "2022-11-28"
            }
        });
        const embed = new EmbedBuilder()
        .setTitle(data.name)
        .setURL(data.html_url)
        .setDescription(data.body)
        .addFields(
            { name: "Files", value: data.assets.map((file) => `[${file.name}](${file.browser_download_url})`).join("\n")}
        )
        .setTimestamp(new Date(data.published_at));
        await interaction.editReply({ embeds: [embed] });
    }
}