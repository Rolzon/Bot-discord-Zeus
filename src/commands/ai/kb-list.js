import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  data: new SlashCommandBuilder()
    .setName('kb-list')
    .setDescription('Lista todas las FAQs de la base de conocimiento')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
      const kbPath = join(dirname(dirname(dirname(__dirname))), 'knowledge-base.json');
      const data = await readFile(kbPath, 'utf-8');
      const knowledgeBase = JSON.parse(data);
      
      if (knowledgeBase.faqs.length === 0) {
        return interaction.editReply({ content: '❌ No hay FAQs en la base de conocimiento.' });
      }
      
      const embed = new EmbedBuilder()
        .setColor(interaction.client.config.embedColor)
        .setTitle('📚 Base de Conocimiento - FAQs')
        .setDescription(`**Empresa:** ${knowledgeBase.company.name}\n**Web:** ${knowledgeBase.company.website}\n\n**Total de FAQs:** ${knowledgeBase.faqs.length}`)
        .setTimestamp();
      
      // Mostrar las primeras 10 FAQs
      knowledgeBase.faqs.slice(0, 10).forEach((faq, index) => {
        embed.addFields({
          name: `${index + 1}. ${faq.keywords.slice(0, 3).join(', ')}`,
          value: faq.answer.substring(0, 150) + (faq.answer.length > 150 ? '...' : '')
        });
      });
      
      if (knowledgeBase.faqs.length > 10) {
        embed.setFooter({ text: `Mostrando 10 de ${knowledgeBase.faqs.length} FAQs` });
      }
      
      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error listando FAQs:', error);
      await interaction.editReply({ content: '❌ Error al cargar la base de conocimiento.' });
    }
  }
};
