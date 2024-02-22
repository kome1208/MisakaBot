const { Git } = require('../../utils/git');
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const moment = require('moment-timezone');
const { default: axios } = require('axios');
const allowedUsers = ['1108416506716508190', '783305816702844990', '921378081229393980', '795556607445696533', '850370781456367688'];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('news')
		.setDescription('news')
        .setDMPermission(false)
	    .addSubcommand(command => {
            command.setName('update')
            .setDescription('update news')
            for (let i = 1; i <= 25; i++) {
                command.addStringOption(option =>
                    option.setName('tweak' + i)
                    .setDescription('tweak')
                    .setAutocomplete(true)
                    .setRequired(i == 1 ? true : false)
                );
            }
            return command;
        })
        .addSubcommand(command =>
            command.setName('view')
            .setDescription('view news')
        ),
	async execute(interaction) {
        if (interaction.options.getSubcommand() === 'update') {
            if (!allowedUsers.includes(interaction.user.id)) return interaction.reply({ content: 'This operation is not permitted.', ephemeral: true });
            await interaction.deferReply({ ephemeral: true });
            const git = new Git({
                owner: 'shimajiron',
                repo: 'Misaka_Network',
                branch: 'main'
            });
            const file = await git.getFile('Server/News.json');
            const newsContent = JSON.parse(Buffer.from(file.content, 'base64').toString('utf-8'));
            const tweaks = [
                ...interaction.options.data[0].options.filter((option) => option.name.startsWith('tweak')).map((tweak) => tweak.value),
                ...newsContent.NewRelease.map((tweak) => tweak.PackageID)
            ];
            const res = await axios.get(`https://misaka-search-ydkr.koyeb.app/api/v2/tweaks/${tweaks}`);
            const availables = res.data.tweaks.map((tweak) => {
                return {
                    RepositoryURL: tweak.repository.link,
                    PackageID: tweak.packageid
                }
            });
            const newList = tweaks.reduce((result, packageId) => {
                const found = availables.find((tweak) => tweak.PackageID === packageId);
                if (found && !result.some((tweak) => tweak.PackageID === packageId)) {
                    result.push(found);
                }
                return result;
            }, []);
            if (!newList.length) return interaction.editReply({ content: "🤔" });
            newsContent.NewRelease = newList.slice(0, 75)
            newsContent.LastUpdate = moment.tz().format('YYYY/MM/DD HH:mm');
    
            await git.updateRef({
                file,
                content: JSON.stringify(newsContent, null, 2),
                message: 'Update Server/News.json (via API)'
            });
    
            const embed = new EmbedBuilder()
            .setTitle('Updated News')
            .setDescription('https://github.com/shimajiron/Misaka_Network/blob/main/Server/News.json');
    
            await interaction.editReply({ embeds: [embed] });
        } else if (interaction.options.getSubcommand() === 'view') {
            await interaction.deferReply();
            try {
                const { data: news } = await axios.get('https://raw.githubusercontent.com/shimajiron/Misaka_Network/main/Server/News.json'); 
                const { data: tweaks } = await axios.get(`https://misaka-search-ydkr.koyeb.app/api/v2/tweaks/${news.NewRelease.slice(0, 10).map(x => x.PackageID)}`);
                const embed = new EmbedBuilder()
                .setTitle('News')
                .setURL('https://raw.githubusercontent.com/shimajiron/Misaka_Network/main/Server/News.json')
                .setDescription(tweaks.tweaks.join("\n"))
                .setFooter({ text: 'Last Update: ' + news.LastUpdate });
                await interaction.editReply({ embeds: [ embed ] });
            } catch (err) {
                console.error(err);
            }
        }
    }
}
