const {
  Telegraf,
  Markup,
  Scenes: { WizardScene, Stage },
  Composer,
  session,
} = require('telegraf')

const exit_kb = Markup.keyboard(['Выйти']).resize().oneTime()
const remove_kb = Markup.removeKeyboard()
const exit_back_kb = Markup.keyboard([['Выйти', 'Назад']]).resize()
const exit_back_approve_kb = Markup.keyboard([
  ['Выйти', 'Назад'],
  ['Подтвердить'],
]).resize()

// const kb = Markup.inlineKeyboard([
//   Markup.callbackButton('Item 1', 'exit'),
//   Markup.callbackButton('Item 2', 'item2'),
//   Markup.callbackButton('Item 3', 'item3'),
//   Markup.callbackButton('Item 4', 'item4'),
// ]).extra()

const nameHandler = Telegraf.on('text', async ctx => {
  try {
    const deadmanName = ctx.message.text
    const deadmanNameArr = deadmanName.split(' ')
    if (
      deadmanName != 'Выйти' &&
      deadmanName &&
      deadmanNameArr.length >= 2 &&
      deadmanNameArr.length <= 3
    ) {
      ctx.scene.state.name = ctx.message.text
      await ctx.reply(
        'Спасибо. Пожалуйста, укажите год рождения человека.',
        exit_back_kb,
      )
      return ctx.wizard.next()
    } else {
      ctx.reply(
        'Пожалуйста, введите ФИО в формате "Фамилия Имя Отчество" или "Фамилия Имя" ',
      )
    }
  } catch (err) {
    console.log(err)
  }
})

const yearOfBirthHandler = Telegraf.on('text', async ctx => {
  try {
    const deadmanYearOfBirth = Number(ctx.message.text)
    const currentYear = new Date().getFullYear()
    if (ctx.message.text === 'Назад') {
      await ctx.reply('Пожалуйста, укажите ФИО человека', exit_kb)
      return ctx.wizard.back()
    }
    if (
      deadmanYearOfBirth &&
      deadmanYearOfBirth > 0 &&
      deadmanYearOfBirth <= currentYear
    ) {
      ctx.scene.state.yearOfBirth = deadmanYearOfBirth
      await ctx.reply(
        'Спасибо. Пожалуйста, укажите год смерти человека.',
        exit_back_kb,
      )
      return ctx.wizard.next()
    } else {
      await ctx.reply(
        'Пожалуйста, введите год в формате 1920. Год не может быть более текущего.',
      )
    }
  } catch (err) {
    console.log(err)
  }
})

const yearOfDeathHandler = Telegraf.on('text', async ctx => {
  try {
    const deadmanYearOfDeath = Number(ctx.message.text)
    const currentYear = new Date().getFullYear()
    if (ctx.message.text === 'Назад') {
      await ctx.reply(
        'Пожалуйста, укажите год рождения человека.',
        exit_back_kb,
      )
      return ctx.wizard.back()
    }
    if (
      deadmanYearOfDeath &&
      deadmanYearOfDeath > 0 &&
      deadmanYearOfDeath <= currentYear &&
      deadmanYearOfDeath >= ctx.scene.state.yearOfBirth
    ) {
      ctx.scene.state.yearOfDeath = deadmanYearOfDeath
      await ctx.reply(
        'Спасибо. Пожалуйста, укажите область и населенный пункт, где размещено кладбище.',
        exit_back_kb,
      )
      return ctx.wizard.next()
    } else {
      await ctx.reply(
        'Пожалуйста, введите год в формате 1950. Год не может быть более текущего и менее года рождения.',
      )
    }
  } catch (err) {
    console.log(err)
  }
})

const locationHandler = Telegraf.on('text', async ctx => {
  try {
    if (ctx.message.text === 'Назад') {
      await ctx.reply('Пожалуйста, укажите год смерти человека.', exit_back_kb)
      return ctx.wizard.back()
    }
    if (ctx.message.text) {
      ctx.scene.state.location = ctx.message.text
      await ctx.reply(
        'Спасибо. Пожалуйста, укажите номер участка, если Вам известен.',
        exit_back_kb,
      )
      return ctx.wizard.next()
    } else {
      await ctx.reply('Пожалуйста, укажите номер участка, если Вам известен.')
    }
  } catch (err) {
    console.log(err)
  }
})

const placeHandler = Telegraf.on('text', async ctx => {
  try {
    ctx.session.name = ctx.scene.state.name
    ctx.session.yearOfBirth = ctx.scene.state.yearOfBirth
    ctx.session.yearOfDeath = ctx.scene.state.yearOfDeath
    ctx.session.location = ctx.scene.state.location
    ctx.session.place = ctx.message.text
    if (ctx.message.text === 'Назад') {
      await ctx.reply(
        'Пожалуйста, укажите область и населенный пункт, где размещено кладбище.',
        exit_back_kb,
      )
      return ctx.wizard.back()
    }
    await ctx.replyWithHTML(
      `Пожалуйста, проверьте внесенный данные.
      <b>ФИО:</b>
       ${ctx.session.name}
       <b>Годы жизни:</b>
       ${ctx.session.yearOfBirth} – ${ctx.session.yearOfDeath}
       <b>Место захоронения:</b>
       ${ctx.session.location}
       <b>Участок:</b>
       ${ctx.session.place}
       `,
      exit_back_approve_kb,
    )
    return ctx.wizard.next()
  } catch (err) {
    console.log(err)
  }
})

const lastStep = Telegraf.on('text', async ctx => {
  try {
    if (ctx.message.text === 'Назад') {
      await ctx.reply(
        'Пожалуйста, укажите номер участка, если Вам известен.',
        exit_back_kb,
      )
      return ctx.wizard.back()
    }
  } catch (err) {
    console.log(err)
  }
})

const graveServiceScene = new WizardScene(
  'graveServiceScene',
  nameHandler,
  yearOfBirthHandler,
  yearOfDeathHandler,
  locationHandler,
  placeHandler,
  lastStep,
)
graveServiceScene.enter(async ctx => {
  try {
    await ctx.reply('Пожалуйста, укажите ФИО человека', exit_kb)
  } catch (err) {
    console.log(err)
  }
})

module.exports = graveServiceScene
