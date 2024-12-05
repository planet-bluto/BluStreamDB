import { Snowflake } from '@sapphire/snowflake';
import { Table, Column, Model, BelongsTo, ForeignKey, HasMany, BelongsToMany, AfterSave, AfterCreate, AfterUpdate } from 'sequelize-typescript';

import { ChargeType, ChargeTypeInfo } from '../types/charge_type';

const snowflake = new Snowflake(SNOWFLAKE_EPOCH);

import Spark from './Spark';
import Stream from './Stream';
import ChargeStream from './ChargeStream';
import Chatter from './Chatter';

import { SocketIO } from '../modules/server';
// import request from 'sync-request';
import { pushEvent } from '../modules/socket';
import { EVOLVE_AMOUNT } from '../types/charge_presets';

@Table
export default class Charge extends Model {
  @Column({ primaryKey: true })
  id: string = String(snowflake.generate());

  @Column
  requestId: string;



  @ForeignKey(() => Spark)
  @Column
  sparkId: string;

  @BelongsTo(() => Spark, {onDelete: "CASCADE", onUpdate: "CASCADE", hooks: true})
  spark: Spark;



  @BelongsToMany(() => Stream, {through: () => ChargeStream, onDelete: "CASCADE", onUpdate: "CASCADE", hooks: true})
  streams: Stream[];
  


  @Column
  type: ChargeType;

  @Column
  amount: number;

  @AfterCreate
  static async fireSocketEvent(chargeInst: Charge) {
    let jsonObj = chargeInst.toJSON()
    jsonObj["color"] = ChargeTypeInfo[chargeInst.type].color
    
    let thisSpark = await Spark.findByPk(chargeInst.sparkId)
    
    pushEvent(jsonObj.requestId, "charge", (await thisSpark?.toCleanJSON()), jsonObj)
  }

  @AfterCreate
  static async fireEvolveEvent(chargeInst: Charge) {
    let sparkInst = await Spark.findByPk(chargeInst.sparkId)

    if (sparkInst) {
      let total_charge = await sparkInst.totalCharge()
      print("TOTAL CHARGE: ", total_charge)
      if ((!sparkInst.evolved) && (total_charge >= EVOLVE_AMOUNT)) {
        await sparkInst.update({evolved: true})
        let jsonSpark = (await sparkInst.toCleanJSON())
        pushEvent(chargeInst.requestId, "evolve", jsonSpark)
      }
    }
  }
}