const {
  Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder,
  SlashCommandBuilder, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ChannelType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');
let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Token ve GuildId environment variable'dan al
const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN) { console.error('❌ TOKEN environment variable eksik!'); process.exit(1); }
if (!GUILD_ID) { console.error('❌ GUILD_ID environment variable eksik!'); process.exit(1); }

const uyarilar = new Map();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

const commands = [
  new SlashCommandBuilder()
    .setName('abone-ver')
    .setDescription('Bir kullanıcıya abone rolü ver')
    .addUserOption(opt => opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
    .addStringOption(opt => opt.setName('sebep').setDescription('Sebep').setRequired(false)),

  new SlashCommandBuilder()
    .setName('abone-al')
    .setDescription('Bir kullanıcıdan abone rolünü kaldır')
    .addUserOption(opt => opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
    .addStringOption(opt => opt.setName('sebep').setDescription('Sebep').setRequired(false)),

  new SlashCommandBuilder()
    .setName('abone-kontrol')
    .setDescription('Abone durumunu kontrol et')
    .addUserOption(opt => opt.setName('kullanici').setDescription('Kullanıcı').setRequired(false)),

  new SlashCommandBuilder()
    .setName('abone-liste')
    .setDescription('Tüm aboneleri listele'),

  new SlashCommandBuilder()
    .setName('uyar')
    .setDescription('Bir kullanıcıyı uyar ve cezalı rolü ver')
    .addUserOption(opt => opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
    .addStringOption(opt => opt.setName('sebep').setDescription('Uyarı sebebi').setRequired(true)),

  new SlashCommandBuilder()
    .setName('uyarilar')
    .setDescription('Kullanıcının uyarılarını listele')
    .addUserOption(opt => opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true)),

  new SlashCommandBuilder()
    .setName('uyari-kaldir')
    .setDescription('Kullanıcının son uyarısını kaldır')
    .addUserOption(opt => opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true)),

  new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Kullanıcıyı sustur')
    .addUserOption(opt => opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
    .addIntegerOption(opt => opt.setName('sure').setDescription('Süre (dakika)').setRequired(true))
    .addStringOption(opt => opt.setName('sebep').setDescription('Sebep').setRequired(false)),

  new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Kullanıcının susturmasını kaldır')
    .addUserOption(opt => opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true)),

  new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('Ticket panelini gönder (Yönetici)')
    .addChannelOption(opt => opt.setName('kanal').setDescription('Panelin gönderileceği kanal').setRequired(true)),

  new SlashCommandBuilder()
    .setName('ayarlar')
    .setDescription('Bot ayarlarını görüntüle (Yönetici)'),

  new SlashCommandBuilder()
    .setName('ayarla-abone-rol')
    .setDescription('Abone rolünü ayarla (Yönetici)')
    .addRoleOption(opt => opt.setName('rol').setDescription('Abone rolü').setRequired(true)),

  new SlashCommandBuilder()
    .setName('ayarla-yetkili-rol')
    .setDescription('Abone yetkilisi rolünü ayarla (Yönetici)')
    .addRoleOption(opt => opt.setName('rol').setDescription('Yetkili rolü').setRequired(true)),

  new SlashCommandBuilder()
    .setName('ayarla-moderator-rol')
    .setDescription('Moderatör rolünü ayarla (Yönetici)')
    .addRoleOption(opt => opt.setName('rol').setDescription('Moderatör rolü').setRequired(true)),

  new SlashCommandBuilder()
    .setName('ayarla-cezali-rol')
    .setDescription('Cezalı rolünü ayarla (Yönetici)')
    .addRoleOption(opt => opt.setName('rol').setDescription('Cezalı rolü').setRequired(true)),

  new SlashCommandBuilder()
    .setName('ayarla-log-kanal')
    .setDescription('Log kanalını ayarla (Yönetici)')
    .addChannelOption(opt => opt.setName('kanal').setDescription('Log kanalı').setRequired(true)),

  new SlashCommandBuilder()
    .setName('ayarla-uye-rol')
    .setDescription('Otomatik üye rolünü ayarla (Yönetici)')
    .addRoleOption(opt => opt.setName('rol').setDescription('Üye rolü').setRequired(true)),

  new SlashCommandBuilder()
    .setName('ayarla-ses-kanal')
    .setDescription('Botun durduğu ses kanalını ayarla (Yönetici)')
    .addChannelOption(opt => opt.setName('kanal').setDescription('Ses kanalı').setRequired(true)),

  new SlashCommandBuilder()
    .setName('ayarla-hosgeldin-kanal')
    .setDescription('Hoş geldin kanalını ayarla (Yönetici)')
    .addChannelOption(opt => opt.setName('kanal').setDescription('Hoş geldin kanalı').setRequired(true)),

  new SlashCommandBuilder()
    .setName('ayarla-kanit-kanal')
    .setDescription('Abone kanıt kanalını ayarla (Yönetici)')
    .addChannelOption(opt => opt.setName('kanal').setDescription('Kanıt kanalı').setRequired(true)),

  new SlashCommandBuilder()
    .setName('ayarla-kanit-log-kanal')
    .setDescription('Kanıt inceleme kanalını ayarla (Yönetici)')
    .addChannelOption(opt => opt.setName('kanal').setDescription('Kanıt inceleme kanalı').setRequired(true)),

  new SlashCommandBuilder()
    .setName('ayarla-uye-log-kanal')
    .setDescription('Üye giriş log kanalını ayarla (Yönetici)')
    .addChannelOption(opt => opt.setName('kanal').setDescription('Üye log kanalı').setRequired(true)),

  new SlashCommandBuilder()
    .setName('ayarla-ticket-kategori')
    .setDescription('Ticketların açılacağı kategoriyi ayarla (Yönetici)')
    .addChannelOption(opt => opt.setName('kategori').setDescription('Kategori').setRequired(true)),

  new SlashCommandBuilder()
    .setName('ayarla-ticket-log-kanal')
    .setDescription('Ticket log kanalını ayarla (Yönetici)')
    .addChannelOption(opt => opt.setName('kanal').setDescription('Ticket log kanalı').setRequired(true)),

  new SlashCommandBuilder()
    .setName('ayarla-media-kanal')
    .setDescription('⭐ tepkisi eklenecek media kanalını ayarla (Yönetici)')
    .addChannelOption(opt => opt.setName('kanal').setDescription('Media kanalı').setRequired(true)),

].map(cmd => cmd.toJSON());

// ─────────────────────────────────────────────
// Bot hazır
// ─────────────────────────────────────────────
client.once('ready', async () => {
  console.log(`✅ Bot aktif: ${client.user.tag}`);
  client.user.setActivity('Dizel Works™ Gururla sunar.', { type: 3 });

  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    await rest.put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), { body: commands });
    console.log('✅ Slash komutları kaydedildi.');
  } catch (err) {
    console.error('❌ Komut kaydı hatası:', err);
  }

  joinVoiceChannel();
});

// ─────────────────────────────────────────────
// Ses kanalı
// ─────────────────────────────────────────────
function joinVoiceChannel() {
  if (!config.sesKanalId) return;
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) return;
  const channel = guild.channels.cache.get(config.sesKanalId);
  if (!channel) return;

  const { joinVoiceChannel: joinVC, entersState, VoiceConnectionStatus } = require('@discordjs/voice');

  try {
    const connection = joinVC({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: true,
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
      } catch {
        setTimeout(joinVoiceChannel, 5000);
      }
    });

    console.log(`🔊 Ses kanalına bağlandı: ${channel.name}`);
  } catch (err) {
    console.error('❌ Ses kanalı hatası:', err.message);
    setTimeout(joinVoiceChannel, 10000);
  }
}

// ─────────────────────────────────────────────
// Yeni üye
// ─────────────────────────────────────────────
client.on('guildMemberAdd', async (member) => {
  if (config.uyeRolId) {
    try {
      const role = member.guild.roles.cache.get(config.uyeRolId);
      if (role) await member.roles.add(role);
    } catch (err) {
      console.error('❌ Üye rolü verme hatası:', err.message);
    }
  }

  if (config.hosgeldinKanalId) {
    try {
      const kanal = member.guild.channels.cache.get(config.hosgeldinKanalId);
      if (kanal) {
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('👋 Sunucuya Hoş Geldin!')
          .setDescription(`Merhaba ${member}, **Dizel Works™** sunucusuna hoş geldin! 🎉`)
          .setThumbnail(member.user.displayAvatarURL())
          .addFields(
            { name: '👤 Kullanıcı', value: `${member.user.tag}`, inline: true },
            { name: '👥 Üye Sayısı', value: `${member.guild.memberCount}. üye`, inline: true },
            { name: '📅 Hesap Tarihi', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
            { name: '📋 Kurallar', value: 'Lütfen kuralları oku ve kurallara uy!', inline: false },
          )
          .setFooter({ text: 'Dizel Works™', iconURL: member.guild.client.user.displayAvatarURL() })
          .setTimestamp();
        await kanal.send({ content: `${member}`, embeds: [embed] });
      }
    } catch (err) {
      console.error('❌ Hoş geldin mesajı hatası:', err.message);
    }
  }

  if (config.uyeLogKanalId) {
    try {
      const uyeLogKanal = member.guild.channels.cache.get(config.uyeLogKanalId);
      if (uyeLogKanal) {
        const embed = new EmbedBuilder()
          .setColor(0x57F287)
          .setTitle('👤 Yeni Üye Katıldı')
          .addFields(
            { name: '👤 Kullanıcı', value: `${member.user} (${member.user.tag})`, inline: true },
            { name: '📅 Hesap Tarihi', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
          )
          .setFooter({ text: `Sunucu üye sayısı: ${member.guild.memberCount}` })
          .setTimestamp();
        await uyeLogKanal.send({ embeds: [embed] });
      }
    } catch (err) {
      console.error('❌ Üye log hatası:', err.message);
    }
  }
});

// ─────────────────────────────────────────────
// Mesaj oluşturma — Kanıt & Media
// ─────────────────────────────────────────────
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // ── MEDIA KANALI: her fotoğrafa ⭐ tepkisi ──
  if (config.mediaKanalId && message.channel.id === config.mediaKanalId) {
    const resimVar = message.attachments.some(a => a.contentType?.startsWith('image/'));
    if (resimVar) {
      try { await message.react('⭐'); } catch { }
    }
    return;
  }

  // ── KANIT KANALI: sadece resim içeriyorsa işlem yap ──
  if (!config.kanitKanalId) return;
  if (message.channel.id !== config.kanitKanalId) return;

  // Hiç resim eki yoksa sessizce sil ve çık
  const resimEki = message.attachments.find(a => a.contentType?.startsWith('image/'));
  if (!resimEki) {
    try { await message.delete(); } catch { }
    return;
  }

  if (!config.kanitLogKanalId) return;
  const logKanal = message.guild.channels.cache.get(config.kanitLogKanalId);
  if (!logKanal) return;

  const embed = new EmbedBuilder()
    .setColor(0xFEE75C)
    .setTitle('📋 Yeni Abone Kanıtı!')
    .setThumbnail(message.author.displayAvatarURL())
    .setImage(resimEki.url)
    .addFields(
      { name: '👤 Kullanıcı', value: `${message.author} (${message.author.tag})`, inline: true },
      { name: '📨 Kanal', value: `${message.channel}`, inline: true },
      { name: '💬 Mesaj', value: message.content || '*(Yalnızca görsel)*', inline: false },
    )
    .setFooter({ text: 'Kanıtı inceleyip onaylayın veya reddedin.' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`kanit_onayla_${message.author.id}_${message.id}`)
      .setLabel('✅ Onayla')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`kanit_red_${message.author.id}_${message.id}`)
      .setLabel('❌ Reddet')
      .setStyle(ButtonStyle.Danger),
  );

  const yetkiliPing = config.aboneYetkiliRolId ? `<@&${config.aboneYetkiliRolId}>` : '';
  await logKanal.send({ content: `${yetkiliPing} Yeni kanıt incelenmesi gerekiyor!`, embeds: [embed], components: [row] });
});

// ─────────────────────────────────────────────
// Ticket log yardımcısı
// ─────────────────────────────────────────────
async function ticketLog(guild, { renk, baslik, alanlar }) {
  const kanalId = config.ticketLogKanalId || config.logKanalId;
  if (!kanalId) return;
  const kanal = guild.channels.cache.get(kanalId);
  if (!kanal) return;

  const embed = new EmbedBuilder()
    .setColor(renk || 0x5865F2)
    .setTitle(baslik)
    .setTimestamp()
    .setFooter({ text: 'Dizel Works™ Bot', iconURL: guild.client.user.displayAvatarURL() });

  if (alanlar) embed.addFields(alanlar);
  await kanal.send({ embeds: [embed] });
}

// ─────────────────────────────────────────────
// Etkileşimler
// ─────────────────────────────────────────────
client.on('interactionCreate', async (interaction) => {

  // ── BUTONLAR ──
  if (interaction.isButton()) {
    const { customId, guild, member } = interaction;

    // Kanıt butonları
    if (customId.startsWith('kanit_onayla_') || customId.startsWith('kanit_red_')) {
      if (!isAboneYetkilisi(member)) {
        return interaction.reply({ content: '❌ Bu butonu kullanmak için **Abone Yetkilisi** rolüne ihtiyacın var!', ephemeral: true });
      }

      if (customId.startsWith('kanit_onayla_')) {
        const hedefUserId = customId.split('_')[2];
        const hedefUye = await guild.members.fetch(hedefUserId).catch(() => null);
        if (!hedefUye) return interaction.reply({ content: '❌ Kullanıcı bulunamadı!', ephemeral: true });

        if (config.aboneRolId) {
          const aboneRol = guild.roles.cache.get(config.aboneRolId);
          if (aboneRol && !hedefUye.roles.cache.has(aboneRol.id)) await hedefUye.roles.add(aboneRol);
        }

        const onayEmbed = EmbedBuilder.from(interaction.message.embeds[0])
          .setColor(0x57F287).setTitle('✅ Kanıt Onaylandı')
          .setFooter({ text: `Onaylayan: ${member.user.tag}` });
        await interaction.update({ embeds: [onayEmbed], components: [] });

        try {
          await hedefUye.send({ embeds: [new EmbedBuilder().setColor(0x57F287).setTitle('✅ Abone Kanıtın Onaylandı!').setDescription('**Dizel Works™** sunucusunda abone rolün verildi! 🎉').setTimestamp()] });
        } catch { }

        await logKanalMesaj(guild, {
          renk: 0x57F287, baslik: '✅ Abone Kanıtı Onaylandı',
          alanlar: [
            { name: '👤 Kullanıcı', value: `${hedefUye} (${hedefUye.user.tag})`, inline: true },
            { name: '👮 Onaylayan', value: `${member} (${member.user.tag})`, inline: true },
          ],
        });

      } else {
        const hedefUserId = customId.split('_')[2];
        const hedefUye = await guild.members.fetch(hedefUserId).catch(() => null);

        const redEmbed = EmbedBuilder.from(interaction.message.embeds[0])
          .setColor(0xED4245).setTitle('❌ Kanıt Reddedildi')
          .setFooter({ text: `Reddeden: ${member.user.tag}` });
        await interaction.update({ embeds: [redEmbed], components: [] });

        if (hedefUye) {
          try {
            await hedefUye.send({ embeds: [new EmbedBuilder().setColor(0xED4245).setTitle('❌ Abone Kanıtın Reddedildi').setDescription('Kanıtın uygun bulunmadı. Geçerli bir kanıt ile tekrar dene.').setTimestamp()] });
          } catch { }
        }

        await logKanalMesaj(guild, {
          renk: 0xED4245, baslik: '❌ Abone Kanıtı Reddedildi',
          alanlar: [
            { name: '👤 Kullanıcı', value: hedefUye ? `${hedefUye} (${hedefUye.user.tag})` : hedefUserId, inline: true },
            { name: '👮 Reddeden', value: `${member} (${member.user.tag})`, inline: true },
          ],
        });
      }
      return;
    }

    // Ticket aç butonu
    if (customId === 'ticket_ac') {
      if (!config.ticketKategoriId) {
        return interaction.reply({ content: '❌ Ticket kategorisi ayarlanmamış!', ephemeral: true });
      }

      const mevcutTicket = guild.channels.cache.find(
        ch => ch.name === `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}` && ch.parentId === config.ticketKategoriId
      );
      if (mevcutTicket) {
        return interaction.reply({ content: `❌ Zaten açık bir ticketın var: ${mevcutTicket}`, ephemeral: true });
      }

      const konuMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('ticket_konu_sec')
          .setPlaceholder('📋 Ticket konusunu seç...')
          .addOptions(
            new StringSelectMenuOptionBuilder().setLabel('🛠️ Destek').setDescription('Teknik yardım veya genel destek').setValue('destek'),
            new StringSelectMenuOptionBuilder().setLabel('📢 Şikayet').setDescription('Bir kullanıcı veya durum hakkında şikayet').setValue('sikayet'),
            new StringSelectMenuOptionBuilder().setLabel('💡 Öneri').setDescription('Sunucu için bir öneride bulunmak istiyorum').setValue('oneri'),
            new StringSelectMenuOptionBuilder().setLabel('❓ Diğer').setDescription('Yukarıdakilerden hiçbiri değil').setValue('diger'),
          )
      );

      await interaction.reply({ content: '📋 Lütfen ticket konusunu seç:', components: [konuMenu], ephemeral: true });
      return;
    }

    // Ticket kapat butonu
    if (customId.startsWith('ticket_kapat_')) {
      if (!isModeratorYaYonetici(member)) {
        return interaction.reply({ content: '❌ Ticketı kapatmak için **Moderatör** veya **Yönetici** olman gerekiyor!', ephemeral: true });
      }

      const kapatEmbed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle('🔒 Ticket Kapatıldı')
        .addFields({ name: '👮 Kapatan', value: `${member} (${member.user.tag})`, inline: true })
        .setTimestamp();

      await interaction.update({ embeds: [kapatEmbed], components: [] });

      await ticketLog(guild, {
        renk: 0xED4245, baslik: '🔒 Ticket Kapatıldı',
        alanlar: [
          { name: '📨 Kanal', value: interaction.channel.name, inline: true },
          { name: '👮 Kapatan', value: `${member} (${member.user.tag})`, inline: true },
        ],
      });

      setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
      return;
    }

    return;
  }

  // ── SELECT MENU ──
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'ticket_konu_sec') {
      const { guild, member } = interaction;
      const secim = interaction.values[0];

      const konuMap = { destek: '🛠️ Destek', sikayet: '📢 Şikayet', oneri: '💡 Öneri', diger: '❓ Diğer' };
      const konuAdi = konuMap[secim] || 'Diğer';

      if (!config.ticketKategoriId) {
        return interaction.reply({ content: '❌ Ticket kategorisi ayarlanmamış!', ephemeral: true });
      }

      const mevcutTicket = guild.channels.cache.find(
        ch => ch.name === `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}` && ch.parentId === config.ticketKategoriId
      );
      if (mevcutTicket) {
        return interaction.reply({ content: `❌ Zaten açık bir ticketın var: ${mevcutTicket}`, ephemeral: true });
      }

      const permissionOverwrites = [
        { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: member.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
        { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
      ];

      if (config.moderatorRolId) {
        permissionOverwrites.push({
          id: config.moderatorRolId,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
        });
      }

      const ticketKanal = await guild.channels.create({
        name: `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        type: ChannelType.GuildText,
        parent: config.ticketKategoriId,
        permissionOverwrites,
      });

      const ticketEmbed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🎫 Destek Talebi')
        .setDescription(`Merhaba ${member}! Sorununu veya talebini buraya yaz, ekibimiz en kısa sürede yardımcı olacak.`)
        .addFields(
          { name: '👤 Açan', value: `${member} (${member.user.tag})`, inline: true },
          { name: '📋 Konu', value: konuAdi, inline: true },
        )
        .setFooter({ text: 'Dizel Works™' })
        .setTimestamp();

      const kapatRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`ticket_kapat_${member.id}`)
          .setLabel('🔒 Ticketı Kapat')
          .setStyle(ButtonStyle.Danger),
      );

      await ticketKanal.send({ content: `${member}`, embeds: [ticketEmbed], components: [kapatRow] });
      await interaction.update({ content: `✅ Ticketın oluşturuldu: ${ticketKanal}`, components: [] });

      await ticketLog(guild, {
        renk: 0x5865F2, baslik: '🎫 Yeni Ticket Açıldı',
        alanlar: [
          { name: '👤 Kullanıcı', value: `${member} (${member.user.tag})`, inline: true },
          { name: '📋 Konu', value: konuAdi, inline: true },
          { name: '📨 Kanal', value: `${ticketKanal}`, inline: true },
        ],
      });
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;
  const { commandName, guild, member } = interaction;

  // ── ABONE VER ──
  if (commandName === 'abone-ver') {
    if (!isAboneYetkilisi(member)) return interaction.reply({ content: '❌ **Abone Yetkilisi** rolüne ihtiyacın var!', ephemeral: true });
    if (!config.aboneRolId) return interaction.reply({ content: '❌ Abone rolü ayarlanmamış!', ephemeral: true });

    const hedef = interaction.options.getMember('kullanici');
    const sebep = interaction.options.getString('sebep') || 'Belirtilmedi';
    const aboneRol = guild.roles.cache.get(config.aboneRolId);

    if (!aboneRol) return interaction.reply({ content: '❌ Abone rolü bulunamadı!', ephemeral: true });
    if (hedef.roles.cache.has(aboneRol.id)) return interaction.reply({ content: `⚠️ ${hedef} zaten abone!`, ephemeral: true });

    await hedef.roles.add(aboneRol);
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0x57F287).setTitle('🌟 Abone Rolü Verildi!')
        .setThumbnail(hedef.user.displayAvatarURL())
        .addFields(
          { name: '👤 Kullanıcı', value: `${hedef} (${hedef.user.tag})`, inline: true },
          { name: '🎭 Rol', value: `${aboneRol}`, inline: true },
          { name: '👮 İşlemi Yapan', value: `${member}`, inline: true },
          { name: '📝 Sebep', value: sebep },
        ).setTimestamp()]
    });
    await logKanalMesaj(guild, {
      renk: 0x57F287, baslik: '✅ Abone Rolü Verildi',
      alanlar: [
        { name: '👤 Kullanıcı', value: `${hedef} (${hedef.user.tag})`, inline: true },
        { name: '👮 Yetkili', value: `${member.user.tag}`, inline: true },
        { name: '📝 Sebep', value: sebep },
      ],
    });
  }

  // ── ABONE AL ──
  else if (commandName === 'abone-al') {
    if (!isAboneYetkilisi(member)) return interaction.reply({ content: '❌ **Abone Yetkilisi** rolüne ihtiyacın var!', ephemeral: true });
    if (!config.aboneRolId) return interaction.reply({ content: '❌ Abone rolü ayarlanmamış!', ephemeral: true });

    const hedef = interaction.options.getMember('kullanici');
    const sebep = interaction.options.getString('sebep') || 'Belirtilmedi';
    const aboneRol = guild.roles.cache.get(config.aboneRolId);

    if (!aboneRol) return interaction.reply({ content: '❌ Abone rolü bulunamadı!', ephemeral: true });
    if (!hedef.roles.cache.has(aboneRol.id)) return interaction.reply({ content: `⚠️ ${hedef} zaten abone değil!`, ephemeral: true });

    await hedef.roles.remove(aboneRol);
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0xED4245).setTitle('🗑️ Abone Rolü Kaldırıldı')
        .setThumbnail(hedef.user.displayAvatarURL())
        .addFields(
          { name: '👤 Kullanıcı', value: `${hedef} (${hedef.user.tag})`, inline: true },
          { name: '👮 İşlemi Yapan', value: `${member}`, inline: true },
          { name: '📝 Sebep', value: sebep },
        ).setTimestamp()]
    });
    await logKanalMesaj(guild, {
      renk: 0xED4245, baslik: '❌ Abone Rolü Kaldırıldı',
      alanlar: [
        { name: '👤 Kullanıcı', value: `${hedef} (${hedef.user.tag})`, inline: true },
        { name: '👮 Yetkili', value: `${member.user.tag}`, inline: true },
        { name: '📝 Sebep', value: sebep },
      ],
    });
  }

  // ── ABONE KONTROL ──
  else if (commandName === 'abone-kontrol') {
    const hedef = interaction.options.getMember('kullanici') || member;
    if (!config.aboneRolId) return interaction.reply({ content: '❌ Abone rolü ayarlanmamış!', ephemeral: true });
    const aboneRol = guild.roles.cache.get(config.aboneRolId);
    const abone = aboneRol && hedef.roles.cache.has(aboneRol.id);

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(abone ? 0x57F287 : 0xED4245)
        .setTitle(abone ? '✅ Aktif Abone' : '❌ Abone Değil')
        .setThumbnail(hedef.user.displayAvatarURL())
        .addFields(
          { name: '👤 Kullanıcı', value: `${hedef} (${hedef.user.tag})`, inline: true },
          { name: '📊 Durum', value: abone ? '🟢 Abone' : '🔴 Abone Değil', inline: true },
        ).setTimestamp()]
    });
  }

  // ── ABONE LİSTE ──
  else if (commandName === 'abone-liste') {
    if (!config.aboneRolId) return interaction.reply({ content: '❌ Abone rolü ayarlanmamış!', ephemeral: true });
    const aboneRol = guild.roles.cache.get(config.aboneRolId);
    if (!aboneRol) return interaction.reply({ content: '❌ Abone rolü bulunamadı!', ephemeral: true });

    await guild.members.fetch();
    const aboneler = guild.members.cache.filter(m => m.roles.cache.has(aboneRol.id));

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0x5865F2)
        .setTitle(`📋 Abone Listesi — ${aboneler.size} Abone`)
        .setDescription(aboneler.size === 0 ? 'Henüz abone yok.' : aboneler.map(m => `• ${m.user.tag}`).join('\n').slice(0, 4000))
        .setTimestamp()]
    });
  }

  // ── UYAR ──
  else if (commandName === 'uyar') {
    if (!isModeratorYaYonetici(member)) return interaction.reply({ content: '❌ Bu komutu kullanmak için **Moderatör** rolüne ihtiyacın var!', ephemeral: true });

    const hedef = interaction.options.getMember('kullanici');
    const sebep = interaction.options.getString('sebep');

    if (!uyarilar.has(hedef.id)) uyarilar.set(hedef.id, []);
    uyarilar.get(hedef.id).push({ sebep, tarih: new Date(), yetkili: member.user.tag });
    const uyariSayisi = uyarilar.get(hedef.id).length;

    if (config.cezaliRolId) {
      const cezaliRol = guild.roles.cache.get(config.cezaliRolId);
      if (cezaliRol && !hedef.roles.cache.has(cezaliRol.id)) await hedef.roles.add(cezaliRol);
    }

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0xFEE75C).setTitle('⚠️ Kullanıcı Uyarıldı')
        .setThumbnail(hedef.user.displayAvatarURL())
        .addFields(
          { name: '👤 Kullanıcı', value: `${hedef} (${hedef.user.tag})`, inline: true },
          { name: '👮 Yetkili', value: `${member}`, inline: true },
          { name: '⚠️ Uyarı Sayısı', value: `${uyariSayisi}`, inline: true },
          { name: '📝 Sebep', value: sebep },
          { name: '⛔ Cezalı Rolü', value: config.cezaliRolId ? '✅ Verildi' : '❌ Ayarlanmamış', inline: true },
        ).setTimestamp()]
    });

    try {
      await hedef.send({
        embeds: [new EmbedBuilder().setColor(0xFEE75C).setTitle('⚠️ Uyarı Aldın!')
          .setDescription('**Dizel Works™** sunucusunda uyarıldın ve **⛔ Cezalı** rolü verildi.')
          .addFields({ name: '📝 Sebep', value: sebep }, { name: '⚠️ Toplam Uyarı', value: `${uyariSayisi}` })
          .setTimestamp()]
      });
    } catch { }

    await logKanalMesaj(guild, {
      renk: 0xFEE75C, baslik: '⚠️ Kullanıcı Uyarıldı',
      alanlar: [
        { name: '👤 Kullanıcı', value: `${hedef} (${hedef.user.tag})`, inline: true },
        { name: '👮 Yetkili', value: `${member.user.tag}`, inline: true },
        { name: '⚠️ Uyarı Sayısı', value: `${uyariSayisi}`, inline: true },
        { name: '📝 Sebep', value: sebep },
      ],
    });
  }

  // ── UYARILAR ──
  else if (commandName === 'uyarilar') {
    if (!isModeratorYaYonetici(member)) return interaction.reply({ content: '❌ Bu komutu kullanmak için **Moderatör** rolüne ihtiyacın var!', ephemeral: true });

    const hedef = interaction.options.getMember('kullanici');
    const liste = uyarilar.get(hedef.id) || [];

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0xFEE75C)
        .setTitle(`⚠️ ${hedef.user.tag} — ${liste.length} Uyarı`)
        .setThumbnail(hedef.user.displayAvatarURL())
        .setDescription(
          liste.length === 0 ? 'Hiç uyarısı yok.' :
          liste.map((u, i) => `**${i + 1}.** ${u.sebep} — *${u.yetkili}* (<t:${Math.floor(u.tarih.getTime() / 1000)}:R>)`).join('\n')
        ).setTimestamp()]
    });
  }

  // ── UYARI KALDIR ──
  else if (commandName === 'uyari-kaldir') {
    if (!isModeratorYaYonetici(member)) return interaction.reply({ content: '❌ Bu komutu kullanmak için **Moderatör** rolüne ihtiyacın var!', ephemeral: true });

    const hedef = interaction.options.getMember('kullanici');
    const liste = uyarilar.get(hedef.id) || [];

    if (liste.length === 0) return interaction.reply({ content: `⚠️ ${hedef} kullanıcısının uyarısı yok!`, ephemeral: true });

    liste.pop();
    uyarilar.set(hedef.id, liste);

    if (liste.length === 0 && config.cezaliRolId) {
      const cezaliRol = guild.roles.cache.get(config.cezaliRolId);
      if (cezaliRol && hedef.roles.cache.has(cezaliRol.id)) await hedef.roles.remove(cezaliRol);
    }

    await interaction.reply({
      content: `✅ ${hedef} kullanıcısının son uyarısı kaldırıldı. Kalan: **${liste.length}**${liste.length === 0 ? '\n✅ Cezalı rolü de kaldırıldı.' : ''}`
    });
  }

  // ── MUTE ──
  else if (commandName === 'mute') {
    if (!isYonetici(member)) return interaction.reply({ content: '❌ Sadece yöneticiler kullanabilir!', ephemeral: true });

    const hedef = interaction.options.getMember('kullanici');
    const sure = interaction.options.getInteger('sure');
    const sebep = interaction.options.getString('sebep') || 'Belirtilmedi';

    try {
      await hedef.timeout(sure * 60 * 1000, sebep);
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xED4245).setTitle('🔇 Kullanıcı Susturuldu')
          .setThumbnail(hedef.user.displayAvatarURL())
          .addFields(
            { name: '👤 Kullanıcı', value: `${hedef} (${hedef.user.tag})`, inline: true },
            { name: '👮 Yetkili', value: `${member}`, inline: true },
            { name: '⏱️ Süre', value: `${sure} dakika`, inline: true },
            { name: '📝 Sebep', value: sebep },
          ).setTimestamp()]
      });
      await logKanalMesaj(guild, {
        renk: 0xED4245, baslik: '🔇 Kullanıcı Susturuldu',
        alanlar: [
          { name: '👤 Kullanıcı', value: `${hedef} (${hedef.user.tag})`, inline: true },
          { name: '👮 Yetkili', value: `${member.user.tag}`, inline: true },
          { name: '⏱️ Süre', value: `${sure} dakika`, inline: true },
          { name: '📝 Sebep', value: sebep },
        ],
      });
    } catch (err) {
      await interaction.reply({ content: `❌ Mute yapılamadı: ${err.message}`, ephemeral: true });
    }
  }

  // ── UNMUTE ──
  else if (commandName === 'unmute') {
    if (!isYonetici(member)) return interaction.reply({ content: '❌ Sadece yöneticiler kullanabilir!', ephemeral: true });

    const hedef = interaction.options.getMember('kullanici');
    try {
      await hedef.timeout(null);
      await interaction.reply({ content: `✅ ${hedef} kullanıcısının susturması kaldırıldı.` });
      await logKanalMesaj(guild, {
        renk: 0x57F287, baslik: '🔊 Susturma Kaldırıldı',
        alanlar: [
          { name: '👤 Kullanıcı', value: `${hedef} (${hedef.user.tag})`, inline: true },
          { name: '👮 Yetkili', value: `${member.user.tag}`, inline: true },
        ],
      });
    } catch (err) {
      await interaction.reply({ content: `❌ Unmute yapılamadı: ${err.message}`, ephemeral: true });
    }
  }

  // ── TİCKET PANELİ ──
  else if (commandName === 'ticket-panel') {
    if (!isYonetici(member)) return interaction.reply({ content: '❌ Sadece yöneticiler kullanabilir!', ephemeral: true });

    const kanal = interaction.options.getChannel('kanal');

    const panelEmbed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🎫 Destek & Ticket Sistemi')
      .setDescription('Bir sorunun mu var? Yardım mı lazım?\nAşağıdaki butona tıklayarak destek talebi oluşturabilirsin!')
      .addFields({ name: '📋 Bilgi', value: '• Her kullanıcı aynı anda 1 ticket açabilir\n• Ticketlar yalnızca yetkililer tarafından kapatılır' })
      .setFooter({ text: 'Dizel Works™' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_ac')
        .setLabel('🎫 Ticket Aç')
        .setStyle(ButtonStyle.Primary),
    );

    await kanal.send({ embeds: [panelEmbed], components: [row] });
    await interaction.reply({ content: `✅ Ticket paneli ${kanal} kanalına gönderildi!`, ephemeral: true });
  }

  // ── AYARLAR ──
  else if (commandName === 'ayarlar') {
    if (!isYonetici(member)) return interaction.reply({ content: '❌ Sadece yöneticiler kullanabilir!', ephemeral: true });

    const getVal = (id) => {
      if (!id) return '❌ Ayarlanmamış';
      return guild.roles.cache.get(id) || guild.channels.cache.get(id) || '❌ Bulunamadı';
    };

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0xFEE75C).setTitle('⚙️ Bot Ayarları')
        .addFields(
          { name: '🌟 Abone Rolü', value: `${getVal(config.aboneRolId)}`, inline: true },
          { name: '👮 Yetkili Rolü', value: `${getVal(config.aboneYetkiliRolId)}`, inline: true },
          { name: '🛡️ Moderatör Rolü', value: `${getVal(config.moderatorRolId)}`, inline: true },
          { name: '⛔ Cezalı Rolü', value: `${getVal(config.cezaliRolId)}`, inline: true },
          { name: '📋 Log Kanalı', value: `${getVal(config.logKanalId)}`, inline: true },
          { name: '👤 Üye Rolü', value: `${getVal(config.uyeRolId)}`, inline: true },
          { name: '🔊 Ses Kanalı', value: `${getVal(config.sesKanalId)}`, inline: true },
          { name: '👋 Hoş Geldin Kanalı', value: `${getVal(config.hosgeldinKanalId)}`, inline: true },
          { name: '📸 Kanıt Kanalı', value: `${getVal(config.kanitKanalId)}`, inline: true },
          { name: '🔍 Kanıt İnceleme Kanalı', value: `${getVal(config.kanitLogKanalId)}`, inline: true },
          { name: '👥 Üye Log Kanalı', value: `${getVal(config.uyeLogKanalId)}`, inline: true },
          { name: '⭐ Media Kanalı', value: `${getVal(config.mediaKanalId)}`, inline: true },
          { name: '🎫 Ticket Kategorisi', value: `${getVal(config.ticketKategoriId)}`, inline: true },
          { name: '📝 Ticket Log Kanalı', value: `${getVal(config.ticketLogKanalId)}`, inline: true },
        ).setTimestamp()],
      ephemeral: true
    });
  }

  // ── AYARLA komutları ──
  else if (commandName === 'ayarla-abone-rol') {
    if (!isYonetici(member)) return interaction.reply({ content: '❌ Sadece yöneticiler!', ephemeral: true });
    config.aboneRolId = interaction.options.getRole('rol').id;
    saveConfig();
    await interaction.reply({ content: `✅ Abone rolü ayarlandı!`, ephemeral: true });
  }
  else if (commandName === 'ayarla-yetkili-rol') {
    if (!isYonetici(member)) return interaction.reply({ content: '❌ Sadece yöneticiler!', ephemeral: true });
    config.aboneYetkiliRolId = interaction.options.getRole('rol').id;
    saveConfig();
    await interaction.reply({ content: `✅ Yetkili rolü ayarlandı!`, ephemeral: true });
  }
  else if (commandName === 'ayarla-moderator-rol') {
    if (!isYonetici(member)) return interaction.reply({ content: '❌ Sadece yöneticiler!', ephemeral: true });
    config.moderatorRolId = interaction.options.getRole('rol').id;
    saveConfig();
    await interaction.reply({ content: `✅ Moderatör rolü ayarlandı!`, ephemeral: true });
  }
  else if (commandName === 'ayarla-cezali-rol') {
    if (!isYonetici(member)) return interaction.reply({ content: '❌ Sadece yöneticiler!', ephemeral: true });
    config.cezaliRolId = interaction.options.getRole('rol').id;
    saveConfig();
    await interaction.reply({ content: `✅ Cezalı rolü ayarlandı!`, ephemeral: true });
  }
  else if (commandName === 'ayarla-log-kanal') {
    if (!isYonetici(member)) return interaction.reply({ content: '❌ Sadece yöneticiler!', ephemeral: true });
    config.logKanalId = interaction.options.getChannel('kanal').id;
    saveConfig();
    await interaction.reply({ content: `✅ Log kanalı ayarlandı!`, ephemeral: true });
  }
  else if (commandName === 'ayarla-uye-rol') {
    if (!isYonetici(member)) return interaction.reply({ content: '❌ Sadece yöneticiler!', ephemeral: true });
    config.uyeRolId = interaction.options.getRole('rol').id;
    saveConfig();
    await interaction.reply({ content: `✅ Üye rolü ayarlandı!`, ephemeral: true });
  }
  else if (commandName === 'ayarla-ses-kanal') {
    if (!isYonetici(member)) return interaction.reply({ content: '❌ Sadece yöneticiler!', ephemeral: true });
    config.sesKanalId = interaction.options.getChannel('kanal').id;
    saveConfig();
    await interaction.reply({ content: `✅ Ses kanalı ayarlandı!`, ephemeral: true });
    joinVoiceChannel();
  }
  else if (commandName === 'ayarla-hosgeldin-kanal') {
    if (!isYonetici(member)) return interaction.reply({ content: '❌ Sadece yöneticiler!', ephemeral: true });
    config.hosgeldinKanalId = interaction.options.getChannel('kanal').id;
    saveConfig();
    await interaction.reply({ content: `✅ Hoş geldin kanalı ayarlandı!`, ephemeral: true });
  }
  else if (commandName === 'ayarla-kanit-kanal') {
    if (!isYonetici(member)) return interaction.reply({ content: '❌ Sadece yöneticiler!', ephemeral: true });
    config.kanitKanalId = interaction.options.getChannel('kanal').id;
    saveConfig();
    await interaction.reply({ content: `✅ Kanıt kanalı ayarlandı!`, ephemeral: true });
  }
  else if (commandName === 'ayarla-kanit-log-kanal') {
    if (!isYonetici(member)) return interaction.reply({ content: '❌ Sadece yöneticiler!', ephemeral: true });
    config.kanitLogKanalId = interaction.options.getChannel('kanal').id;
    saveConfig();
    await interaction.reply({ content: `✅ Kanıt inceleme kanalı ayarlandı!`, ephemeral: true });
  }
  else if (commandName === 'ayarla-uye-log-kanal') {
    if (!isYonetici(member)) return interaction.reply({ content: '❌ Sadece yöneticiler!', ephemeral: true });
    config.uyeLogKanalId = interaction.options.getChannel('kanal').id;
    saveConfig();
    await interaction.reply({ content: `✅ Üye log kanalı ayarlandı!`, ephemeral: true });
  }
  else if (commandName === 'ayarla-ticket-kategori') {
    if (!isYonetici(member)) return interaction.reply({ content: '❌ Sadece yöneticiler!', ephemeral: true });
    config.ticketKategoriId = interaction.options.getChannel('kategori').id;
    saveConfig();
    await interaction.reply({ content: `✅ Ticket kategorisi ayarlandı!`, ephemeral: true });
  }
  else if (commandName === 'ayarla-ticket-log-kanal') {
    if (!isYonetici(member)) return interaction.reply({ content: '❌ Sadece yöneticiler!', ephemeral: true });
    config.ticketLogKanalId = interaction.options.getChannel('kanal').id;
    saveConfig();
    await interaction.reply({ content: `✅ Ticket log kanalı ayarlandı!`, ephemeral: true });
  }
  else if (commandName === 'ayarla-media-kanal') {
    if (!isYonetici(member)) return interaction.reply({ content: '❌ Sadece yöneticiler!', ephemeral: true });
    config.mediaKanalId = interaction.options.getChannel('kanal').id;
    saveConfig();
    await interaction.reply({ content: `✅ Media kanalı ayarlandı!`, ephemeral: true });
  }
});

// ─────────────────────────────────────────────
// Yardımcı fonksiyonlar
// ─────────────────────────────────────────────
async function logKanalMesaj(guild, { renk, baslik, alanlar, footer, aciklama }) {
  if (!config.logKanalId) return;
  const kanal = guild.channels.cache.get(config.logKanalId);
  if (!kanal) return;

  const embed = new EmbedBuilder()
    .setColor(renk || 0x5865F2).setTitle(baslik).setTimestamp()
    .setFooter({ text: footer || 'Dizel Works™ Bot', iconURL: guild.client.user.displayAvatarURL() });

  if (aciklama) embed.setDescription(aciklama);
  if (alanlar) embed.addFields(alanlar);

  await kanal.send({ embeds: [embed] });
}

function isYonetici(member) {
  return member.permissions.has(PermissionsBitField.Flags.Administrator);
}

function isAboneYetkilisi(member) {
  if (isYonetici(member)) return true;
  if (!config.aboneYetkiliRolId) return false;
  return member.roles.cache.has(config.aboneYetkiliRolId);
}

function isModeratorYaYonetici(member) {
  if (isYonetici(member)) return true;
  if (!config.moderatorRolId) return false;
  return member.roles.cache.has(config.moderatorRolId);
}

function saveConfig() {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

process.on('unhandledRejection', err => console.error('Unhandled rejection:', err));
process.on('uncaughtException', err => console.error('Uncaught exception:', err));

client.login(TOKEN).catch(err => {
  console.error('❌ Giriş hatası:', err.message);
  process.exit(1);
});
