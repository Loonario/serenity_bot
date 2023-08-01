const {
  Telegraf,
  Markup,
  Scenes: { WizardScene, Stage },
  Composer,
  session,
} = require('telegraf')
let bot
if (process.env.NODE_ENV == 'development') {
  // if environment is "development"
  bot = new Telegraf(process.env.TEST_BOT_TOKEN)
} else {
  // Else webhook
  // if environment is "Production"
  bot = new Telegraf(process.env.BOT_TOKEN)
  //bot.startWebhook(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/setWebhook?url=${process.env.APP_DOMAIN}&drop_pending_updates=true`, null, 3000,) // Setting webhook URL path
  //bot.startWebhook('/', null, 8443)
}
const chatIdHandler = Telegraf.on('text', async ctx => {
  try {
    console.log(ctx.message.text)
    let chatId = ctx.message.text
    if (chatId) {
      await bot.telegram.sendMessage(
        chatId,
        'Вас запрошують стати адміном даного бота',
        Markup.inlineKeyboard([
          [
            Markup.button.callback('Відхилити', 'cancel_admin_invite'),
            Markup.button.callback('Прийняти', 'accept_admin_invite'),
          ],
        ]),
      )
    }
  } catch (err) {
    console.log(err)
  }
})

const setAdmin = new WizardScene('setAdminScene', chatIdHandler)
setAdmin.enter(async ctx => {
  try {
    await ctx.reply('Вкажіть chat_ID')
  } catch (err) {
    console.log(err)
  }
})
module.exports = setAdmin
