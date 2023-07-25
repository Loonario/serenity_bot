const {
  Telegraf,
  Markup,
  Scenes: { WizardScene, Stage },
  Composer,
  session,
} = require('telegraf')

const exit_kb = Markup.keyboard(['Вийти']).resize().oneTime()
const remove_kb = Markup.removeKeyboard()
const exit_back_kb = Markup.keyboard([['Вийти', 'Назад']]).resize()
const exit_back_approve_kb = Markup.keyboard([
  ['Вийти', 'Назад'],
  ['Підтвердити'],
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
      deadmanName != 'Вийти' &&
      deadmanName &&
      deadmanNameArr.length >= 2 &&
      deadmanNameArr.length <= 3
    ) {
      ctx.scene.state.name = ctx.message.text
      await ctx.reply(
        'Дякую. Будь-ласка, вкажіть рік народження людини.',
        exit_back_kb,
      )
      return ctx.wizard.next()
    } else {
      ctx.reply(
        'Будь-ласка, введіть ПІБ в форматі "Прізвище Імʼя По-батькові" або "Прізвище Імʼя" ',
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
      await ctx.reply('Будь-ласка, вкажіть ПІБ людини', exit_kb)
      return ctx.wizard.back()
    }
    if (
      deadmanYearOfBirth &&
      deadmanYearOfBirth > 0 &&
      deadmanYearOfBirth <= currentYear
    ) {
      ctx.scene.state.yearOfBirth = deadmanYearOfBirth
      await ctx.reply(
        'Дякую. Будь-ласка, вкажіть рік смерті людинин.',
        exit_back_kb,
      )
      return ctx.wizard.next()
    } else {
      await ctx.reply(
        'Будь-ласка, введіть рік в форматі 1920. Рік не може бути більше поточного.',
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
        'Будь-ласка, вкадіть рік народження людини.',
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
        'Дякую. Будь-ласка, вкажіть область та населений пункт, де знаходиться кладовище.',
        exit_back_kb,
      )
      return ctx.wizard.next()
    } else {
      await ctx.reply(
        'Будь-ласка, введіть рік в форматі 1920. Рік не може бути більше поточного і менше року народження.',
      )
    }
  } catch (err) {
    console.log(err)
  }
})

const locationHandler = Telegraf.on('text', async ctx => {
  try {
    if (ctx.message.text === 'Назад') {
      await ctx.reply('Будь-ласка, вкажіть рік смерті людинин.', exit_back_kb)
      return ctx.wizard.back()
    }
    if (ctx.message.text) {
      ctx.scene.state.location = ctx.message.text
      await ctx.reply(
        'Дякую. Будь-ласка, вкажіть номер ділянки, якщо Вам відомо.',
        exit_back_kb,
      )
      return ctx.wizard.next()
    } else {
      await ctx.reply('Будь-ласка, вкажіть номер ділянки, якщо Вам відомо.')
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
        'Будь-ласка, вкажіть область та населений пункт, де знаходиться кладовище.',
        exit_back_kb,
      )
      return ctx.wizard.back()
    }
    await ctx.replyWithHTML(
      `Будь-ласка, перевірте внесені дані.
      <b>ПІБ:</b>
       ${ctx.session.name}
       <b>Роки життя:</b>
       ${ctx.session.yearOfBirth} – ${ctx.session.yearOfDeath}
       <b>Місце поховання:</b>
       ${ctx.session.location}
       <b>Ділянка:</b>
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
        'Будь-ласка, вкажіть номер ділянки, якщо Вам відомо.',
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
    await ctx.reply('Будь-ласка вкажіть ПІБ людини', exit_kb)
  } catch (err) {
    console.log(err)
  }
})
module.exports = graveServiceScene
