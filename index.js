const nj = require('numjs')
const Promise = require('bluebird')


class Bot {

  constructor(huobiapi) {
    this.hb = huobiapi
    this._history = new Array(10)
    this._delta_history = new Array(10)
    this._delta = 0
    this._last = 0
    this._min  = 0
    this._max = 0
    this._begin = 0 // 初始价位
  }

  //
  // 框架方法
  //
  init(type,fn){

    this.hb.getNow({type:type})
    .then(data => this._begin = data.ticker.last)


    fn(this.hb)
  }

  loop(type,func){

    // 获取最新交易数据
    this.hb.getNow({type:type})
    .then(data => {
      this._last = data.ticker.last
      this._history.shift()
      this._history.push(this._last)

      let history = nj.array(this._history, 'float32')
      this._min = history.min()
      this._max = history.max()

      this._delta = this._last - history.mean()
      this._delta_history.shift()
      this._delta_history.push(this._delta)

    })
    .catch(err => console.log(err))
    .finally(() => {
      // 执行用户方法
      func(this.hb)
      setTimeout(() => {this.loop(type,func)}, Bot.LOOP_TIME)
    })

  }

  /**
   * @function avg
   * @abstract 计算平均值
   */

  avg(){
    let result = nj.array(this._history,'float32').mean()
    return result
  }


  /**
   * @function std
   * @abstract 计算均方差
   */
  std(){
    return nj.array(this._history, 'float3232').std()
  }

  /**
   * @function buyPrice
   */

  buyPrice(rate){
    return nj.array(rate).multiply(this._min)
  }

  sellPrice(rate){
    return nj.array(rate).multiply(this._max)
  }

  /**
   * @function last
   * @abstract 获取最新币值
   * @param {String} type 币种类型，比特币=btc， 莱特币=ltc
   */
  get last(){
    return this._last
  }

  get begin(){
    return this._begin
  }

  get min(){
    return this._min
  }

  get max(){
    return this._max
  }

  get loss(){
    return (this._max - this._begin)/this._begin
  }

  get delta(){
    return this._delta
  }

  get deltaHistory(){
    return this._delta_history
  }

  get avgDelta(){
    return nj.array(this._delta_history).mean()
  }

  get stdDelta(){
    return nj.array(this._delta_history).std()
  }


}

Bot.LOOP_TIME = 200

module.exports = Bot
