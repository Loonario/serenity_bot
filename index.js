// const express = require('express')
require('dotenv').config()
if (process.env.NODE_ENV == 'development') {
  require('dotenv').config({ path: '.env.dev' })
}
const {
  Telegraf,
  Markup,
  Scenes: { WizardScene, Stage },
  session,
} = require('telegraf')
const { leave } = Stage
const Airtable = require('airtable')
const gsWizard = require('./user/wizards/graveServiceWizard')
const setAdminWizard = require('./admin/wizards/setAdmin')
const { userCommands } = require('./user/variables')
const { adminCommands } = require('./admin/variables')
const remove_kb = Markup.removeKeyboard()
const superAdmin = process.env.SUPERADMIN_CHATID
//const SceneGenerator = require('./Scenes')
// const curScene = new SceneGenerator()
// const nameScene = curScene.NameScene()
// const app = express()
// Airtable.configure({
//   endpointUrl: 'https://api.airtable.com',
//   apiKey: process.env.AIRTABLE_API_KEY,
// })
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID,
)
const tableUsers = process.env.AIRTABLE_USERS_TABLE_ID
let currentUser = {}

//Admin stage
const adminStage = new Stage([setAdminWizard])
setAdminWizard.enter(async ctx => {
  await ctx.reply('ID?')
})

adminStage.hears('Вийти', async ctx => {
  await ctx.reply('Оберіть послугу в Меню', remove_kb)
  return ctx.scene.leave()
})

// User services stage
const userStage = new Stage([gsWizard])
gsWizard.enter(async ctx => {
  await ctx.reply('Будь-ласка, вкажіть ПІБ людини')
})

userStage.hears('Вийти', async ctx => {
  await ctx.reply('Оберіть послугу в Меню', remove_kb)
  return ctx.scene.leave()
})

userStage.hears('Підтвердити', async ctx => {
  await ctx.reply(
    'Дякую, Ваші дані прийняті. Скоро ми надішлемо фото для звірки',
    remove_kb,
  )
  return ctx.scene.leave()
})

// Bot initialization
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
//bot.use(Telegraf.log())
bot.use(session(), userStage.middleware(), adminStage.middleware())

//BOT commands listeners
//User's commands
const userCommandsHandlers = () => {
  bot.command('grave_service', async ctx => {
    try {
      await ctx.reply(
        'Ви обрали послугу "Догляд за могилою". Далі буде дкілька питань, після чого ми надішлемо фото для попередньої звірки. Після підтверждення, ми доглянемо за могилою і надішлемо фото результату. Послуга коштує 39$.',
      )
      await ctx.scene.enter('graveServiceScene')
    } catch (err) {
      console.error(err)
    }
  })
}
userCommandsHandlers()

// Admin's commands
const adminCommandsHandlers = () => {
  bot.command('set_admin', async ctx => {
    try {
      await ctx.reply('Щоб призначити адміна, вкажіть ID його чата')
      await ctx.scene.enter('setAdminScene')
    } catch (err) {
      console.error(err)
    }
  })
}
bot.action('cancel_admin_invite', async ctx => {
  try {
    await ctx.answerCbQuery()
    console.log('Admin invite Canceled')
    await ctx.reply(`Ви відхилили запрошення стати Адміном`)
    await bot.telegram.sendMessage(
      superAdmin,
      `Користувач ${ctx.from.first_name}, відхилив запрошення стати адміном`,
    )
  } catch (err) {
    await ctx.answerCbQuery()
    console.error(err)
  }
})
bot.action('accept_admin_invite', async ctx => {
  try {
    await ctx.answerCbQuery()
    console.log('Admin invite Accepted')
    base(tableUsers).update(
      [
        {
          id: currentUser.airtable_id,
          fields: {
            role: 'Admin',
          },
        },
      ],
      async function (err, records) {
        if (err) {
          console.error(err)
          return
        }
        if (records.length > 0) {
          currentUser.role = records[0].get('role')
          await bot.telegram.setMyCommands(adminCommands)
          await ctx.reply(`Привіт Адмін`)
          await bot.telegram.sendMessage(
            superAdmin,
            `Користувач ${ctx.from.first_name} - новий адмін бота`,
          )
        }
      },
    )
  } catch (err) {
    console.error(err)
  }
})
adminCommandsHandlers()

//Find or Create user in Airtable
const findUser = async chatId => {
  await bot.telegram.sendMessage(
    chatId,
    `Ми перевіряємо Ваш обліковий запис...`,
  )
  base(tableUsers)
    .select({
      filterByFormula: `{chat_id}=${chatId}`,
      view: 'Grid view',
      maxRecords: 1,
    })
    .firstPage(async function (err, records) {
      console.log('Searching user in Airtable')
      if (err) {
        console.error(err)
        return
      }
      if (records.length > 0) {
        //console.log('Retrieved', record.get('chat_id'))
        currentUser.role = records[0].get('role')
        currentUser.airtable_id = records[0].getId()
        console.log(currentUser)
        if (currentUser.role === 'User') {
          await bot.telegram.sendMessage(
            chatId,
            `Обліковий запис знайдено. Дякую, що зачекали`,
          )
          await bot.telegram.setMyCommands(userCommands)
          await bot.telegram.sendMessage(
            chatId,
            `В Меню Ви можете обрати бажану послугу.`,
          )
        } else if (currentUser.role === ('Super_Admin' || 'Admin')) {
          await bot.telegram.setMyCommands(adminCommands)
          await bot.telegram.sendMessage(chatId, `Привіт Адмін`)
        }
        console.log(records[0].getId())
        return records[0].getId()
      } else {
        base(tableUsers).create(
          [
            {
              fields: {
                chat_id: chatId,
                first_name: currentUser.first_name,
                last_name: currentUser.last_name,
                role: 'User',
              },
            },
          ],
          async function (err, records) {
            if (err) {
              console.error(err)
              return
            }
            console.log('Creating user in Airtable')
            //console.log('Retrieved', record.get('chat_id'))
            currentUser.role = records[0].get('role')
            currentUser.airtable_id = records[0].getId()
            console.log(currentUser)
            if (currentUser.role === 'User') {
              await bot.telegram.setMyCommands(userCommands)
              await bot.telegram.sendMessage(
                chatId,
                `Ваш обліковий запис створено.`,
              )
            } else if (currentUser.role === ('Super_Admin' || 'Admin')) {
              await bot.telegram.setMyCommands(adminCommands)
              await bot.telegram.sendMessage(chatId, `Привіт Адмін`)
            }
          },
        )
        return
      }
    })
}

// Bot start
const start = () => {
  bot.start(async ctx => {
    try {
      await ctx.reply(
        `Моє шанування, ${ctx.message.from.first_name}. Вас вітає сервіс Сиреніті, ми допомагаємо зберегти спокій та безтурботність.`,
        remove_kb,
      )
      //console.log(ctx)
      if (!currentUser.role) {
        currentUser = Object.assign({}, ctx.from)
        await findUser(ctx.chat.id)
      } else if (currentUser.role === 'User') {
        await ctx.reply(`В Меню Ви можете обрати бажану послугу.`)
      } else if (currentUser.role === ('Super_Admin' || 'Admin')) {
        await ctx.reply(`Привіт Адмін`)
      }
      console.log(ctx.chat.id)
    } catch (err) {
      console.log(err)
    }
  })
}
start()

if (process.env.NODE_ENV == 'development') {
  // if local use Long-polling
  bot.launch().then(() => {
    console.info(`The bot ${bot.botInfo.username} is running locally`)
  })
} else {
  // Launch on webhook
  bot
    .launch({
      webhook: {
        domain: process.env.APP_DOMAIN, // Your domain URL (where server code will be deployed)
        port: process.env.PORT || 3000,
      },
    })
    .then(() => {
      console.info(`The bot ${bot.botInfo.username} is running on server`)
    })
}
process.once('SIGINT', () => app.stop('SIGINT'))
process.once('SIGTERM', () => app.stop('SIGTERM'))
