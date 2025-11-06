import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  data: new SlashCommandBuilder()
    .setName('kb-add')
    .setDescription('Añade una pregunta frecuente a la base de conocimiento')
    .addStringOption(option =>
      option.setName('palabras-clave')
        .setDescription('Palabras clave separadas por comas (ej: precio,costo,planes)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('respuesta')
        .setDescription('Respuesta que el bot dará cuando detecte estas palabras')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
      const keywords = interaction.options.getString('palabras-clave')
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);
      
      const answer = interaction.options.getString('respuesta');
      
      if (keywords.length === 0) {
        return interaction.editReply({ content: '❌ Debes proporcionar al menos una palabra clave.' });
      }
      
      // Cargar base de conocimiento
      const kbPath = join(dirname(dirname(dirname(__dirname))), 'knowledge-base.json');
      const data = await readFile(kbPath, 'utf-8');
      const knowledgeBase = JSON.parse(data);
      
      // Añadir nueva FAQ
      knowledgeBase.faqs.push({
        keywords: keywords,
        answer: answer
      });
      
      // Guardar
      await writeFile(kbPath, JSON.stringify(knowledgeBase, null, 2));
      
      await interaction.editReply({
        content: `✅ **FAQ añadida exitosamente!**\n\n` +
          `**Palabras clave:** ${keywords.join(', ')}\n` +
          `**Respuesta:** ${answer.substring(0, 100)}${answer.length > 100 ? '...' : ''}\n\n` +
          `El bot ahora responderá de manera natural cuando detecte estas palabras.`
      });
      
    } catch (error) {
      console.error('Error añadiendo FAQ:', error);
      await interaction.editReply({ content: '❌ Error al añadir la FAQ a la base de conocimiento.' });
    }
  }
};
