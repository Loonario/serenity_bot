const { Scenes, Composer } = require('telegraf')

class SceneGenerator {
  NameScene() {
    const name = new Scenes.BaseScene('name')
    name.enter(async ctx => {
      await ctx.reply('Пожалуйста, укажите ФИО человека')
    })
    name.on('text', async ctx => {
      const deadmanName = ctx.message.text
      const deadmanNameArr = deadmanName.split(' ')
      if (
        deadmanName &&
        deadmanNameArr.length >= 2 &&
        deadmanNameArr.length <= 3
      ) {
        ctx.reply('Спасибо')
        return ctx.wizard.next()
        //ctx.scene.enter('yearOfBirth')
      } else {
        ctx.reply(
          'Пожалуйста, введите ФИО в формате "Фамилия Имя Отчество" или "Фамилия Имя" ',
        )
        ctx.scene.reenter()
      }
    })
    //return name
  }

  YearOfBirthScene() {
    const yearOfBirth = new Scenes.BaseScene('yearOfBirth')
    yearOfBirth.enter(async ctx => {
      await ctx.reply('Пожалуйста, укажите год рождения человека!')
    })
    yearOfBirth.on('text', async ctx => {
      const deadmanYearOfBirth = Number(ctx.message.text)
      if (deadmanYearOfBirth && deadmanYearOfBirth > 0) {
        ctx.reply('Спасибо')
        ctx.scene.enter('yearOfDeath')
      } else {
        ctx.reply('Пожалуйста, введите год в формате 1920')
        ctx.scene.reenter()
      }
    })
    return yearOfBirth
  }

  YearOfDeathScene() {
    const yearOfDeath = new Scenes.BaseScene('yearOfDeath')
    yearOfDeath.enter(async ctx => {
      await ctx.reply('Пожалуйста, укажите год смерти человека.')
    })
    yearOfDeath.on('text', async ctx => {
      const deadmanYearOfBirth = Number(ctx.message.text)
      if (deadmanYearOfBirth && deadmanYearOfBirth > 0) {
        ctx.reply('Спасибо')
        ctx.scene.enter('location')
      } else {
        ctx.reply('Пожалуйста, введите год в формате 1920')
        ctx.scene.reenter()
      }
    })
    return yearOfDeath
  }

  LocationScene() {
    const location = new Scenes.BaseScene('location')
    location.enter(async ctx => {
      await ctx.reply(
        'Пожалуйста, укажите область и населенный пункт, где размещено кладбище',
      )
    })
    location.on('text', async ctx => {
      if (ctx.message.text) {
        ctx.reply('Спасибо')
        ctx.scene.enter('place')
      } else {
        ctx.scene.reenter()
      }
    })
    return location
  }

  PlaceScene() {
    const place = new Scenes.BaseScene('place')
    place.enter(async ctx => {
      await ctx.reply('Пожалуйста, укажите номер участка, если Вам известен')
    })
    place.on('text', async ctx => {
      if (ctx.message.text) {
        ctx.reply(
          'Спасибо, Ваши данные приняты. Скоро мы вышлем фото для подтверждения',
        )
        ctx.scene.leave()
      } else {
        ctx.scene.reenter()
      }
    })
    return place
  }
}
module.exports = SceneGenerator
