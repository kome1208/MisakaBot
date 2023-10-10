const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, MessageContextMenuCommandInteraction } = require('discord.js');
const axios = require('axios');
const fs = require('fs');

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
                { label: 'Arabic', value: 'ar', deepl: false },
                { label: 'Chinese', value: 'zh', deepl: true },
                { label: 'English', value: 'en', deepl: true },
                { label: 'French', value: 'fr', deepl: true },
                { label: 'German', value: 'de', deepl: true },
                { label: 'Japanese', value: 'ja', deepl: true },
                { label: 'Korean', value: 'ko', deepl: true },
                { label: 'Portuguese', value: 'pt', deepl: true },
                { label: 'Russian', value: 'ru', deepl: true },
                { label: 'Spanish', value: 'es', deepl: true },
                { label: 'Vietnamese', value: 'vi', deepl: false }
            ];

            const engines = new ActionRowBuilder()
            .setComponents(
                new ButtonBuilder()
                .setCustomId('translate_google')
                .setLabel('Google')
                .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                .setCustomId('translate_deepl')
                .setLabel('DeepL')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
            );

            const select_engine = await interaction.followUp({ content: 'Select a translation engine (Recommended: Google)', components: [ engines ], ephemeral: true })
            const engine_collector = select_engine.createMessageComponentCollector({
                max: 1,
                time: 300_000
            });
            engine_collector.on('collect', async (i) => {
                await i.deferReply({ ephemeral: true });
                const selectedEngine = i.customId.endsWith('google') ? 'google' : 'deepl';
                const langs_menu = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                    .setCustomId('select_language')
                    .setPlaceholder('click here')
                    .addOptions(selectedEngine === 'google' ? targetLangs : targetLangs.filter((lang) => lang.deepl))
                )
                const select_lang = await i.editReply({ content: `Select a language` , components: [ langs_menu ] });
                const lang_collector = select_lang.createMessageComponentCollector({
                    max: 1,
                    time: 300_000
                });
                lang_collector.on('collect', async (i2) => {
                    if (!fs.existsSync('TranslationCount.txt')) fs.writeFileSync('TranslationCount.txt', '0', 'utf8');
                    const translationCount = fs.readFileSync('TranslationCount.txt', 'utf8');
                    fs.writeFileSync('TranslationCount.txt', String(Number(translationCount) + 1), 'utf8');
                    const targetLang = i2.values[0];
                    let translatedText;
                    await i2.deferReply({ ephemeral: true });
                    try {
                        if (selectedEngine === 'google') {
                            const { data } = await axios.get("http://translate.google.com/translate_a/single",
                            {
                                params: {
                                    client: 'at',
                                    dt: 't',
                                    dj: '1',
                                    sl: 'auto',
                                    tl: targetLang,
                                    q: message.content
                                }
                            }
                            );
                            translatedText = data.sentences[0].trans;
                        } else if (selectedEngine === 'deepl') {
                            const { data } = await axios.post("DEEPL X API URL",
                            {
                                text: message.content,
                                source_lang: '',
                                target_lang: targetLang,
                            }
                            );
                            translatedText = data.data;
                        }
                        const embed = new EmbedBuilder()
                        .setTitle(`Translation to ${targetLang}`)
                        .setDescription(translatedText)
                        .setColor('White')
                        .setFooter({ text: `Powered by ${selectedEngine} translate` });
                        const button = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setLabel('Jump to message')
                            .setStyle(ButtonStyle.Link)
                            .setURL(message.url)
                        );
                        await i2.editReply({ embeds: [ embed ], components: [ button ] });
                    } catch (e) {
                        console.error(e);
                        await i2.editReply({ content: 'An error occured.' });
                    }
                });
            });
        }
    }
}