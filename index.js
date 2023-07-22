require('dotenv').config()
const {
  Telegraf,
  Markup,
  Scenes: { WizardScene, Stage },
  session,
} = require('telegraf')
const { message } = require('telegraf/filters')
const gsWizard = require('./wizards/graveServiceWizard')
const remove_kb = Markup.removeKeyboard()
//const SceneGenerator = require('./Scenes')
// const curScene = new SceneGenerator()
// const nameScene = curScene.NameScene()

gsWizard.enter(async ctx => {
  await ctx.reply('Пожалуйста, укажите ФИО человека')
})

const gsStage = new Stage([gsWizard])
gsStage.hears('Выйти', ctx => {
  ctx.reply('Выберити услугу в Меню', remove_kb)
  return ctx.scene.leave()
})
gsStage.hears('Подтвердить', ctx => {
  ctx.reply(
    'Спасибо, Ваши данные приняты. Скоро мы вышлем фото для сверки',
    remove_kb,
  )
  return ctx.scene.leave()
})
let bot
if (process.env.environment == 'production') {
  // if environment is "Production"
  bot = new Telegraf(process.env.BOT_TOKEN)
  // bot.startWebhook(`/${BOT_TOKEN}`, null, 3000) // Setting webhook URL path
} else {
  // Else local
  bot = new Telegraf(process.env.TEST_BOT_TOKEN)
}

// const bot = new Telegraf(process.env.BOT_TOKEN)
//bot.use(Telegraf.log())
bot.use(session(), gsStage.middleware())

bot.telegram.setMyCommands([
  { command: '/start', description: 'Начало общения' },
  { command: '/grave_service', description: 'Услуга ухода за могилой (1 раз)' },
])

bot.start(async ctx => {
  try {
    await ctx.reply(
      `Здравствуйте ${ctx.message.from.first_name}. Вас приветствует сервис Сиренити, мы помогаем сохранять безмятежность.`,
      remove_kb,
    )
    await ctx.reply(`В Меню Вы можете выбрать желаемую услугу.`)
  } catch (err) {
    console.log(err)
  }
})

bot.command('grave_service', async ctx => {
  try {
    await ctx.reply(
      'Вы выбрали услугу "Уход за могилой". Далее будет несколько вопросов, после чего мы пришлём фото для сверки. После подтверждения, мы поухаживаем за могилой, вышлем фото результата. Услуга стоит 39$.',
    )
    await ctx.scene.enter('graveServiceScene')
  } catch (err) {
    console.log(err)
  }
})

if (process.env.environment == 'production') {
  bot
    .launch({
      webhook: {
        domain: process.env.APP_DOMAIN, // Your domain URL (where server code will be deployed)
        port: process.env.PORT || 8000,
      },
    })
    .then(() => {
      console.info(`The bot ${bot.botInfo.username} is running on server`)
    })
} else {
  // if local use Long-polling
  bot.launch().then(() => {
    console.info(`The bot ${bot.botInfo.username} is running locally`)
  })
}
process.once('SIGINT', () => app.stop('SIGINT'))
process.once('SIGTERM', () => app.stop('SIGTERM'))

// const graveServiceOptions = {
//   reply_markup: JSON.stringify({
//     inline_keyboard: [
//       [
//         { text: 'Отменить', callback_data: 'cancel' },
//         { text: 'Подтвердить', callback_data: 'approved' },
//       ],
//     ],
//     resize_keyboard: true,
//   }),
// }

// Listen for any kind of message. There are different kinds of
// messages.

// const start = () => {
//   bot.command

//   bot.on('message', async msg => {
//     const text = msg.text
//     const chatId = msg.chat.id
//     const firstName = msg.from.first_name
//     if (text === '/start') {
//       await bot.sendMessage(
//         chatId,
//         `Здравствуйте ${firstName}. Вас приветствует сервис Сиренити, мы помогаем сохранять безмятежность.`,
//       )
//       return bot.sendMessage(
//         chatId,
//         `Вы можете написать нам Фамилию Имя Отчество, года жизни, населенный пункт (либо конкретное кладбище), где человек похоронен.
//       Далее мы пришлём фото для сверки.
//       После подтверждения, мы поухаживаем за могилой, вышлем фото результата. Услуга стоит 39$.
//       Также, можем выполнить любые Ваши дополнительные просьбы и пожелания.`,
//       )
//     }
//     if (text === '/grave_service') {
//       return bot.sendMessage(
//         chatId,
//         `Пожалуйста, укажите:
//       ФИО
//       Годы жизни
//       Населенный пункт (и название кладбища)`,
//       )
//     } else {
//       console.log(msg)
//       bot.sendMessage(chatId, 'Я не смог понять Ваше сообщение')
//     }
//   })

//   bot.on('callback_query', msg => {
//     console.log(msg)
//   })
// }

// start()
