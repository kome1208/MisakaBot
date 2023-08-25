const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tweak')
		.setDescription('Search the misaka tweaks')
		.addStringOption(option => option.setName('query').setDescription('Query of tweaks').setRequired(true)),
	async execute(interaction) {
        await interaction.deferReply();
        const query = interaction.options.getString('query');
        const { data } = await axios.get(`https://misaka-search-ydkr.koyeb.app/misaka/tweaks/search?q=${encodeURIComponent(query)}&limit=25`);
        if (data.packages.length == 0) return interaction.editReply({ content: 'No tweak found.'});
        const embeds = data.packages.slice(0,25).map((pkg) => {
            return new EmbedBuilder()
            .setAuthor({ name:`${pkg.Repository.Name}`, iconURL:pkg.Repository.Icon})
            .setTitle(pkg.Name)
            .setDescription(pkg.Description || null)
            .addFields(
                { name:'Author', value:pkg?.Author?.Label || pkg.Repository.Default.Author.Label, inline:true },
                { name:'Version', value:pkg.Releases.at(-1).Version, inline:true },
                { name:'PackageID', value:pkg.PackageID, inline:true },
                { name:'Repository', value:`[${pkg.Repository.Name}](${pkg.Repository.Link})`, inline:true },
                { name:'Tweak Page', value:`[Open](https://straight-tamago.github.io/misaka/?repo=${pkg.Repository.Link}&tweak=${pkg.PackageID})`, inline:true }
            )
            .setThumbnail(pkg.Icon || null)
            .setImage(pkg?.Screenshot?.at(0) || null)
            .setColor('Random');
        })
        const options = embeds.map((embed, i) => ({label:`${embed.data.title.slice(0, 99)}`, value:`${i}`}));
        const menu = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
            .setCustomId('select_tweak')
            .setPlaceholder('Select Tweak')
            .addOptions(options)
        );
        const reply = await interaction.editReply({
            embeds:[embeds[0]],
            components:[menu]
        });
        const filter = ({customId, user}) => {
            return customId === 'select_tweak' && user.id === interaction.user.id;
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