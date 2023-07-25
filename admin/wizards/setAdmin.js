const {
  Telegraf,
  Markup,
  Scenes: { WizardScene, Stage },
  Composer,
  session,
} = require('telegraf')

const chatIdHandler = Telegraf.on('text', async ctx => {
  try {
    console.log(ctx.message.text)
  } catch (err) {
    console.log(err)
  }
})

const setAdmin = new WizardScene('setAdminScene', chatIdHandler)
setAdmin.enter(async ctx => {
  try {
    await ctx.reply('Вкажіть chat_ID', exit_kb)
  } catch (err) {
    console.log(err)
  }
})
module.exports = setAdmin
