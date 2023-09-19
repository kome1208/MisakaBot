const { Git } = require('../../utils/git');
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const moment = require('moment');
const { default: axios } = require('axios');
const allowedUsers = ['783305816702844990', '921378081229393980', '795556607445696533', '850370781456367688'];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('news')
		.setDescription('news')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand(command =>
            command.setName('add')
            .setDescription('add tweaks to news')
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
        const tweaks = interaction.options.data[0].options.filter((option) => option.name.startsWith('tweak')).reverse();
        const file = await git.getFile('News.json');
        const newsContent = JSON.parse((await git.getBlob(file.sha)));
        const newTweaks = [];
        for (let i = 0; tweaks.length > i; i++) {
            const { data } = await axios.get(`https://misaka-search-ydkr.koyeb.app/misaka/tweaks/${tweaks[i].value}`);
            if (!data.count) return;
            const addTweak = {
                RepositoryURL: data.package.Repository.Link,
                PackageID: data.package.PackageID
            };
            newTweaks.unshift(addTweak);
        }
        newsContent.Tweaks.forEach((tweak) => {
            if (!newTweaks.find((t) => t.PackageID === tweak.PackageID)) newTweaks.push(tweak);
        });
        newsContent.Tweaks = newTweaks.slice(0, 75)
        newsContent.Update = moment().format('YYYY/MM/DD');

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