const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('download')
		.setDescription('Get the release of misaka')
        .addStringOption(option =>
            option.setName('version')
            .setDescription('select a version')
            .setAutocomplete(true)
        ),
	async execute(interaction) {
        await interaction.deferReply();
        const release_id = interaction.options.getString('version');
        try {
            const { data } = await axios.get(`https://api.github.com/repos/straight-tamago/misaka/releases/${release_id || 'latest'}`, {
                headers: {
                    "Accept": "application/vnd.github+json",
                    "Authorization": "Bearer " + process.env['GITHUB_TOKEN'],
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            });
            const embed = new EmbedBuilder()
            .setTitle(data.name || data.tag_name)
            .setURL(data.html_url)
            .setDescription(data.body || null)
            .addFields(
                { name: "Files", value: data.assets.map((file) => `[${file.name}](${file.browser_download_url})`).join("\n")}
            )
            .setColor(data.prerelease ? 'Orange' : 'Green')
            .setTimestamp(new Date(data.published_at))
            .setFooter({ text: data.prerelease ? 'Pre-release' : "Stable" });
            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: 'An error occured.' });
        }
    }
}