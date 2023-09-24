const { Git } = require('../../utils/git');
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const moment = require('moment-timezone');
const { default: axios } = require('axios');
const allowedUsers = ['783305816702844990', '921378081229393980', '795556607445696533', '850370781456367688'];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('news')
		.setDescription('news')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand(command =>
            command.setName('update')
            .setDescription('update news')
            .addStringOption(option => 
                option.setName('tweak1')
                .setDescription('tweak')
                .setAutocomplete(true)
                .setRequired(true)
            )
            .addStringOption(option => 
                option.setName('tweak2')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak3')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak4')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak5')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak6')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak7')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak8')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak9')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak10')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak11')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak12')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak13')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak14')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak15')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak16')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak17')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak18')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak19')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak20')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak21')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak22')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak23')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak24')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
            .addStringOption(option => 
                option.setName('tweak25')
                .setDescription('tweak')
                .setAutocomplete(true)
            )
        ),
	async execute(interaction) {
        if (!allowedUsers.includes(interaction.user.id)) return interaction.reply({ content: 'This operation is not permitted.', ephemeral: true });
		await interaction.deferReply({ ephemeral: true });
        const git = new Git({
            owner: 'shimajiron',
            repo: 'Misaka_Network',
            branch: 'main'
        });
        const file = await git.getFile('News.json');
        const newsContent = JSON.parse((await git.getBlob(file.sha)));
        const tweaks = [
            ...interaction.options.data[0].options.filter((option) => option.name.startsWith('tweak')).map((tweak) => tweak.value),
            ...newsContent.Tweaks.map((tweak) => tweak.PackageID)
        ];
        const res = await axios.get(`https://misaka-search-ydkr.koyeb.app/api/v1/tweaks/${tweaks}`);
        const availables = res.data.tweaks.map((tweak) => {
            return {
                RepositoryURL: tweak.Repository.Link,
                PackageID: tweak.PackageID
            }
        });
        const newList = [];
        for (const tweak of tweaks) {
            const found = availables.find(t => t.PackageID == tweak);
            if (found) newList.push(found);
        }
        if (!newList.length) return interaction.editReply({ content: "🤔" });
        newsContent.Tweaks = newList.slice(0, 75)
        newsContent.Update = moment.tz().format('YYYY/MM/DD HH:mm');

        await git.updateRef({
            file,
            content: JSON.stringify(newsContent, null, 2),
            message: 'Update News.json (via API)'
        });

        const embed = new EmbedBuilder()
        .setTitle('Updated News')
        .setDescription('https://github.com/shimajiron/Misaka_Network/blob/main/News.json');

        await interaction.editReply({ embeds: [embed] });
    }
}