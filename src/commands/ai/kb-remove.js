import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  data: new SlashCommandBuilder()
    .setName('kb-remove')
    .setDescription('Elimina una FAQ de la base de conocimiento')
    .addIntegerOption(option =>
      option.setName('numero')
        .setDescription('Número de la FAQ a eliminar (usa /kb-list para ver los números)')
        .setMinValue(1)
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
      const number = interaction.options.getInteger('numero');
      
      const kbPath = join(dirname(dirname(dirname(__dirname))), 'knowledge-base.json');
      const data = await readFile(kbPath, 'utf-8');
      const knowledgeBase = JSON.parse(data);
      
      if (number > knowledgeBase.faqs.length) {
        return interaction.editReply({ content: `❌ No existe la FAQ #${number}. Usa /kb-list para ver las FAQs disponibles.` });
      }
      
      const removedFAQ = knowledgeBase.faqs.splice(number - 1, 1)[0];
      
      await writeFile(kbPath, JSON.stringify(knowledgeBase, null, 2));
      
      await interaction.editReply({
        content: `✅ **FAQ eliminada exitosamente!**\n\n` +
          `**Palabras clave:** ${removedFAQ.keywords.join(', ')}\n` +
          `**Respuesta:** ${removedFAQ.answer.substring(0, 100)}...`
      });
      
    } catch (error) {
      console.error('Error eliminando FAQ:', error);
      await interaction.editReply({ content: '❌ Error al eliminar la FAQ.' });
    }
  }
};
