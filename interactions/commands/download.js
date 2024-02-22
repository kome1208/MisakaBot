const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('download')
		.setDescription('Get the release of misaka')
        .addStringOption(option =>
            option.setName('platform')
            .setDescription('choose a platform.(default:ios)')
            .setChoices(
                { name: 'iOS', value: 'ios' },
                { name: 'tvOS', value: 'tvos' },
            )
        ),
	async execute(interaction) {
        await interaction.deferReply();
        const platform = interaction.options.getString('platform') || 'ios'; 
        try {
            const { data } = await axios.get(`https://api.github.com/repos/straight-tamago/misaka${platform === "ios" ? "" : "-"+platform}/releases`, {
                headers: {
                    "Accept": "application/vnd.github+json",
                    "Authorization": "Bearer " + process.env['GITHUB_TOKEN'],
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            });
            const embeds = data.slice(0, 25).map((release) => 
                new EmbedBuilder()
                .setTitle(release.name || release.tag_name)
                .setURL(release.html_url)
                .setDescription(release.body || null)
                .addFields(
                    { name: "Files", value: release.assets.map((file) => `[${file.name}](${file.browser_download_url})`).join("\n")}
                )
                .setColor(release.prerelease ? 'Orange' : 'Green')
                .setTimestamp(new Date(release.published_at))
                .setFooter({ text: release.prerelease ? 'Pre-release' : "Stable" })
            );
            const options = embeds.map((embed, i) => ({label:`${embed.data.title.slice(0, 99)}`, value:`${i}`}));
            const menu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                .setCustomId('select_version')
                .setPlaceholder('Select Version')
                .addOptions(options)
            );
            const reply = await interaction.editReply({
                embeds:[embeds[0]],
                components:[menu]
            });
            const filter = ({customId, user}) => {
                return customId === 'select_version' && user.id === interaction.user.id;
            };
            const collector = reply.createMessageComponentCollector({filter, time:900000});
            collector.on('collect', async (interaction) => {
                await interaction.update({
                    embeds:[embeds[interaction.values[0]]]
                });
            })
            .on('end', async () => {});
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: 'An error occured.' });
        }
    }
}