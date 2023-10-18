const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('translate')
		.setDescription('translate the text')
		.addStringOption(option => 
            option.setName('text')
            .setDescription('enter text')
            .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('target')
            .setDescription('target language')
            .addChoices(
                { name: 'Arabic', value: 'ar' },
                { name: 'Chinese', value: 'zh' },
                { name: 'English', value: 'en' },
                { name: 'French', value: 'fr' },
                { name: 'German', value: 'de' },
                { name: 'Japanese', value: 'ja' },
                { name: 'Korean', value: 'ko' },
                { name: 'Portuguese', value: 'pt' },
                { name: 'Russian', value: 'ru' },
                { name: 'Spanish', value: 'es' },
                { name: 'Vietnamese', value: 'vi' }
            )
            .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('engine')
            .setDescription('select a translation engine')
            .addChoices(
                { name: 'Google', value: 'google' }
            )
        )
        .addBooleanOption(option =>
            option.setName('hidden')
            .setDescription('show translation results only to yourself')
        ),
	async execute(interaction) {
        const hidden = interaction.options.getBoolean('hidden');
        const text = interaction.options.getString('text');
        const engine = interaction.options.getString('engine') || 'google';
        const target = interaction.options.getString('target');
        try {
            await interaction.deferReply({ ephemeral: hidden });
            let translatedText;
            if (engine === 'google') {
                const { data } = await axios.get("http://translate.google.com/translate_a/single",
                {
                    params: {
                        client: 'at',
                        dt: 't',
                        dj: '1',
                        sl: 'auto',
                        tl: target,
                        q: text
                    }
                }
                );
                translatedText = data.sentences[0].trans;
            } else if (engine === 'deepl') {
                const { data } = await axios.post("DEEPL X API URL",
                {
                    text,
                    source_lang: '',
                    target_lang: target,
                }
                );
                translatedText = data.data;
            }
            const embed = new EmbedBuilder()
            .setTitle(`Translation to ${target}`)
            .setDescription(translatedText)
            .setColor('White')
            .setFooter({ text: `Powered by ${engine} translate` });
            await interaction.editReply({ embeds: [ embed ] });
        } catch (e) {
            console.error(e);
            await interaction.editReply({ content: 'An error occured.'});
        }
    }
}