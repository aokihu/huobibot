const Huobi = require('huobi')
const Bot = require('./index.js')
const keys = require('./key.js')

const LOG=console.log
let hb = new Huobi({accessKey:keys.access, secretKey:keys.secret})
let bot = new Bot(hb)


const TYPE = 2
const COIN_TYPE = ['','btc','ltc']
const MAX_COST = 10

let count = 0
let currency = MAX_COST

bot.init(COIN_TYPE[TYPE],function() {

})

bot.loop(COIN_TYPE[TYPE],function() {


  LOG('\033[2J\033[1;1H')

  LOG('账户信息 总资产 ', hb.balance.total)
  LOG('-----------------------------------------------------------')
  LOG('CNY: ', hb.balance.cny, '  BTC: ', hb.balance.btc, '   LTC: ', hb.balance.ltc)
  LOG('使用金额: ', currency, '\n')

  LOG('初始价格: ', bot.begin.toFixed(2), '当前最高价: ', bot.max.toFixed(2), '当前最低价: ', bot.min.toFixed(2), '差价: ',(bot.max-bot.min).toFixed(2))
  LOG('涨跌幅度: ', bot.loss.toFixed(4)+"%")
  LOG('历史平均值:',bot.avg().toFixed(2), ' Last:',bot.last.toFixed(2), ' Delta:',bot.delta.toFixed(4), ' STD:',bot.std().toFixed(4))
  LOG('Delta History:', bot.avgDelta.toFixed(4))
  LOG("----------------------------------------------------------")

  if(bot.avgDelta > 0 && bot.delta > 0){

    count++

    if(count > 5 && currency >= 0){

      let buyPrice = bot.buyPrice([0.9999,0.9996,0.9994]).tolist()
      let sellPrice = bot.sellPrice([0.9999,0.9996,0.9994]).tolist()
      console.log('Buy @', buyPrice)
      console.log('Sell @', sellPrice)


      buyPrice.forEach(price => {
        hb.buy({type:TYPE, amount:0.01, price:price.toFixed(2)})
        .then(data => currency -= (price*0.01))
        .catch(LOG)
      });


      sellPrice.forEach(price => {
        hb.sell({type:TYPE, amount:0.01, price:price.toFixed(2)})
        .then(LOG)
        .catch(LOG)
      });


      count = 0

    }


  }

  if(bot.avgDelta < 0 && bot.delta < 0){
    count = 0
  }
})
