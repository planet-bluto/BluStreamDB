import { Snowflake } from '@sapphire/snowflake';
import { Table, Column, Model, BelongsTo, ForeignKey, HasMany, BelongsToMany, AfterSave, AfterCreate, AfterUpdate, BeforeUpdate, BeforeSave, Default, AfterDestroy } from 'sequelize-typescript';

import { ChargeType, ChargeTypeInfo } from '../types/charge_type';

const snowflake = new Snowflake(SNOWFLAKE_EPOCH);

import Chatter from "./Chatter"
import Charge from "./Charge"
import Stream from './Stream';
import SparkStream from './SparkStream';
import { SocketIO } from '../modules/server';
import { pushEvent } from '../modules/socket';
import { EVOLVE_AMOUNT } from '../types/charge_presets';

@Table
export default class Spark extends Model {
  @Default(String(snowflake.generate()))
  @Column({ primaryKey: true })
  id: string;

  @Column
  requestId: string;

  @Default(false)
  @Column
  evolved: boolean;



  @ForeignKey(() => Chatter)
  @Column
  chatterId: string;

  @BelongsTo(() => Chatter, {onDelete: "CASCADE", onUpdate: "CASCADE", hooks: true})
  chatter: Chatter;



  @HasMany(() => Charge, {onDelete: "CASCADE", onUpdate: "CASCADE", hooks: true})
  charges: Charge[];


  
  @BelongsToMany(() => Stream, { through: (() => SparkStream), onDelete: "CASCADE", onUpdate: "CASCADE", hooks: true })
  streams: Stream[];



  async totalCharge(type?: ChargeType): Promise<number> {
    let total = 0;

    let charges = await this.$get("charges")

    charges?.forEach(charge => {
      total += (type == null || type == charge.type ? charge.amount : 0)
    })

    return total
  }



  async prominentCharge(): Promise<ChargeType> {
    let total = 0;

    let charges = await this.$get("charges")
    let chargeDict: {[type in ChargeType]: number} = {
      bolta: 0,
      codec: 0,
      malo: 0,
      muse: 0,
      visu: 0
    }

    charges?.forEach(charge => {
      chargeDict[charge.type] += charge.amount
    })

    return (Object.keys(chargeDict) as ChargeType[]).sort((a, b) => chargeDict[b] - chargeDict[a])[0]
  }

  async toCleanJSON(isDeleted: boolean = false) {
    if (!isDeleted) { await this.reload({include: [Charge, Stream]}) }
    let jsonObj = this.toJSON()
    jsonObj["total_charge"] = await this.totalCharge()

    let prominentCharge = await this.prominentCharge()
    jsonObj["prominent_charge"] = prominentCharge
    jsonObj["color"] = ChargeTypeInfo[prominentCharge].color
    return jsonObj
  }
  


  @AfterCreate
  static async fireBirthEvent(sparkInst: Spark) {
    // SocketIO.emit("spark_birth", (await sparkInst.toCleanJSON()))
    // exclusiveEmit("birth", sparkInst.requestId, (await sparkInst.toCleanJSON()))
    pushEvent(sparkInst.requestId, "birth", (await sparkInst.toCleanJSON()))
  }

  @AfterDestroy
  static async fireNullEvent(sparkInst: Spark) {
    // SocketIO.emit("spark_birth", (await sparkInst.toCleanJSON()))
    // exclusiveEmit("birth", sparkInst.requestId, (await sparkInst.toCleanJSON()))
    pushEvent(sparkInst.requestId, "null", (await sparkInst.toCleanJSON(true)))
  }
}