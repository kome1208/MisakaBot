const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, MessageContextMenuCommandInteraction } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new ContextMenuCommandBuilder()
    .setName('translate')
    .setType(ApplicationCommandType.Message)
    .setDMPermission(false),
    /**
    * 
    * @param {MessageContextMenuCommandInteraction} interaction 
    * @returns 
    */
    run: async (interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const targetId = interaction.targetId;
        const message = await interaction.channel.messages.fetch(targetId);
        if (!message.content) return await interaction.editReply({ content: 'no message content' });
        else {
            const targetLangs = [
                { label: 'Arabic', value: 'ar' },
                { label: 'Chinese', value: 'zh' },
                { label: 'English', value: 'en' },
                { label: 'French', value: 'fr' },
                { label: 'German', value: 'de' },
                { label: 'Japanese', value: 'ja' },
                { label: 'Korean', value: 'ko' },
                { label: 'Russian', value: 'ru' },
                { label: 'Spanish', value: 'es' },
                { label: 'Vietnamese', value: 'vi'}
            ];
            const langs_menu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                .setCustomId('select_language')
                .setPlaceholder('Languages')
                .addOptions(targetLangs)
            );
            const select_lang = await interaction.editReply({ content: 'select a language', components: [ langs_menu ] });
            const filter = ({ customId }) => (customId.startsWith('select_language'));
            const collector = select_lang.createMessageComponentCollector({ filter, time: 300_000 });
            collector.on('collect', async (i) => {
                await i.deferReply({ ephemeral: true });
                try {
                    const targetLang = i.values[0];
                    const { data } = await axios.post("https://lt.liberal-online.net/translate",
                    {
                        q: message.content,
                        source: 'auto',
                        target: targetLang,
                        format: 'text'
                    }
                    );
                    const embed = new EmbedBuilder()
                    .setTitle(`Translation from ${data.detectedLanguage.language} to ${targetLang}`)
                    .setDescription(data.translatedText)
                    .setColor('White')
                    .setFooter({ text: 'Powered by LibreTranslate' });
                    const button = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setLabel('Jump')
                        .setStyle(ButtonStyle.Link)
                        .setURL(message.url)
                    );
                    await i.editReply({ embeds: [ embed ], components: [ button ] });
                } catch (err) {
                    console.error(err);
                    await i.editReply({ content: 'An error occured.' });
                }
            })
            .on('end', async () => {});
        }
    }
}